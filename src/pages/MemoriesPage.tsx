import { useMemo, useState } from "react";
import { useEntries } from "../context/EntriesContext";
import { lovedOne } from "../data/lovedOne";
import { formatRelative } from "../lib/format";
import type { KnowledgeEntry } from "../types";

const AVATAR_ROTATION = ["var(--primary)", "var(--accent)", "var(--purple)", "var(--gold)"];

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long" });
}

function memoryKind(entry: KnowledgeEntry): "photo" | "story" | "voice" {
  if (entry.memoryKind) return entry.memoryKind;
  return entry.photoUrl ? "photo" : "story";
}

const BADGE_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  photo: { bg: "var(--secondary)", color: "var(--primary)", label: "📷 Photo" },
  story: { bg: "rgba(196,113,78,0.12)", color: "var(--accent)", label: "📖 Story" },
  voice: { bg: "rgba(123,106,164,0.12)", color: "var(--purple)", label: "🎙 Voice Note" },
};

export function MemoriesPage() {
  const { entries } = useEntries();
  const memoryEntries = useMemo(
    () => entries.filter((e) => e.category === "memory" || e.category === "photo"),
    [entries],
  );

  const months = useMemo(
    () =>
      Array.from(new Set(memoryEntries.map((e) => monthKey(e.occurredAt))))
        .sort()
        .reverse()
        .map((key) => ({
          key,
          label: monthLabel(memoryEntries.find((e) => monthKey(e.occurredAt) === key)!.occurredAt),
        })),
    [memoryEntries],
  );

  const [activeMonth, setActiveMonth] = useState(months[0]?.key);
  const monthToShow = activeMonth ?? months[0]?.key;

  const monthEntries = useMemo(
    () =>
      memoryEntries
        .filter((e) => monthKey(e.occurredAt) === monthToShow)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [memoryEntries, monthToShow],
  );

  const featured = monthEntries.find((e) => e.photoUrl) ?? monthEntries[0];
  const visitsInMonth = entries.filter(
    (e) => e.category === "visit" && monthKey(e.occurredAt) === monthToShow,
  ).length;
  const contributors = Array.from(
    new Set(entries.filter((e) => monthKey(e.occurredAt) === monthToShow).map((e) => e.contributor)),
  );

  return (
    <div className="hide-scroll flex h-full flex-col overflow-y-auto">
      <div className="flex-shrink-0 px-5 pt-4 pb-1">
        <h1 className="font-serif text-xl font-semibold text-foreground">Memories</h1>
      </div>

      <div className="flex-shrink-0 px-4 pb-2 pt-2">
        <div className="hide-scroll flex gap-2 overflow-x-auto">
          {months.map((m) => (
            <button
              key={m.key}
              onClick={() => setActiveMonth(m.key)}
              className="flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
              style={
                monthToShow === m.key
                  ? { background: "var(--foreground)", color: "white" }
                  : { background: "var(--border)", color: "var(--muted-foreground)" }
              }
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="hide-scroll flex-1 overflow-y-auto px-4">
        {featured && (
          <div className="relative mb-4 h-44 overflow-hidden rounded-2xl">
            <img
              src={featured.photoUrl ?? lovedOne.photoUrl}
              alt=""
              className="h-full w-full object-cover"
              style={{ background: "var(--border)" }}
            />
            <div
              className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(28,22,18,0.78) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)" }}
            />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <h2 className="mb-0.5 font-serif text-base font-semibold leading-tight text-white">
                {months.find((m) => m.key === monthToShow)?.label} so far
              </h2>
              <p className="mb-2.5 text-xs text-white/75">
                {visitsInMonth} visits · {monthEntries.length} memories added
              </p>
              <div className="flex -space-x-1.5">
                {contributors.map((c, i) => (
                  <div
                    key={c}
                    className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white"
                    style={{ background: AVATAR_ROTATION[i % AVATAR_ROTATION.length], zIndex: contributors.length - i }}
                  >
                    {c[0]}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {monthEntries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-3 text-4xl">📖</p>
            <p className="text-sm text-muted-foreground">No memories added for this month yet.</p>
          </div>
        ) : (
          monthEntries.map((mem) => {
            const kind = memoryKind(mem);
            const badge = BADGE_STYLE[kind];
            return (
              <div key={mem.id} className="mb-3 overflow-hidden rounded-2xl" style={{ background: "white", boxShadow: "0 1px 6px rgba(44,40,37,0.07)" }}>
                {kind === "photo" && mem.photoUrl && (
                  <img src={mem.photoUrl} alt={mem.title} className="h-32 w-full object-cover" style={{ background: "var(--border)" }} />
                )}
                <div className="px-3.5 py-3">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: badge.bg, color: badge.color }}>
                      {badge.label}
                    </span>
                    <span className="text-xs text-muted-foreground">{formatRelative(mem.occurredAt)}</span>
                  </div>
                  <p className="mb-1 font-serif text-sm font-semibold leading-snug text-foreground">{mem.title}</p>
                  <p className="mb-2 font-serif text-xs italic leading-relaxed text-secondary-foreground">{mem.body}</p>
                  <p className="text-xs text-muted-foreground">Added by {mem.contributor}</p>
                </div>
              </div>
            );
          })
        )}

        <button
          className="mb-6 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed py-4 transition-all active:scale-[0.98]"
          style={{ borderColor: "rgba(74,123,106,0.35)", color: "var(--primary)" }}
        >
          <span className="text-xl font-light leading-none">+</span>
          <span className="text-sm font-medium">Add a memory</span>
        </button>
      </div>
    </div>
  );
}
