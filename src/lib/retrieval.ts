import type { KnowledgeEntry } from "../types";

const STOPWORDS = new Set([
  "the", "a", "an", "has", "have", "been", "was", "is", "are", "what",
  "when", "who", "did", "she", "her", "hers", "of", "in", "on", "to",
  "and", "for", "with", "about", "recently", "lately", "anything",
  "made", "making", "this", "that", "up",
]);

function keywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Naive keyword retrieval over the seeded knowledge base, standing in for
 * a real vector/semantic search. Scores each entry by keyword overlap with
 * the query, plus a mild recency boost, and returns the top matches.
 *
 * This is the "R" in retrieval-augmented Ask/Before-I-Visit: we narrow the
 * mock knowledge base down to a relevant slice before ever calling Claude,
 * so the model synthesizes from real seeded entries rather than guessing.
 */
export function retrieveEntries(
  entries: KnowledgeEntry[],
  query: string,
  limit = 12,
): KnowledgeEntry[] {
  const queryWords = keywords(query);
  const now = Date.now();

  const scored = entries.map((entry) => {
    const haystack = keywords(
      [entry.title, entry.body, entry.contributor, entry.category, ...(entry.tags ?? [])].join(" "),
    );
    const overlap = queryWords.filter((w) => haystack.includes(w)).length;
    const ageDays = (now - new Date(entry.occurredAt).getTime()) / 86_400_000;
    const recencyBoost = Math.max(0, 1 - ageDays / 60);
    return { entry, score: overlap * 3 + recencyBoost };
  });

  const withMatches = scored.filter((s) => s.score > 0);
  const pool = withMatches.length > 0 ? withMatches : scored;

  return pool
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.entry)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}

/** Most recent N days of entries, newest first — the input for Before I Visit. */
export function recentEntries(entries: KnowledgeEntry[], days = 21): KnowledgeEntry[] {
  const cutoff = Date.now() - days * 86_400_000;
  return entries
    .filter((e) => new Date(e.occurredAt).getTime() >= cutoff)
    .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());
}
