import { useMemo, useState } from "react";
import { useEntries } from "../context/EntriesContext";
import { useRole } from "../context/RoleContext";
import { EntryCard } from "../components/EntryCard";
import { WhatsAppOverlay } from "../components/WhatsAppOverlay";
import { dayLabel } from "../lib/format";
import { lovedOne } from "../data/lovedOne";
import type { EntryCategory } from "../types";

type JourneyFilter = "All" | "Visits" | "Notes" | "Memories" | "Care";

const CATEGORY_TO_FILTER: Record<EntryCategory, JourneyFilter> = {
  visit: "Visits",
  photo: "Visits",
  observation: "Notes",
  mood: "Notes",
  memory: "Memories",
  pharmacy: "Care",
  appointment: "Care",
};

const CATEGORY_DOT: Record<EntryCategory, string> = {
  visit: "var(--primary)",
  photo: "var(--primary)",
  observation: "var(--accent)",
  mood: "var(--accent)",
  memory: "var(--gold)",
  pharmacy: "var(--purple)",
  appointment: "var(--purple)",
};

const FILTERS: JourneyFilter[] = ["All", "Visits", "Notes", "Memories", "Care"];

export function TimelinePage() {
  const { entries, toggleApprove } = useEntries();
  const { role } = useRole();
  const [filter, setFilter] = useState<JourneyFilter>("All");
  const [waOpen, setWaOpen] = useState(false);

  const groups = useMemo(() => {
    const sorted = [...entries].sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
    const filtered =
      filter === "All" ? sorted : sorted.filter((e) => CATEGORY_TO_FILTER[e.category] === filter);

    const byLabel = new Map<string, typeof filtered>();
    for (const entry of filtered) {
      const label = dayLabel(entry.occurredAt);
      const list = byLabel.get(label) ?? [];
      list.push(entry);
      byLabel.set(label, list);
    }
    return Array.from(byLabel.entries()).map(([label, list]) => ({ label, entries: list }));
  }, [entries, filter]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex-shrink-0 px-5 pt-4 pb-1">
        <h1 className="font-serif text-xl font-semibold leading-tight text-foreground">
          {lovedOne.name.split(" ")[0]}'s Journey
        </h1>
      </div>

      <button
        type="button"
        onClick={() => setWaOpen(true)}
        className="mx-4 mb-0 mt-3 flex flex-shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-left transition-opacity active:opacity-80"
        style={{ background: "#F0FBF4", border: "1.5px solid #25D36630" }}
      >
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full" style={{ background: "#25D366" }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.554 4.122 1.524 5.855L0 24l6.318-1.51A11.933 11.933 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.003-1.368l-.358-.213-3.757.898.928-3.651-.234-.374A9.806 9.806 0 012.182 12c0-5.42 4.398-9.818 9.818-9.818 5.42 0 9.818 4.398 9.818 9.818 0 5.42-4.398 9.818-9.818 9.818z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold leading-tight" style={{ color: "#128C7E" }}>New check-in from WhatsApp</p>
          <p className="truncate text-xs leading-tight" style={{ color: "#128C7E99", marginTop: 2 }}>
            Care Co. detected an update — tap to review
          </p>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      <div className="flex-shrink-0 px-4 pt-3 pb-2">
        <div className="hide-scroll flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="flex-shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all"
              style={
                filter === f
                  ? { background: "var(--primary)", color: "white" }
                  : { background: "var(--border)", color: "var(--muted-foreground)" }
              }
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="hide-scroll flex-1 overflow-y-auto px-4 pt-1">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="mb-3 mt-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {group.label}
            </div>
            {group.entries.map((entry) => (
              <div key={entry.id} className="mb-1 flex gap-3">
                <div className="flex flex-shrink-0 flex-col items-center pt-1">
                  <div className="mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: CATEGORY_DOT[entry.category] }} />
                  <div className="mt-1.5 w-px flex-1" style={{ background: "var(--border)" }} />
                </div>
                <EntryCard entry={entry} role={role} onToggleApprove={toggleApprove} />
              </div>
            ))}
          </div>
        ))}
        {groups.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">No entries for this filter yet.</div>
        )}
        <div className="h-4" />
      </div>

      {waOpen && <WhatsAppOverlay onClose={() => setWaOpen(false)} />}
    </div>
  );
}
