import { useState } from "react";
import { useEntries } from "../context/EntriesContext";
import type { KnowledgeEntry } from "../types";

const waGreenDark = "#075E54";
const waBg = "#ECE5DD";

const senderColors: Record<string, string> = { Sarah: "#E57373", Pete: "#4FC3F7", Ali: "#81C784", Holly: "#FFD54F" };

const waThread = [
  { id: 1, sender: "Sarah", text: "Just leaving now, be with Mum in 10 mins ☕", time: "9:58", me: false },
  { id: 2, sender: "Pete", text: "Thanks Sarah — she was asking about you this morning already 😊", time: "9:59", me: false },
  { id: 3, sender: "Me", text: "Morning all — did anyone remind her about the Cork photo we promised to find?", time: "10:02", me: true },
  { id: 4, sender: "Sarah", text: "Yes! I brought it — she's going to love it. Also bringing her favourite biscuits 🍪", time: "10:05", me: false },
  { id: 5, sender: "Sarah", text: "Just arrived. She's sitting in the garden already, kettle on ☀️ We had a lovely long chat about the house in Cork — she was SO clear today. Talked about the lane behind the house, her mother's dahlias. I stayed an extra 30 mins because she was so animated 🌸", time: "10:47", me: false },
  { id: 6, sender: "Pete", text: "That's brilliant news ❤️", time: "10:49", me: false },
  { id: 7, sender: "Ali", text: "Ah that's made my day. Save the dahlia detail — definitely a memory worth adding", time: "10:51", me: false },
];

const observations = [
  "Clear, engaged conversation lasting ~90 minutes",
  "Strong long-term memory — Cork house, mother's garden, dahlias",
  "Positive mood throughout; animated and warm",
  "Sarah stayed an extra 30 mins due to quality of engagement",
];

const checkinTags = ["garden", "Cork", "reminiscing", "dahlias", "lucid"];

function buildCheckinEntry(): KnowledgeEntry {
  const now = new Date().toISOString();
  return {
    id: `wa-${Date.now()}`,
    category: "visit",
    contentKind: "family-observation",
    occurredAt: now,
    recordedAt: now,
    contributor: "Sarah",
    source: "whatsapp",
    visibility: "family",
    title: "Happy — bright morning",
    body: "Sarah visited Margaret this morning for coffee in the garden. The conversation was notably lucid — Margaret spoke in vivid detail about the house in Cork and her mother's dahlias. Sarah stayed an extra 30 minutes because she was so animated.",
    tags: checkinTags,
  };
}

