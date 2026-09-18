import { useMemo, useState } from "react";
import { entries } from "../data/entries";
import { lovedOne } from "../data/lovedOne";
import { formatRelative } from "../lib/format";

const memoryEntries = entries.filter((e) => e.category === "memory" || e.category === "photo");

function monthKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${d.getMonth()}`;
}

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { month: "long" });
}

const months = Array.from(new Set(memoryEntries.map((e) => monthKey(e.occurredAt))))
  .sort()
  .reverse()
  .map((key) => ({
    key,
    label: monthLabel(memoryEntries.find((e) => monthKey(e.occurredAt) === key)!.occurredAt),
  }));

export function MemoriesPage() {
  const [activeMonth, setActiveMonth] = useState(months[0]?.key);

  const monthEntries = useMemo(
    () =>
      memoryEntries
        .filter((e) => monthKey(e.occurredAt) === activeMonth)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [activeMonth],
  );

  const featured = monthEntries.find((e) => e.photoUrl) ?? monthEntries[0];
  const visitsInMonth = entries.filter(
    (e) => e.category === "visit" && monthKey(e.occurredAt) === activeMonth,
  ).length;
  const contributors = Array.from(new Set(entries.filter((e) => monthKey(e.occurredAt) === activeMonth).map((e) => e.contributor)));

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-6">
      <div className="px-5 pt-6 pb-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Memories
        </p>
        <h2 className="font-serif text-2xl text-foreground">{lovedOne.name}'s life &amp; story</h2>
      </div>

      <div className="mb-4 flex shrink-0 gap-2 overflow-x-auto px-5 pb-2">
        {months.map((m) => (
          <button
            key={m.key}
            onClick={() => setActiveMonth(m.key)}
            className="flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all"
            style={
              activeMonth === m.key
                ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
            }
          >
            {m.label}
          </button>
        ))}
      </div>

      {featured && (
        <div className="relative mx-5 mb-5 overflow-hidden rounded-2xl" style={{ minHeight: 140 }}>
          <img
            src={featured.photoUrl ?? lovedOne.photoUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ background: "#e5ded5" }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(to top, rgba(26,23,20,0.85) 0%, rgba(26,23,20,0.2) 60%, transparent 100%)" }}
          />
          <div className="relative flex flex-col justify-end p-5" style={{ minHeight: 140 }}>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-white/70">
              {months.find((m) => m.key === activeMonth)?.label} in one moment
            </p>
            <p className="font-serif text-lg italic leading-snug text-white">{featured.title}</p>
            <div className="mt-3 flex items-center gap-3">
              <p className="text-xs text-white/70">{visitsInMonth} visits</p>
              <span className="text-white/40">·</span>
              <div className="flex -space-x-1">
                {contributors.slice(0, 4).map((c) => (
                  <div
                    key={c}
                    className="flex h-5 w-5 items-center justify-center rounded-full border border-white/30 text-xs font-bold text-white"
                    style={{ background: "rgba(255,255,255,0.25)" }}
                  >
                    {c[0]}
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/70">{contributors.length} contributors</p>
            </div>
          </div>
        </div>
      )}

      <div className="px-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Memories &amp; moments
        </p>

        {monthEntries.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-3 text-4xl">📖</p>
            <p className="text-sm text-muted-foreground">No memories added for this month yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {monthEntries.map((mem) => (
              <div key={mem.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {mem.photoUrl && (
                  <div className="h-44 overflow-hidden" style={{ background: "#e5ded5" }}>
                    <img src={mem.photoUrl} alt={mem.title} className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={
                        mem.category === "memory"
                          ? { background: "rgba(74,123,106,0.12)", color: "var(--primary)" }
                          : { background: "var(--muted)", color: "var(--muted-foreground)" }
                      }
                    >
                      {mem.category === "photo" ? "📷 Photo" : "🌿 Memory"}
                    </span>
                    <p className="text-xs text-muted-foreground">{formatRelative(mem.occurredAt)}</p>
                  </div>
                  <p className="mb-1 font-serif text-base font-semibold text-foreground">{mem.title}</p>
                  <p
                    className="text-sm leading-relaxed text-secondary-foreground"
                    style={{ fontStyle: mem.category === "memory" ? "italic" : "normal" }}
                  >
                    {mem.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">Added by {mem.contributor}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
