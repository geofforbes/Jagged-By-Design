import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { askKnowledgeBase, getStatusSummary } from "../lib/api";
import { entries } from "../data/entries";
import { lovedOne } from "../data/lovedOne";
import type { AskResponse } from "../types";
import { CONTENT_KIND_LABEL } from "../lib/labels";

const SUGGESTIONS = [
  "When did we last see her?",
  "What was she last chatting about?",
  "What are good questions to ask her?",
  "When's she free next?",
];

const recentMoments = [...entries]
  .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())
  .slice(0, 3);

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function HomePage() {
  const [status, setStatus] = useState<AskResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);

  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<AskResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatusLoading(true);
    getStatusSummary()
      .then((res) => {
        if (!cancelled) setStatus(res);
      })
      .catch((err) => {
        if (!cancelled) setStatusError(err instanceof Error ? err.message : "Couldn't load a status update.");
      })
      .finally(() => {
        if (!cancelled) setStatusLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function runAsk(q: string) {
    if (!q.trim() || askLoading) return;
    setAskLoading(true);
    setAskError(null);
    setAnswer(null);
    try {
      setAnswer(await askKnowledgeBase(q));
    } catch (err) {
      setAskError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setAskLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <img
          src={lovedOne.photoUrl}
          alt={lovedOne.name}
          className="h-12 w-12 rounded-full object-cover ring-2 ring-coral-200"
        />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">
            How {lovedOne.preferredName} is doing
          </p>
          <p className="font-display text-lg font-semibold text-ink-900">Today</p>
        </div>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm">
        {statusLoading && (
          <div className="space-y-2 animate-pulse">
            <div className="h-3 w-3/4 rounded bg-warm-100" />
            <div className="h-3 w-full rounded bg-warm-100" />
            <div className="h-3 w-2/3 rounded bg-warm-100" />
          </div>
        )}

        {!statusLoading && statusError && (
          <p className="text-sm text-coral-700">{statusError}</p>
        )}

        {!statusLoading && status && (
          <>
            <p className="leading-relaxed text-ink-900">{status.answer}</p>
            {status.citations.length > 0 && (
              <p className="mt-3 text-xs text-ink-500">
                Based on {status.citations.length} recent update
                {status.citations.length === 1 ? "" : "s"} from the family and carers.
              </p>
            )}
          </>
        )}
      </section>

      <section className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            runAsk(question);
          }}
          className="flex flex-col gap-2 rounded-2xl bg-white p-3 shadow-sm"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about her visits, mood, memories…"
            className="rounded-xl border border-warm-200 px-4 py-2.5 text-ink-900 outline-none focus:border-coral-400"
          />
          <button
            type="submit"
            disabled={askLoading || !question.trim()}
            className="rounded-xl bg-coral-500 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-coral-600 disabled:opacity-50"
          >
            {askLoading ? "Thinking…" : "Ask"}
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

        {askError && (
          <div className="rounded-2xl border border-coral-300 bg-coral-50 p-4 text-sm text-coral-700">
            {askError}
          </div>
        )}

        {answer && (
          <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-ink-900">{answer.answer}</p>
            {answer.citations.length > 0 && (
              <ul className="space-y-1.5">
                {answer.citations.map((c) => (
                  <li key={c.entryId} className="flex items-center gap-2 text-sm text-ink-700">
                    <span className="rounded-full bg-warm-100 px-2 py-0.5 text-xs font-semibold text-ink-700">
                      {CONTENT_KIND_LABEL[c.contentKind]}
                    </span>
                    {c.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink-900">Recent moments</h2>
          <Link to="/timeline" className="text-sm font-semibold text-coral-600">
            See all
          </Link>
        </div>
        <div className="space-y-2">
          {recentMoments.map((entry) => (
            <Link
              key={entry.id}
              to="/timeline"
              className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">{entry.title}</p>
                <p className="truncate text-xs text-ink-700">{entry.contributor}</p>
              </div>
              <span className="shrink-0 text-xs text-ink-500">{formatDate(entry.occurredAt)}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
