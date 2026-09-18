import { getAnthropicClient, MODEL } from "./anthropic";
import type { BeforeIVisitResponse, KnowledgeEntry } from "../../src/types";

function formatEntry(e: KnowledgeEntry): string {
  return `[${e.id}] (${e.category}, ${e.occurredAt.slice(0, 10)}, from ${e.contributor}) ${e.title}: ${e.body}`;
}

export async function runBeforeIVisit(params: {
  personName: string;
  entries: KnowledgeEntry[];
}): Promise<BeforeIVisitResponse> {
  const { personName, entries } = params;
  const client = getAnthropicClient();
  const context = entries.map(formatEntry).join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: `You write short, warm "before you visit" briefings for a family member about to see ${personName}, who lives with dementia. Base everything ONLY on the numbered recent entries below — never invent events, moods or clinical conclusions.

Write like a thoughtful relative catching another relative up before a visit: warm, specific, a little tender, never clinical.

Produce:
- A 2-3 sentence summary of how the last couple of weeks have gone.
- 2 to 4 "highlights": short, specific things worth knowing before the visit — who's visited, what ${personName} has enjoyed, and anything that's come up repeatedly and might be worth being gentle about (frame it as something to approach gently, never as a symptom). Tag each highlight's tone as "positive" (something good happened), "practical" (a fact worth knowing, e.g. a visit or errand), or "caution" (something to be gentle about).
- 2 to 3 warm, low-pressure conversation starters, each grounded in something specific from the entries, written as direct quotes the visitor could actually say.
- 1 to 2 things to gently avoid this visit (e.g. testing recall), each a short phrase.

Never state or imply a diagnosis. These are family observations, not clinical findings.

Recent entries:
${context}`,
    messages: [
      { role: "user", content: `Write my before-I-visit briefing for ${personName}.` },
    ],
    tools: [
      {
        name: "provide_briefing",
        description: "Provide the structured before-I-visit briefing.",
        input_schema: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              description: "A warm 2-3 sentence catch-up summary.",
            },
            highlights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string", description: "A short headline, e.g. 'Loved the Greece photographs'." },
                  text: { type: "string", description: "One sentence of detail, grounded in the entries." },
                  tone: { type: "string", enum: ["positive", "practical", "caution"] },
                },
                required: ["label", "text", "tone"],
              },
              description: "2 to 4 specific things worth knowing before the visit.",
            },
            starters: {
              type: "array",
              items: { type: "string" },
              description: "2 to 3 low-pressure conversation starters, written as direct quotes.",
            },
            avoid: {
              type: "array",
              items: { type: "string" },
              description: "1 to 2 short things to gently avoid this visit.",
            },
            citedEntryIds: {
              type: "array",
              items: { type: "string" },
              description: "IDs of entries used to build the briefing.",
            },
          },
          required: ["summary", "highlights", "starters", "avoid", "citedEntryIds"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "provide_briefing" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured briefing.");
  }

  const { summary, highlights, starters, avoid, citedEntryIds } = toolUse.input as {
    summary: string;
    highlights: BeforeIVisitResponse["highlights"];
    starters: string[];
    avoid: string[];
    citedEntryIds: string[];
  };

  const byId = new Map(entries.map((e) => [e.id, e]));
  const citations = citedEntryIds
    .map((id) => byId.get(id))
    .filter((e): e is KnowledgeEntry => !!e)
    .map((e) => ({ entryId: e.id, title: e.title, contentKind: e.contentKind }));

  return { summary, highlights, starters, avoid, citations };
}
