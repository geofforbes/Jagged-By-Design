import type { AskResponse, BeforeIVisitResponse, KnowledgeEntry } from "../types";
import { lovedOne } from "../data/lovedOne";
import { retrieveEntries, recentEntries } from "./retrieval";

async function postJson<T>(url: string, payload: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}) as { error?: string });
    throw new Error(body.error || `Request to ${url} failed (${res.status})`);
  }
  return res.json();
}

export async function askKnowledgeBase(
  question: string,
  entries: KnowledgeEntry[],
): Promise<AskResponse> {
  const relevant = retrieveEntries(entries, question);
  return postJson<AskResponse>("/api/ask", { question, entries: relevant });
}

/**
 * The auto-loaded "today's picture" status card in Care Co. — same Ask
 * pipeline, but with a fixed prompt over just the last couple of weeks
 * rather than a family member's own question.
 */
export async function getStatusSummary(entries: KnowledgeEntry[]): Promise<AskResponse> {
  const relevant = recentEntries(entries, 14);
  return postJson<AskResponse>("/api/ask", {
    question:
      "How has she been doing recently? Give a short, warm 2-3 sentence status update, as if catching up a family member who's been away for a couple of weeks.",
    entries: relevant,
  });
}

export async function generateBeforeIVisitBriefing(
  entries: KnowledgeEntry[],
): Promise<BeforeIVisitResponse> {
  const relevant = recentEntries(entries, 21);
  return postJson<BeforeIVisitResponse>("/api/before-i-visit", {
    personName: lovedOne.preferredName,
    entries: relevant,
  });
}
