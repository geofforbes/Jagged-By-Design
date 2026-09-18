import { getAnthropicClient, MODEL } from "./anthropic";
import type { ClinicalReportResponse, KnowledgeEntry } from "../../src/types";

function formatEntry(e: KnowledgeEntry): string {
  return `[${e.id}] (${e.category}, ${e.occurredAt.slice(0, 10)}, from ${e.contributor} via ${e.source}) ${e.title}: ${e.body}`;
}

export async function runClinicalReport(params: {
  personName: string;
  entries: KnowledgeEntry[];
}): Promise<ClinicalReportResponse> {
  const { personName, entries } = params;
  const client = getAnthropicClient();
  const context = entries.map(formatEntry).join("\n");

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 1200,
    system: `You prepare a concise history log for a clinician, built ONLY from the family- and carer-approved entries below about ${personName}. This supports the clinician's own assessment — it is absolutely NOT a diagnostic tool.

Hard rules, never break these:
- NEVER assign, name, or imply a dementia stage, severity level, or diagnosis (no "mild/moderate/severe", no staging-scale language, no clinical conclusions of any kind).
- Only describe patterns actually present in the entries below, phrased as "family/carers have reported..." or "noted on multiple occasions...". Never invent events not in the entries.
- Frame every safety point as something a clinician may wish to explore or assess, in neutral, non-alarming language — never as an instruction, restriction, or finding of fact.

Produce:
- A 2-3 sentence neutral summary of what the approved history covers (time span, general themes).
- 2-5 "patterns": recurring or notable themes across entries (e.g. a recurring behaviour, a mood trend, a functional change), each with a short label and one sentence of grounded detail.
- 1-4 "safety notes": things a clinician may want to explore for safety or functional assessment purposes (e.g. a change in a specific daily-living skill), each with a short label and one sentence of grounded detail, worded as an observation to consider, not a conclusion.

Approved entries:
${context}`,
    messages: [
      { role: "user", content: `Prepare the clinical history log for ${personName}.` },
    ],
    tools: [
      {
        name: "provide_report",
        description: "Provide the structured clinical report.",
        input_schema: {
          type: "object",
          properties: {
            summary: { type: "string", description: "2-3 sentence neutral summary of the approved history." },
            patterns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  detail: { type: "string" },
                },
                required: ["label", "detail"],
              },
              description: "2-5 recurring or notable themes across the approved entries.",
            },
            safetyNotes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                  detail: { type: "string" },
                },
                required: ["label", "detail"],
              },
              description: "1-4 things worth the clinician's own assessment, neutrally worded.",
            },
            citedEntryIds: {
              type: "array",
              items: { type: "string" },
              description: "IDs of entries used to build the report.",
            },
          },
          required: ["summary", "patterns", "safetyNotes", "citedEntryIds"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "provide_report" },
  });

  const toolUse = response.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured report.");
  }

  const { summary, patterns, safetyNotes, citedEntryIds } = toolUse.input as {
    summary: string;
    patterns: ClinicalReportResponse["patterns"];
    safetyNotes: ClinicalReportResponse["safetyNotes"];
    citedEntryIds: string[];
  };

  const byId = new Map(entries.map((e) => [e.id, e]));
  const citations = citedEntryIds
    .map((id) => byId.get(id))
    .filter((e): e is KnowledgeEntry => !!e)
    .map((e) => ({ entryId: e.id, title: e.title, contentKind: e.contentKind }));

  return { summary, patterns, safetyNotes, citations };
}
