import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CLAUDE_MODEL } from "../../api/_lib/claude-model.js";

const client = new Anthropic();

// Mirrors the Insights Log data model in the real Care Co. app (Care Portal
// screen): a clinical headline + detail body, tagged with a category and
// severity, not a generic type/mood pair - see AppPreview.tsx.
const CareItemSchema = z.object({
  category: z.literal("care"),
  sourceMessageIndex: z.number().describe("The #index of the message this came from"),
  insightCategory: z.enum(["Safety", "Sleep / Circadian", "Cognitive", "Medication", "Social", "Positive"]),
  severity: z.enum(["High", "Medium", "Low", "Positive"]),
  title: z.string().describe("Short clinical-style headline, e.g. 'Unsupervised kitchen use'"),
  body: z
    .string()
    .describe("1-2 sentence third-person detail a clinician would want, supporting information not a diagnosis"),
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
  dueTime: z
    .string()
    .nullable()
    .describe("24-hour HH:MM only if a specific time is explicitly stated in the conversation - never invent one"),
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
Family members share messages, photos, and voice notes. Attachments appear inline as
bracketed tags, not real analysis of the file:
- "[Photo: <caption>]" or "[Photo attached, no caption]" - you have not seen the
  photo. If a caption is present, use only that; if not, you may note a photo was
  shared but never invent what it shows.
- "[Video: <caption>]" or "[Video attached, no caption]" - same rule as photos.
- "[Voice note attached - not transcribed]", sometimes with a caption - you do not
  know what was said. Never invent voice note content. Only extract anything from a
  voice note when OTHER messages nearby in the conversation react to, describe, or
  quote what was said in text - then attribute the resulting item to whatever those
  reactions actually say, not to the voice note itself.

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

1. "care" - a clinically-relevant observation about ${lovedOneName}, written like a
   note a family carer would flag for her clinician: confusion, memory lapses,
   safety incidents, sleep disruption, medication issues, social/emotional
   presentation, or a clearly positive moment worth noting. Never infer a medical
   diagnosis or conclusion the message doesn't state - report only what was
   observed. Write "title" as a short clinical-style headline (like a chart note),
   and "body" as 1-2 sentences of supporting detail, third person.
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
Never invent details the conversation doesn't support.

"insightCategory" (care items only) must be exactly one of: Safety, Sleep / Circadian,
Cognitive, Medication, Social, Positive - never invent another label. Use "Medication"
for medication/pharmacy events, "Positive" for a clearly good moment. "severity" (care
items only) must be exactly one of: High, Medium, Low, Positive - "Positive" is both
the category and severity for a good-news item; otherwise judge severity by how
concerning the observation is, never invent another word. "dueTime" (calendar items
only) must be a literal 24-hour HH:MM string or null - only when the conversation
states a specific time, never estimated or invented.`;
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

  const request = {
    model: CLAUDE_MODEL,
    // Sonnet 5 runs adaptive thinking at effort "high" by default when
    // neither is set - full reasoning depth for what's a fast, bounded
    // classification pass over a small chunk. That default is almost
    // certainly the dominant cost in the ~20-40s per-batch latency seen in
    // production, well above what concurrency alone can fix. "low" is the
    // documented setting for classification/extraction workloads.
    // max_tokens was also sized for arbitrarily large day-chunks in the CLI
    // path; 4096 is still generous headroom for this schema's short,
    // per-item summaries.
    max_tokens: 4096,
    output_config: {
      effort: "low" as const,
      format: zodOutputFormat(ClassificationResultSchema),
    },
    system: systemPrompt(lovedOneName, lovedOneAliases),
    messages: [{ role: "user" as const, content: transcript }],
  };

  try {
    const response = await client.messages.parse(request);
    return response.parsed_output?.items ?? [];
  } catch (err) {
    // Seen in production: the model occasionally emits a "type"/"mood" value
    // outside the fixed enum (e.g. inventing one rather than picking a listed
    // option), which fails Zod validation even under structured outputs.
    // That's a stochastic slip, not a systematic prompt problem, so one retry
    // is the fix rather than a schema/prompt change.
    console.warn("classifyChunk: retrying after structured-output validation failure", err);
    const response = await client.messages.parse(request);
    return response.parsed_output?.items ?? [];
  }
}
