import { useMemo, useState } from "react";
import { entries as seedEntries } from "../data/entries";
import { EntryCard } from "../components/EntryCard";
import { useRole } from "../context/RoleContext";
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">Family timeline</h1>
        <p className="mt-1 text-sm text-ink-700">
          Visits, moods, photos and memories, all in one place — practical care entries are styled
          coolly, memories and moments stay warm.
          {role === "admin" && " As admin, you can approve individual entries for the clinician summary."}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
            filter === "all" ? "bg-ink-800 text-white" : "bg-white text-ink-700 hover:bg-warm-100"
          }`}
        >
          All
        </button>
        {CATEGORIES.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={`rounded-full px-3 py-1.5 text-sm font-semibold capitalize transition-colors ${
              filter === category
                ? "bg-ink-800 text-white"
                : "bg-white text-ink-700 hover:bg-warm-100"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {visible.map((entry) => (
          <EntryCard key={entry.id} entry={entry} role={role} onToggleApprove={toggleApprove} />
        ))}
        {visible.length === 0 && (
          <p className="rounded-2xl bg-white p-6 text-center text-ink-700">
            Nothing in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
