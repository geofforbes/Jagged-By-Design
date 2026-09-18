import { useMemo, useState } from "react";
import { useEntries } from "../context/EntriesContext";
import { useCalendar } from "../context/CalendarContext";
import { useRole } from "../context/RoleContext";
import { RESTRICTION_LABELS } from "../types";
import type { RestrictionCategory } from "../types";

const WEEKDAYS = ["M", "T", "W", "T", "F", "S", "S"];
const CATEGORIES: RestrictionCategory[] = ["mobility", "cooking", "outings", "driving"];

function toKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function monthGrid(year: number, month: number): (number | null)[] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leadingBlanks = (first.getDay() + 6) % 7; // Monday-first
  const cells: (number | null)[] = Array(leadingBlanks).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function CalendarPage() {
  const { entries } = useEntries();
  const { getPlan, setRestriction } = useCalendar();
  const { role } = useRole();
  const canEdit = role === "admin" || role === "clinician";

  const [cursor, setCursor] = useState(() => {
    const latest = entries.reduce((max, e) => Math.max(max, new Date(e.occurredAt).getTime()), 0);
    const d = new Date(latest || Date.now());
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [selected, setSelected] = useState<string | null>(null);

  const entriesByDay = useMemo(() => {
    const map = new Map<string, typeof entries>();
    for (const e of entries) {
      const d = new Date(e.occurredAt);
      const key = toKey(d.getFullYear(), d.getMonth(), d.getDate());
      map.set(key, [...(map.get(key) ?? []), e]);
    }
    return map;
  }, [entries]);

  const cells = monthGrid(cursor.year, cursor.month);
  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

  const selectedEntries = selected ? (entriesByDay.get(selected) ?? []) : [];
  const selectedPlan = selected ? getPlan(selected) : undefined;

  return (
    <div className="hide-scroll h-full overflow-y-auto px-4 pb-8 pt-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Shared calendar</p>
      <h1 className="mb-4 font-serif text-xl font-semibold text-foreground">What's happening, and when</h1>

      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
          className="rounded-full px-2 py-1 text-sm text-muted-foreground"
        >
          ←
        </button>
        <p className="text-sm font-semibold text-foreground">{monthLabel}</p>
        <button
          onClick={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
          className="rounded-full px-2 py-1 text-sm text-muted-foreground"
        >
          →
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
        {WEEKDAYS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={i} />;
          const key = toKey(cursor.year, cursor.month, day);
          const dayEntries = entriesByDay.get(key) ?? [];
          const plan = getPlan(key);
          const restricted = plan && Object.values(plan.restrictions).some(Boolean);
          const isSelected = selected === key;
          return (
            <button
              key={i}
              onClick={() => setSelected(key)}
              className="flex aspect-square flex-col items-center justify-center rounded-lg text-xs transition-colors"
              style={{
                background: isSelected ? "var(--primary)" : "transparent",
                color: isSelected ? "white" : "var(--foreground)",
              }}
            >
              <span>{day}</span>
              <span className="mt-0.5 flex gap-0.5">
                {dayEntries.length > 0 && (
                  <span className="h-1 w-1 rounded-full" style={{ background: isSelected ? "white" : "var(--primary)" }} />
                )}
                {restricted && (
                  <span className="h-1 w-1 rounded-full" style={{ background: isSelected ? "white" : "var(--accent)" }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="mb-3 font-serif text-sm font-semibold text-foreground">
            {new Date(selected).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
          </p>

          {selectedEntries.length > 0 ? (
            <div className="mb-4 space-y-2">
              {selectedEntries.map((e) => (
                <div key={e.id} className="rounded-xl bg-secondary px-3 py-2">
                  <p className="text-xs font-semibold capitalize text-foreground">{e.category} · {e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.contributor}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mb-4 text-xs text-muted-foreground">No recorded activity this day.</p>
          )}

          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Access &amp; limitations
          </p>
          <div className="space-y-2">
            {CATEGORIES.map((cat) => {
              const isRestricted = selectedPlan?.restrictions[cat] === true;
              return (
                <div key={cat} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: isRestricted ? "rgba(91,113,134,0.08)" : "var(--secondary)" }}>
                  <span className="text-xs font-medium text-foreground">{RESTRICTION_LABELS[cat]}</span>
                  {canEdit ? (
                    <button
                      onClick={() => setRestriction(selected, cat, !isRestricted, role === "clinician" ? "Clinician" : "Family Lead")}
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={isRestricted ? { background: "var(--accent)", color: "white" } : { background: "var(--border)", color: "var(--muted-foreground)" }}
                    >
                      {isRestricted ? "Restricted" : "Allowed"}
                    </button>
                  ) : (
                    <span className="text-xs font-semibold" style={{ color: isRestricted ? "var(--accent)" : "var(--muted-foreground)" }}>
                      {isRestricted ? "Restricted" : "Allowed"}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {selectedPlan?.note && (
            <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
              "{selectedPlan.note}" — {selectedPlan.setBy}
            </p>
          )}
        </div>
      )}

      {!selected && <p className="text-center text-xs text-muted-foreground">Tap a day to see activity and access details.</p>}
    </div>
  );
}
