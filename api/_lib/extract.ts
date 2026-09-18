import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { CLAUDE_MODEL } from "./claude-model.js";

const client = new Anthropic();

const ExtractedEventSchema = z.object({
  isRelevant: z
    .boolean()
    .describe(
      "false if the message carries no care-relevant information (pure logistics like 'ok', a sticker, a greeting).",
    ),
  type: z
    .enum(["visit", "observation", "pharmacy", "appointment", "memory"])
    .nullable()
    .describe("null when isRelevant is false"),
  summary: z
    .string()
    .nullable()
    .describe(
      "One short third-person sentence summarizing what happened, e.g. 'Sarah visited and took her for coffee.' Null when isRelevant is false.",
    ),
  mood: z
    .enum(["positive", "neutral", "negative"])
    .nullable()
    .describe("The loved one's apparent mood in this message, if mentioned; otherwise null."),
});

export type ExtractedEvent = z.infer<typeof ExtractedEventSchema>;

const SYSTEM_PROMPT = `You extract structured care information from informal family
WhatsApp messages about a loved one living with dementia. Families share visits,
observations, moods, pharmacy/medication events, appointments, and memories in
casual language. Extract only what the message actually says - never infer a
medical diagnosis or conclusion the message doesn't state. If the message has
no care-relevant content, set isRelevant to false and leave the other fields null.`;

/**
 * Turns one raw WhatsApp message into a structured event, or null if the
 * message has no care-relevant content (e.g. "ok", "👍", small talk).
 */
export async function extractEvent(messageText: string): Promise<ExtractedEvent | null> {
  const response = await client.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: messageText }],
    output_config: {
      format: zodOutputFormat(ExtractedEventSchema),
    },
  });

  const parsed = response.parsed_output;
  if (!parsed || !parsed.isRelevant) {
    return null;
  }
  return parsed;
}
