import { useEffect, useRef, useState } from "react";
import { useEntries } from "../context/EntriesContext";
import { askKnowledgeBase, generateBeforeIVisitBriefing, getStatusSummary } from "../lib/api";
import { CONTENT_KIND_LABEL } from "../lib/labels";
import type { AskResponse, BeforeIVisitResponse, HighlightTone } from "../types";

const TONE_ICON: Record<HighlightTone, string> = { positive: "🌸", practical: "🕐", caution: "⚠️" };

type ChatMsg =
  | { id: number; role: "user"; text: string }
  | { id: number; role: "ai"; kind: "status"; status: "loading" | "done" | "error"; data?: AskResponse; error?: string }
  | { id: number; role: "ai"; kind: "briefing"; status: "loading" | "done" | "error"; data?: BeforeIVisitResponse; error?: string }
  | { id: number; role: "ai"; kind: "text"; status: "loading" | "done" | "error"; text?: string; citations?: AskResponse["citations"]; error?: string };

const quickChips = [
  { label: "🚶 Before I visit", action: "visit" },
  { label: "💛 What's she enjoying?", action: "enjoying" },
  { label: "😔 Any worries?", action: "worries" },
  { label: "💊 Medication", action: "meds" },
] as const;

const actionQuestions: Record<string, string> = {
  enjoying: "What has she really been enjoying lately?",
  worries: "Has anything been making her anxious or worrying recently?",
  meds: "When was her medication last collected, and is anything due soon?",
};

const wellbeingNudges = [
  "Hearing checks are worth doing for the whole family, not just as we get older — worth booking one if it's been a while.",
  "Staying socially connected and keeping up regular sleep supports memory health at any age, for everyone in the circle.",
  "If you've noticed changes in your own memory or concentration lately, mentioning it to a GP is a normal, sensible thing to do — not a big deal.",
];

function WellbeingCard({ onDismiss }: { onDismiss: () => void }) {
  const nudge = wellbeingNudges[new Date().getDate() % wellbeingNudges.length];
  return (
    <div className="fade-in rounded-2xl p-4" style={{ background: "rgba(123,106,164,0.08)", border: "1px solid rgba(123,106,164,0.25)" }}>
      <div className="mb-1.5 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--purple)" }}>
          For you &amp; the family circle
        </p>
        <button onClick={onDismiss} className="text-xs text-muted-foreground">✕</button>
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--secondary-foreground)" }}>{nudge}</p>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-1 py-1">
      {[0, 1, 2].map((i) => (
        <div key={i} className="dot-bounce h-2 w-2 rounded-full" style={{ background: "var(--muted-foreground)", animationDelay: `${i * 0.18}s` }} />
      ))}
    </div>
  );
}

