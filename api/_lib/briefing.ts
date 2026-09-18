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
    max_tokens: 800,
    system: `You write short, warm "before you visit" briefings for a family member about to see ${personName}, who lives with dementia. Base everything ONLY on the numbered recent entries below — never invent events, moods or clinical conclusions.

Write like a thoughtful relative catching another relative up before a visit: warm, specific, a little tender, never clinical. Mention who has visited recently and what ${personName} seems to have enjoyed, and gently flag anything that's come up repeatedly and might be sensitive (e.g. confusion about someone's whereabouts) — frame it as something to be gentle about, never as a symptom.

Never state or imply a diagnosis. These are family observations, not clinical findings.

Also give one warm, low-pressure conversation starter grounded in something specific from the entries, and one thing to gently avoid this visit (e.g. testing recall), each with a brief reason drawn from the entries.

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
            briefing: {
              type: "string",
              description: "The warm 3-5 sentence catch-up briefing.",
            },
            tryPrompt: {
              type: "string",
              description: "One specific, low-pressure conversation starter to try.",
            },
            avoidPrompt: {
              type: "string",
              description: "One thing to gently avoid this visit, with a brief reason.",
            },
            citedEntryIds: {
              type: "array",
              items: { type: "string" },
              description: "IDs of entries used to build the briefing.",
            },
          },
          required: ["briefing", "tryPrompt", "avoidPrompt", "citedEntryIds"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "provide_briefing" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured briefing.");
  }

  const { briefing, tryPrompt, avoidPrompt, citedEntryIds } = toolUse.input as {
    briefing: string;
    tryPrompt: string;
    avoidPrompt: string;
    citedEntryIds: string[];
  };

  const byId = new Map(entries.map((e) => [e.id, e]));
  const citations = citedEntryIds
    .map((id) => byId.get(id))
    .filter((e): e is KnowledgeEntry => !!e)
    .map((e) => ({ entryId: e.id, title: e.title, contentKind: e.contentKind }));

  return { briefing, tryPrompt, avoidPrompt, citations };
}
