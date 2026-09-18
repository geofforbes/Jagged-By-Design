import { useState } from "react";
import { generateBeforeIVisitBriefing } from "../lib/api";
import { entries } from "../data/entries";
import { lovedOne } from "../data/lovedOne";
import { formatRelative } from "../lib/format";
import type { BeforeIVisitResponse, HighlightTone } from "../types";

type Step = "prompt" | "loading" | "briefing" | "error";

const TONE_ICON: Record<HighlightTone, string> = {
  positive: "🌸",
  practical: "🕐",
  caution: "💛",
};

const lastPharmacy = [...entries]
  .filter((e) => e.category === "pharmacy")
  .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

const lastVisit = [...entries]
  .filter((e) => e.category === "visit")
  .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime())[0];

export function BeforeIVisitPage() {
  const [step, setStep] = useState<Step>("prompt");
  const [briefing, setBriefing] = useState<BeforeIVisitResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setStep("loading");
    setError(null);
    try {
      const response = await generateBeforeIVisitBriefing();
      setBriefing(response);
      setStep("briefing");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStep("error");
    }
  }

  if (step === "prompt" || step === "error") {
    return (
      <div className="flex h-full flex-col overflow-y-auto px-5 pt-6 pb-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Before I visit
        </p>
        <h2 className="mb-2 font-serif text-2xl text-foreground">
          Get ready to see {lovedOne.preferredName}
        </h2>
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          Circle will put together a short, warm briefing — what's been happening, what she's
          been enjoying, and some gentle ways to start the conversation.
        </p>

        <div className="relative mb-6 overflow-hidden rounded-2xl" style={{ background: "var(--primary)" }}>
          <img
            src={lovedOne.photoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div className="relative p-5">
            <p className="mb-1 text-sm text-white/80">Visiting</p>
            <p className="font-serif text-xl font-semibold text-white">{lovedOne.preferredName}</p>
            <p className="mt-1 text-sm text-white/60">
              {lastVisit ? `Last seen ${formatRelative(lastVisit.occurredAt).toLowerCase()}` : "No recent visits recorded"}
            </p>
          </div>
        </div>

        <div className="mb-8 flex flex-col gap-3">
          {[
            { icon: "🕐", text: "What's happened since you last visited" },
            { icon: "💬", text: "Warm conversation starters" },
            { icon: "💛", text: "What she's been enjoying" },
            { icon: "🤍", text: "Things to approach gently" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-3">
              <span className="w-8 flex-shrink-0 text-xl">{item.icon}</span>
              <p className="text-sm text-secondary-foreground">{item.text}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border p-4 text-sm" style={{ borderColor: "var(--accent)", color: "var(--accent)", background: "rgba(196,113,78,0.08)" }}>
            {error}
          </div>
        )}

        <button
          onClick={handleGenerate}
          className="w-full rounded-2xl py-4 text-sm font-semibold transition-transform active:scale-[0.98]"
          style={{ background: "var(--accent)", color: "var(--accent-foreground)" }}
        >
          Catch me up on {lovedOne.preferredName}
        </button>
      </div>
    );
  }

  if (step === "loading") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-6 px-5">
        <div className="relative h-16 w-16">
          <div
            className="absolute inset-0 animate-spin rounded-full border-4 border-t-transparent"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--primary)" }}
          />
        </div>
        <div className="text-center">
          <p className="mb-1 text-base font-medium text-foreground">Putting together your briefing…</p>
          <p className="text-sm text-muted-foreground">Looking through the circle's recent updates</p>
        </div>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <div className="px-5 pt-6 pb-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
            Before you visit
          </p>
          <button
            onClick={() => setStep("prompt")}
            className="rounded-full px-3 py-1 text-xs"
            style={{ background: "var(--secondary)", color: "var(--muted-foreground)" }}
          >
            Start over
          </button>
        </div>
        <h2 className="font-serif text-2xl leading-snug text-foreground">
          Before you see <em>{lovedOne.preferredName}</em>
        </h2>
      </div>

      <div className="mx-5 mb-4 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm leading-relaxed text-secondary-foreground">{briefing.summary}</p>
      </div>

      <div className="mb-4 px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Things to know
        </p>
        <div className="flex flex-col gap-3">
          {briefing.highlights.map((h) => (
            <div key={h.label} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex-shrink-0 text-2xl">{TONE_ICON[h.tone]}</span>
                <div>
                  <p className="mb-0.5 text-sm font-semibold text-foreground">{h.label}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{h.text}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Try saying
        </p>
        <div className="flex flex-col gap-2">
          {briefing.starters.map((s) => (
            <div
              key={s}
              className="rounded-xl p-3.5"
              style={{ background: "rgba(74,123,106,0.08)", border: "1px solid rgba(74,123,106,0.2)" }}
            >
              <p className="font-serif text-sm italic leading-relaxed" style={{ color: "var(--primary)" }}>
                "{s}"
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4 px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Approach gently
        </p>
        <div className="rounded-2xl p-4" style={{ background: "rgba(196,113,78,0.08)", border: "1px solid rgba(196,113,78,0.2)" }}>
          <ul className="flex flex-col gap-2">
            {briefing.avoid.map((a) => (
              <li key={a} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-sm" style={{ color: "var(--accent)" }}>
                  ·
                </span>
                <p className="text-sm" style={{ color: "var(--accent)" }}>{a}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {lastPharmacy && (
        <div className="px-5">
          <div className="flex items-center gap-3 rounded-xl bg-secondary p-3.5">
            <span className="text-lg">💊</span>
            <p className="text-xs text-muted-foreground">
              Her last pharmacy collection was {formatRelative(lastPharmacy.occurredAt).toLowerCase()}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