export function WhatsAppOverlay({ onClose }: { onClose: () => void }) {
  const { addEntry } = useEntries();
  const [phase, setPhase] = useState<"thread" | "checkin" | "saved">("thread");

  function handleSave() {
    addEntry(buildCheckinEntry());
    setPhase("saved");
    setTimeout(onClose, 900);
  }

  return (
    <div className="absolute inset-0 z-50 flex flex-col" style={{ background: "rgba(18,12,8,0.70)" }} onClick={onClose}>
      <div className="flex-1" />
      <div
        className="sheet-enter flex flex-col overflow-hidden rounded-t-3xl"
        style={{ background: "var(--background)", maxHeight: "91%" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-shrink-0 justify-center pb-1 pt-3">
          <div className="h-1 w-9 rounded-full" style={{ background: "#CDC6BE" }} />
        </div>

        {phase === "thread" && (
          <>
            <div className="flex flex-shrink-0 items-center gap-3 px-4 pb-3 pt-1" style={{ background: waGreenDark }}>
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ background: "#7CB9B0" }}>
                M
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Margaret's Care Circle</p>
                <p className="text-xs" style={{ color: "rgba(255,255,255,0.65)" }}>Sarah, Pete, Ali, Holly, Janet</p>
              </div>
              <button onClick={onClose} className="px-1 text-xl leading-none text-white/60">✕</button>
            </div>

            <div className="hide-scroll flex-1 space-y-2 overflow-y-auto px-3 py-3" style={{ background: waBg }}>
              {waThread.map((msg) => (
                <div key={msg.id} className={`flex ${msg.me ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-[80%]">
                    {!msg.me && (
                      <p className="mb-0.5 ml-1 text-xs font-semibold" style={{ color: senderColors[msg.sender] || "#9B9490" }}>
                        {msg.sender}
                      </p>
                    )}
                    <div
                      className="rounded-2xl px-3 py-2"
                      style={{
                        background: msg.me ? "#DCF8C6" : "white",
                        borderRadius: msg.me ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      }}
                    >
                      <p className="text-xs leading-relaxed" style={{ color: "var(--foreground)" }}>{msg.text}</p>
                      <p className="mt-0.5 text-right text-muted-foreground" style={{ fontSize: 10 }}>{msg.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex-shrink-0 px-4 py-4" style={{ borderTop: "1px solid var(--border)" }}>
              <div className="mb-3 rounded-2xl p-3" style={{ background: "var(--secondary)" }}>
                <div className="mb-1 flex items-center gap-2">
                  <span style={{ fontSize: 14 }}>◆</span>
                  <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>Care Co. detected a check-in</p>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--secondary-foreground)" }}>
                  Sarah visited Margaret this morning. A check-in can be created from this conversation.
                </p>
              </div>
              <button
                onClick={() => setPhase("checkin")}
                className="w-full rounded-2xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: "var(--primary)" }}
              >
                Create check-in with Care Co.
              </button>
            </div>
          </>
        )}

        {phase === "checkin" && (
          <>
            <div className="flex flex-shrink-0 items-center gap-3 px-5 pb-3 pt-1" style={{ borderBottom: "1px solid var(--border)" }}>
              <button onClick={() => setPhase("thread")} className="text-sm" style={{ color: "var(--primary)" }}>← Back</button>
              <p className="flex-1 text-center font-serif text-sm font-semibold text-foreground">Review check-in</p>
              <div className="w-12" />
            </div>

            <div className="hide-scroll flex-1 overflow-y-auto px-4 py-3">
              <div className="fade-in mb-3 overflow-hidden rounded-2xl" style={{ background: "white", boxShadow: "0 2px 10px rgba(44,40,37,0.09)" }}>
                <div className="px-4 pb-3 pt-4" style={{ background: "var(--secondary)", borderBottom: "1px solid rgba(74,123,106,0.2)" }}>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "rgba(74,123,106,0.2)", color: "var(--primary)" }}>Visits</span>
                    <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: "#FFF9E6", color: "var(--gold)" }}>Morning Visit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">☀️</span>
                    <div>
                      <p className="font-serif text-sm font-semibold text-foreground">Happy — bright morning</p>
                      <p className="text-xs text-muted-foreground">Today · 10:47 AM</p>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3.5">
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</p>
                  <p className="mb-3 text-sm leading-relaxed text-foreground">
                    Sarah visited Margaret this morning for coffee in the garden. The conversation was notably lucid — Margaret spoke in vivid detail about the house in Cork and her mother's dahlias.
                  </p>
                  <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Observations</p>
                  <ul className="mb-3 space-y-1.5">
                    {observations.map((obs) => (
                      <li key={obs} className="flex gap-2 text-xs leading-relaxed text-secondary-foreground">
                        <span style={{ color: "var(--primary)", flexShrink: 0 }}>·</span>
                        <span>{obs}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-1.5">
                    {checkinTags.map((t) => (
                      <span key={t} className="rounded-full px-2 py-0.5 text-xs" style={{ background: "rgba(74,123,106,0.1)", color: "var(--primary)" }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-shrink-0 gap-2 px-4 pb-5 pt-2">
              <button onClick={onClose} className="flex-1 rounded-2xl py-3 text-sm font-semibold transition-all active:scale-[0.98]" style={{ background: "var(--secondary)", color: "var(--foreground)" }}>
                Edit
              </button>
              <button onClick={handleSave} className="flex-[2] rounded-2xl py-3 text-sm font-semibold text-white transition-all active:scale-[0.98]" style={{ background: "var(--primary)" }}>
                Save to Journey ◆
              </button>
            </div>
          </>
        )}

        {phase === "saved" && (
          <div className="flex flex-col items-center justify-center gap-3 px-5 py-16">
            <span className="text-3xl">✓</span>
            <p className="text-sm font-semibold text-foreground">Saved to Margaret's journey</p>
          </div>
        )}
      </div>
    </div>
  );
}
