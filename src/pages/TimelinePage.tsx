import { useMemo, useState } from "react";
import { entries as seedEntries } from "../data/entries";
import { EntryCard } from "../components/EntryCard";
import { useRole } from "../context/RoleContext";
import { avatarColor } from "../lib/avatarColor";
import { lovedOne } from "../data/lovedOne";
import type { EntryCategory } from "../types";

const CATEGORIES: EntryCategory[] = [
  "visit",
  "observation",
  "photo",
  "mood",
  "pharmacy",
  "memory",
  "appointment",
];

export function TimelinePage() {
  const { role } = useRole();
  const [entries, setEntries] = useState(seedEntries);
  const [filter, setFilter] = useState<EntryCategory | "all">("all");

  const visible = useMemo(() => {
    const filtered = filter === "all" ? entries : entries.filter((e) => e.category === filter);
    return [...filtered].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }, [entries, filter]);

  function toggleApprove(id: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, clinicianApproved: !e.clinicianApproved } : e)),
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 bg-background px-5 pt-6 pb-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Journey
        </p>
        <h2 className="mb-4 font-serif text-2xl text-foreground">{lovedOne.name}'s timeline</h2>
        {role === "admin" && (
          <p className="-mt-2 mb-3 text-xs text-muted-foreground">
            As admin, you can approve individual entries for the clinician summary.
          </p>
        )}

        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all"
            style={
              filter === "all"
                ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
            }
          >
            All
          </button>
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setFilter(category)}
              className="flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all"
              style={
                filter === category
                  ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                  : { background: "var(--secondary)", color: "var(--secondary-foreground)" }
              }
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="relative">
          <div className="absolute bottom-4 left-3.5 top-4 w-px" style={{ background: "var(--border)" }} />
          <div className="flex flex-col gap-4">
            {visible.map((entry) => (
              <div key={entry.id} className="flex gap-4">
                <div className="flex flex-shrink-0 flex-col items-center" style={{ width: 28 }}>
                  <div
                    className="z-10 mt-1 h-3.5 w-3.5 rounded-full border-2 border-white"
                    style={{ background: avatarColor(entry.contributor) }}
                  />
                </div>
                <EntryCard entry={entry} role={role} onToggleApprove={toggleApprove} />
              </div>
            ))}
            {visible.length === 0 && (
              <p className="rounded-2xl bg-card p-6 text-center text-muted-foreground">
                Nothing in this category yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
