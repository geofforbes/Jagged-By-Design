import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CLAUDE_MODEL } from "../../api/_lib/claude-model.js";

const client = new Anthropic();

const CareItemSchema = z.object({
  category: z.literal("care"),
  sourceMessageIndex: z.number().describe("The #index of the message this came from"),
  type: z.enum(["visit", "observation", "pharmacy", "appointment", "memory"]),
  summary: z.string().describe("One short third-person sentence"),
  mood: z.enum(["positive", "neutral", "negative"]).nullable(),
});

const LifeStoryItemSchema = z.object({
  category: z.literal("life_story"),
  sourceMessageIndex: z.number().describe("The #index of the message this came from"),
  summary: z.string().describe("One short third-person sentence"),
  isHistorical: z
    .boolean()
    .describe("true for a memory from the person's past, false for a present-day moment"),
  eraLabel: z
    .string()
    .nullable()
    .describe("e.g. 'Childhood in Greece, 1960s' - only when isHistorical is true, else null"),
});

const CalendarItemSchema = z.object({
  category: z.literal("calendar"),
  sourceMessageIndex: z.number().describe("The #index of the message this came from"),
  title: z.string(),
  itemType: z.enum(["appointment", "visit", "trip", "task"]),
  dueDate: z
    .string()
    .nullable()
    .describe("ISO date YYYY-MM-DD if a specific date is stated or clearly inferable, else null"),
  notes: z.string().nullable(),
});

const ClassifiedItemSchema = z.discriminatedUnion("category", [
  CareItemSchema,
  LifeStoryItemSchema,
  CalendarItemSchema,
]);

const ClassificationResultSchema = z.object({
  items: z.array(ClassifiedItemSchema),
});

export type ClassifiedItem = z.infer<typeof ClassifiedItemSchema>;

export interface ChunkMessage {
  /** Index within this chunk - echoed back by the model to attribute each item to a message. */
  index: number;
  timestamp: Date;
  sender: string;
  /** Message text, with any attachment already folded in as inline description (see media.ts). */
  text: string;
}

function systemPrompt(lovedOneName: string, aliases: string[]): string {
  const names = [lovedOneName, ...aliases].filter(Boolean).join(", ");
  return `You extract structured information from a family WhatsApp conversation about
${lovedOneName}, a loved one living with dementia. Also known as: ${names || lovedOneName}.
Family members share messages, photos, and voice notes; photos and voice notes have
already been converted to bracketed text descriptions inline, e.g. "[Photo: ...]" or
"[Voice note transcript: ...]".

This is a large family group chat, not a dedicated care channel - most messages are
ordinary family chatter (other people's birthdays, unrelated logistics, jokes) that
has nothing to do with ${lovedOneName}. Only extract an item when the message is
actually about ${lovedOneName} specifically: she is the visitor's destination, the
subject of the observation, present in a shared photo, or the memory concerns her
life. A message about someone else's birthday, an unrelated trip, or general group
banter is not an item, even if a family member appears in it - skip it entirely.

Classify each relevant piece of conversation into one or more of three categories.
A single message can produce multiple items across categories (e.g. "Taking Mum to
Dr. Patel Tuesday, she's forgetting her pills" is both a "care" observation about
forgetfulness AND a "calendar" appointment).

1. "care" - dementia-relevant observations about ${lovedOneName}: mood, confusion,
   memory, good/bad days, eating, sleeping, medication/pharmacy events, appointments
   that already happened, visits to her. Never infer a medical diagnosis or
   conclusion the message doesn't state.
2. "life_story" - day-to-day moments involving ${lovedOneName} worth remembering
   (not clinical), and memories or life history about her surfaced in conversation
   (her childhood, past places, relationships). Set isHistorical true only for the
   latter, with a short eraLabel.
3. "calendar" - upcoming commitments involving ${lovedOneName} (visits to her, trips
   with her, appointments not yet happened) and to-dos concerning her (e.g. "she
   needs new shoes").

Skip pure logistics with no care/life/calendar content (e.g. "ok", "👍", "see you then"
with no other detail), and skip anything not actually about ${lovedOneName} per above.
Every item must include sourceMessageIndex, the #N tag of the message it came from.
Never invent details the conversation doesn't support.`;
}

/**
 * Classifies one chunk of chronological conversation (e.g. one day) into
 * care/life-story/calendar items. Returns an empty array for chunks with no
 * relevant content - callers should expect many chunks to yield nothing.
 */
export async function classifyChunk(
  messages: ChunkMessage[],
  lovedOneName: string,
  lovedOneAliases: string[],
): Promise<ClassifiedItem[]> {
  if (messages.length === 0) {
    return [];
  }

  const transcript = messages
    .map((m) => `[#${m.index}] ${m.timestamp.toISOString()} ${m.sender}: ${m.text}`)
    .join("\n");

  const response = await client.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 16000,
    system: systemPrompt(lovedOneName, lovedOneAliases),
    messages: [{ role: "user", content: transcript }],
    output_config: {
      format: zodOutputFormat(ClassificationResultSchema),
    },
  });

  return response.parsed_output?.items ?? [];
}
