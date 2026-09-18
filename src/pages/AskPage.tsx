import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { askKnowledgeBase } from "../lib/api";
import { lovedOne } from "../data/lovedOne";
import type { Citation } from "../types";
import { CONTENT_KIND_LABEL } from "../lib/labels";

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
  citations?: Citation[];
}

const SUGGESTIONS = [
  `What has ${lovedOne.preferredName} been up to this month?`,
  "When did Pete last visit?",
  "Has anything been making her anxious recently?",
  "What has she really been enjoying lately?",
];

export function AskPage() {
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const consumedInitial = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const initial = (location.state as { initialQuestion?: string } | null)?.initialQuestion;
    if (initial && !consumedInitial.current) {
      consumedInitial.current = true;
      send(initial);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = { id: Date.now(), role: "user", text: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const response = await askKnowledgeBase(text);
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, role: "assistant", text: response.answer, citations: response.citations },
      ]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: err instanceof Error ? err.message : "Something went wrong.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  const showSuggestions = messages.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 border-b border-border px-5 pt-6 pb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Ask about {lovedOne.preferredName}
        </p>
        <h2 className="font-serif text-2xl text-foreground">What would you like to know?</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {showSuggestions && (
          <div>
            <p className="mb-4 text-sm text-muted-foreground">
              Ask anything about how {lovedOne.preferredName} is doing. Answers are drawn only
              from what the family and carers have actually recorded — never a diagnosis.
            </p>
            <div className="flex flex-col gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-secondary-foreground transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`mb-4 flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div
                className="mr-2 mt-1 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
              >
                ◆
              </div>
            )}
            <div className="max-w-[82%]">
              <div
                className="rounded-2xl px-4 py-3"
                style={
                  m.role === "user"
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { background: "var(--card)", color: "var(--secondary-foreground)", border: "1px solid var(--border)" }
                }
              >
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
              {m.citations && m.citations.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1.5 px-1">
                  {m.citations.map((c) => (
                    <span
                      key={c.entryId}
                      className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                      title={c.title}
                    >
                      {CONTENT_KIND_LABEL[c.contentKind]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="mb-4 flex justify-start">
            <div
              className="mr-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              ◆
            </div>
            <div className="rounded-2xl border border-border bg-card px-4 py-3">
              <div className="flex h-5 items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-1.5 w-1.5 animate-bounce rounded-full"
                    style={{ background: "var(--muted-foreground)", animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="flex-shrink-0 border-t border-border px-5 pb-5 pt-3">
        <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder={`Ask about ${lovedOne.preferredName}…`}
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full transition-opacity disabled:opacity-40"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
