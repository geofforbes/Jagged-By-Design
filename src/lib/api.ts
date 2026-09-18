import type { AskResponse, BeforeIVisitResponse } from "../types";
import { entries } from "../data/entries";
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

export async function askKnowledgeBase(question: string): Promise<AskResponse> {
  const relevant = retrieveEntries(entries, question);
  return postJson<AskResponse>("/api/ask", { question, entries: relevant });
}

export async function generateBeforeIVisitBriefing(): Promise<BeforeIVisitResponse> {
  const relevant = recentEntries(entries, 21);
  return postJson<BeforeIVisitResponse>("/api/before-i-visit", {
    personName: lovedOne.preferredName,
    entries: relevant,
  });
}
