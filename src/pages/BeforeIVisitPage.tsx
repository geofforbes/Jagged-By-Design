import { useState } from "react";
import { generateBeforeIVisitBriefing } from "../lib/api";
import type { BeforeIVisitResponse } from "../types";
import { lovedOne } from "../data/lovedOne";

export function BeforeIVisitPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [briefing, setBriefing] = useState<BeforeIVisitResponse | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setBriefing(null);
    try {
      const response = await generateBeforeIVisitBriefing();
      setBriefing(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Before I Visit</h1>
        <p className="mt-1 text-sm text-ink-700">
          A warm catch-up before you see {lovedOne.preferredName} — what's happened, what she's
          enjoyed, and a couple of gentle ideas for the visit.
        </p>
      </div>

      {!briefing && !loading && (
        <button
          type="button"
          onClick={generate}
          className="rounded-2xl bg-coral-500 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-coral-600"
        >
          Generate my briefing
        </button>
      )}

      {loading && (
        <div className="rounded-2xl bg-white p-6 text-center text-ink-700 shadow-sm">
          Putting together a briefing from recent updates…
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-coral-300 bg-coral-50 p-4 text-sm text-coral-700">
          {error}
        </div>
      )}

      {briefing && !loading && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-coral-600">
              Before you see {lovedOne.preferredName}
            </p>
            <p className="mt-3 whitespace-pre-line text-lg leading-relaxed text-ink-900">
              {briefing.briefing}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-sage-300 bg-sage-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">Try</p>
              <p className="mt-1 text-ink-800">{briefing.tryPrompt}</p>
            </div>
            <div className="rounded-2xl border border-warm-200 bg-warm-100 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-600">
                Maybe avoid for now
              </p>
              <p className="mt-1 text-ink-800">{briefing.avoidPrompt}</p>
            </div>
          </div>

          {briefing.citations.length > 0 && (
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-sage-600">
                Based on
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-700">
                {briefing.citations.map((c) => (
                  <li key={c.entryId}>{c.title}</li>
                ))}
              </ul>
            </div>
          )}

          <button
            type="button"
            onClick={generate}
            className="text-sm font-semibold text-coral-600 hover:underline"
          >
            Regenerate
          </button>
        </div>
      )}
    </div>
  );
}
