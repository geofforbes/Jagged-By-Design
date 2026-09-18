import { getAnthropicClient, MODEL } from "./anthropic";
import type { AskResponse, KnowledgeEntry } from "../../src/types";

function formatEntry(e: KnowledgeEntry): string {
  return `[${e.id}] (${e.category}, ${e.contentKind}, ${e.occurredAt.slice(0, 10)}, from ${e.contributor} via ${e.source}) ${e.title}: ${e.body}`;
}

export async function runAsk(params: {
  question: string;
  entries: KnowledgeEntry[];
}): Promise<AskResponse> {
  const { question, entries } = params;
  const client = getAnthropicClient();
  const context = entries.map(formatEntry).join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 700,
    system: `You are a warm, careful assistant helping a family understand their loved one's dementia care journey through a shared family knowledge base. Answer the family member's question using ONLY the numbered entries below — never invent events, dates, people or clinical conclusions that aren't in them. If the entries don't cover the question, say so plainly rather than guessing.

Never state or imply a diagnosis or clinical conclusion. You may describe patterns across entries, but always frame them as reported family/carer observations, not medical findings.

Where useful, distinguish a recorded fact/event from a family member's subjective observation, and from your own synthesis across multiple entries.

Knowledge base entries:
${context}`,
    messages: [{ role: "user", content: question }],
    tools: [
      {
        name: "provide_answer",
        description: "Provide the synthesized answer with citations to the source entries used.",
        input_schema: {
          type: "object",
          properties: {
            answer: {
              type: "string",
              description:
                "A warm, concise answer (2-5 sentences) written for a family member, grounded only in the cited entries.",
            },
            citedEntryIds: {
              type: "array",
              items: { type: "string" },
              description: "IDs of the entries (e.g. 'e12') actually used to construct the answer.",
            },
          },
          required: ["answer", "citedEntryIds"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "provide_answer" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured answer.");
  }

  const { answer, citedEntryIds } = toolUse.input as {
    answer: string;
    citedEntryIds: string[];
  };

  const byId = new Map(entries.map((e) => [e.id, e]));
  const citations = citedEntryIds
    .map((id) => byId.get(id))
    .filter((e): e is KnowledgeEntry => !!e)
    .map((e) => ({ entryId: e.id, title: e.title, contentKind: e.contentKind }));

  return { answer, citations };
}
