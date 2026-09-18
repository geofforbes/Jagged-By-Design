import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getStatusSummary } from "../lib/api";
import { entries } from "../data/entries";
import { lovedOne } from "../data/lovedOne";
import { avatarColor } from "../lib/avatarColor";
import { formatRelative } from "../lib/format";
import type { AskResponse } from "../types";

const SUGGESTIONS = [
  "When did we last see her?",
  "What was she last chatting about?",
  "What are good questions to ask her?",
  "When's she free next?",
];

const upcomingVisits = [
  { name: "Ali", day: "Thu", color: "#C4714E" },
  { name: "Pete", day: "Sat", color: "#4A7B6A" },
  { name: "You", day: "Sun", color: "#6B7FD7" },
];

const sortedByDate = [...entries].sort(
  (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
);
const recentUpdates = sortedByDate.slice(0, 3);
const lastVisit = sortedByDate.find((e) => e.category === "visit");
const visitsThisWeek = entries.filter(
  (e) => e.category === "visit" && Date.now() - new Date(e.occurredAt).getTime() < 7 * 86_400_000,
).length;

function todayLabel(): string {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
}

export function HomePage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<AskResponse | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");

  useEffect(() => {
    let cancelled = false;
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

  function askAndGo(q: string) {
    if (!q.trim()) return;
    navigate("/ask", { state: { initialQuestion: q } });
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <div className="px-5 pt-6 pb-4">
        <p className="text-sm font-medium text-muted-foreground">{todayLabel()}</p>
        <h1 className="mt-1 font-serif text-3xl leading-tight text-foreground">
          How {lovedOne.preferredName}'s doing
        </h1>
      </div>

      <div className="mx-5 mb-4 overflow-hidden rounded-2xl relative" style={{ background: "var(--primary)" }}>
        <img
          src={lovedOne.photoUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20"
        />
        <div className="relative p-5">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-white/30">
              <img src={lovedOne.photoUrl} alt={lovedOne.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">Caring for</p>
              <p className="font-serif text-lg font-semibold leading-tight text-white">
                {lovedOne.preferredName}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-1 rounded-xl bg-white/15 p-3">
              <p className="mb-0.5 text-xs text-white/70">Circle of care</p>
              <p className="text-sm font-semibold text-white">{lovedOne.circleOfCare.length} people</p>
            </div>
            <div className="flex-1 rounded-xl bg-white/15 p-3">
              <p className="mb-0.5 text-xs text-white/70">Last visit</p>
              <p className="text-sm font-semibold text-white">
                {lastVisit ? formatRelative(lastVisit.occurredAt) : "—"}
              </p>
            </div>
            <div className="flex-1 rounded-xl bg-white/15 p-3">
              <p className="mb-0.5 text-xs text-white/70">This week</p>
              <p className="text-sm font-semibold text-white">{visitsThisWeek} visits</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-2xl bg-card p-4 shadow-sm">
        {statusLoading && (
          <div className="animate-pulse space-y-2">
            <div className="h-3 w-3/4 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-2/3 rounded bg-muted" />
          </div>
        )}
        {!statusLoading && statusError && <p className="text-sm text-accent">{statusError}</p>}
        {!statusLoading && status && (
          <p className="text-sm leading-relaxed text-secondary-foreground">{status.answer}</p>
        )}
      </div>

      <div className="mx-5 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            askAndGo(question);
          }}
          className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2"
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder={`Ask about ${lovedOne.preferredName}…`}
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </form>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => askAndGo(s)}
              className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Upcoming visits
        </p>
        <div className="flex gap-3">
          {upcomingVisits.map((v) => (
            <div
              key={v.name}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-xl border border-border bg-card p-3"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                style={{ background: v.color }}
              >
                {v.name[0]}
              </div>
              <p className="text-xs font-medium text-foreground">{v.name}</p>
              <p className="text-xs text-muted-foreground">{v.day}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Recent updates
        </p>
        <div className="flex flex-col gap-3">
          {recentUpdates.map((entry) => (
            <div key={entry.id} className="w-full rounded-2xl border border-border bg-card p-4 text-left">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                  style={{ background: avatarColor(entry.contributor) }}
                >
                  {entry.contributor[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{entry.contributor}</p>
                    <p className="text-xs text-muted-foreground">{formatRelative(entry.occurredAt)}</p>
                  </div>
                  <p className="line-clamp-2 text-sm leading-relaxed text-secondary-foreground">
                    {entry.body}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