function StatusCard({ msg }: { msg: Extract<ChatMsg, { kind: "status" }> }) {
  return (
    <div className="rounded-2xl bg-white p-4" style={{ boxShadow: "0 1px 6px rgba(44,40,37,0.07)" }}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>
        Today's picture
      </p>
      {msg.status === "loading" && (
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      )}
      {msg.status === "error" && <p className="text-sm text-accent">{msg.error}</p>}
      {msg.status === "done" && msg.data && (
        <>
          <p className="text-sm leading-relaxed text-foreground">{msg.data.answer}</p>
          {msg.data.citations.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Based on {msg.data.citations.length} recent update{msg.data.citations.length === 1 ? "" : "s"}.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function BriefingCard({ msg }: { msg: Extract<ChatMsg, { kind: "briefing" }> }) {
  if (msg.status === "loading") {
    return (
      <div className="rounded-2xl bg-white p-4" style={{ boxShadow: "0 1px 6px rgba(44,40,37,0.07)" }}>
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-2/3 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-5/6 rounded bg-muted" />
        </div>
      </div>
    );
  }
  if (msg.status === "error" || !msg.data) {
    return (
      <div className="rounded-2xl bg-white p-4 text-sm text-accent" style={{ boxShadow: "0 1px 6px rgba(44,40,37,0.07)" }}>
        {msg.error}
      </div>
    );
  }

  const { summary, highlights, starters, avoid, citations } = msg.data;

  return (
    <div className="fade-in overflow-hidden rounded-2xl" style={{ background: "white", boxShadow: "0 2px 10px rgba(44,40,37,0.09)" }}>
      <div className="px-4 pb-3.5 pt-4" style={{ background: "var(--secondary)", borderBottom: "1px solid rgba(74,123,106,0.25)" }}>
        <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--primary)" }}>Before you visit</p>
        <h3 className="font-serif text-base font-semibold text-foreground">Visiting Margaret today</h3>
      </div>
      <div className="space-y-4 px-4 py-3.5">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-foreground">How she's been</p>
          <p className="text-xs leading-relaxed text-secondary-foreground">{summary}</p>
        </div>

        {highlights.length > 0 && (
          <div className="space-y-2">
            {highlights.map((h) => (
              <div key={h.label} className="flex items-start gap-2">
                <span className="mt-0.5 flex-shrink-0 text-base leading-none">{TONE_ICON[h.tone]}</span>
                <div>
                  <p className="text-xs font-semibold text-foreground">{h.label}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{h.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {starters.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold text-foreground">Conversation starters</p>
            <div className="space-y-2">
              {starters.map((s) => (
                <p key={s} className="border-l-2 pl-3 font-serif text-xs italic leading-relaxed" style={{ color: "var(--primary)", borderColor: "var(--primary)" }}>
                  "{s}"
                </p>
              ))}
            </div>
          </div>
        )}

        {avoid.length > 0 && (
          <div>
            <p className="mb-1.5 text-xs font-semibold" style={{ color: "var(--accent)" }}>⚠ Keep in mind</p>
            <div className="space-y-1.5">
              {avoid.map((a) => (
                <p key={a} className="text-xs leading-relaxed" style={{ color: "#8B5E4E" }}>{a}</p>
              ))}
            </div>
          </div>
        )}

        {citations.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Based on {citations.length} recorded update{citations.length === 1 ? "" : "s"}.
          </p>
        )}
      </div>
    </div>
  );
}

export function CareCoPage() {
  const { entries } = useEntries();
  const [msgs, setMsgs] = useState<ChatMsg[]>([{ id: 1, role: "ai", kind: "status", status: "loading" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [showWellbeing, setShowWellbeing] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const statusLoaded = useRef(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, 50);
  };

  useEffect(() => {
    if (statusLoaded.current) return;
    statusLoaded.current = true;
    getStatusSummary(entries)
      .then((data) => {
        setMsgs((prev) =>
          prev.map((m) => (m.role === "ai" && m.kind === "status" ? { ...m, status: "done" as const, data } : m)),
        );
      })
      .catch((err) => {
        const error = err instanceof Error ? err.message : "Something went wrong.";
        setMsgs((prev) =>
          prev.map((m) => (m.role === "ai" && m.kind === "status" ? { ...m, status: "error" as const, error } : m)),
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [msgs, typing]);

  async function sendMsg(displayText: string, action?: string) {
    const userMsg: ChatMsg = { id: Date.now(), role: "user", text: displayText };
    setMsgs((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    try {
      if (action === "visit") {
        const data = await generateBeforeIVisitBriefing(entries);
        setMsgs((prev) => [...prev, { id: Date.now() + 1, role: "ai", kind: "briefing", status: "done", data }]);
      } else {
        const question = action ? actionQuestions[action] : displayText;
        const data = await askKnowledgeBase(question, entries);
        setMsgs((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "ai", kind: "text", status: "done", text: data.answer, citations: data.citations },
        ]);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : "Something went wrong.";
      if (action === "visit") {
        setMsgs((prev) => [...prev, { id: Date.now() + 1, role: "ai", kind: "briefing", status: "error", error }]);
      } else {
        setMsgs((prev) => [...prev, { id: Date.now() + 1, role: "ai", kind: "text", status: "error", error }]);
      }
    } finally {
      setTyping(false);
    }
  }

  const showChips = msgs.length <= 1;

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-shrink-0 items-center gap-3 px-5 pb-3 pt-4" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl font-bold text-white" style={{ background: "var(--primary)" }}>
          <span style={{ fontSize: 18, lineHeight: 1 }}>◆</span>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-semibold text-foreground">Care Co.</span>
            <span className="rounded-full px-1.5 py-0.5 text-xs font-semibold" style={{ background: "#E8F5E9", color: "#2E7D32" }}>● Live</span>
          </div>
          <p className="text-xs text-muted-foreground">Caring for Margaret</p>
        </div>
      </div>

      <div ref={scrollRef} className="hide-scroll flex-1 space-y-3 overflow-y-auto px-4 py-3">
        {showWellbeing && <WellbeingCard onDismiss={() => setShowWellbeing(false)} />}
        {msgs.map((msg) => {
          if (msg.role === "ai") {
            return (
              <div key={msg.id} className="fade-in flex items-start gap-2">
                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ background: "var(--primary)", fontSize: 10 }}>◆</div>
                <div className="min-w-0 flex-1">
                  {msg.kind === "status" && <StatusCard msg={msg} />}
                  {msg.kind === "briefing" && <BriefingCard msg={msg} />}
                  {msg.kind === "text" && (
                    <div className="rounded-2xl rounded-tl-sm px-3.5 py-2.5" style={{ background: "white", boxShadow: "0 1px 4px rgba(44,40,37,0.06)" }}>
                      {msg.status === "error" ? (
                        <p className="text-sm text-accent">{msg.error}</p>
                      ) : (
                        <>
                          <p className="text-sm leading-relaxed text-foreground">{msg.text}</p>
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {msg.citations.map((c) => (
                                <span key={c.entryId} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground" title={c.title}>
                                  {CONTENT_KIND_LABEL[c.contentKind]}
                                </span>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }
          return (
            <div key={msg.id} className="fade-in flex justify-end">
              <div className="max-w-[78%] rounded-2xl rounded-tr-sm px-3.5 py-2.5" style={{ background: "var(--primary)" }}>
                <p className="text-sm leading-relaxed text-white">{msg.text}</p>
              </div>
            </div>
          );
        })}

        {typing && (
          <div className="fade-in flex items-center gap-2">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-xl text-white" style={{ background: "var(--primary)", fontSize: 10 }}>◆</div>
            <div className="rounded-2xl rounded-tl-sm px-3.5 py-2" style={{ background: "white", boxShadow: "0 1px 4px rgba(44,40,37,0.06)" }}>
              <TypingDots />
            </div>
          </div>
        )}
      </div>

      {showChips && !typing && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="grid grid-cols-2 gap-2">
            {quickChips.map((c) => (
              <button
                key={c.action}
                onClick={() => sendMsg(c.label, c.action)}
                className="rounded-xl px-3 py-2.5 text-left text-xs font-medium transition-all active:scale-95"
                style={{ background: "var(--secondary)", color: "var(--foreground)" }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-shrink-0 px-4 pb-5 pt-2">
        <div className="flex items-center gap-2 rounded-2xl px-3 py-2" style={{ background: "var(--secondary)" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && input.trim()) sendMsg(input); }}
            placeholder="Ask about Margaret…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <button
            onClick={() => { if (input.trim()) sendMsg(input); }}
            disabled={!input.trim() || typing}
            className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{ background: input.trim() ? "var(--primary)" : "var(--muted-foreground)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
