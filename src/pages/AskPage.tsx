import { useState } from "react";
import { askKnowledgeBase } from "../lib/api";
import type { AskResponse } from "../types";
import { lovedOne } from "../data/lovedOne";

const SUGGESTIONS = [
  `What has ${lovedOne.preferredName} been up to this month?`,
  "When did Pete last visit?",
  "Has anything been making her anxious recently?",
  "What has she really been enjoying lately?",
];

const CONTENT_KIND_LABEL: Record<AskResponse["citations"][number]["contentKind"], string> = {
  fact: "Recorded fact",
  "family-observation": "Family observation",
  "ai-summary": "AI-generated summary",
};

export function AskPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AskResponse | null>(null);

  async function runAsk(q: string) {
    if (!q.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await askKnowledgeBase(q);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Ask about {lovedOne.preferredName}
        </h1>
        <p className="mt-1 text-sm text-ink-700">
          Ask anything about how things have been going. Answers are drawn only from what the
          family and carers have actually recorded — never a diagnosis.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          runAsk(question);
        }}
        className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={`e.g. "${SUGGESTIONS[0]}"`}
          className="flex-1 rounded-xl border border-warm-200 px-4 py-2.5 text-ink-900 outline-none focus:border-coral-400"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="rounded-xl bg-coral-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-coral-600 disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQuestion(s);
              runAsk(s);
            }}
            className="rounded-full bg-warm-100 px-3 py-1.5 text-xs font-medium text-ink-700 hover:bg-warm-200"
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-2xl border border-coral-300 bg-coral-50 p-4 text-sm text-coral-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-ink-900">{result.answer}</p>

          {result.citations.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
                Drawn from
              </p>
              <ul className="mt-2 space-y-1.5">
                {result.citations.map((c) => (
                  <li
                    key={c.entryId}
                    className="flex items-center gap-2 text-sm text-ink-700"
                  >
                    <span className="rounded-full bg-warm-100 px-2 py-0.5 text-xs font-semibold text-ink-700">
                      {CONTENT_KIND_LABEL[c.contentKind]}
                    </span>
                    {c.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
