import { useMemo, useState } from "react";
import type { CareItem, DemoResults, LifeStoryItem } from "./ResultsPreview";

type Tab = "care" | "plan" | "life_story";
type DateRange = "7d" | "30d" | "all";

const CARE_TYPE_LABEL: Record<string, string> = {
  visit: "Visit",
  observation: "Observation",
  pharmacy: "Medication",
  appointment: "Appointment",
  memory: "Memory",
};

const MOOD_DOT: Record<string, string> = {
  positive: "var(--cc-tag-family-text)",
  neutral: "var(--cc-text-secondary)",
  negative: "var(--cc-tag-emergency-text)",
};

function formatDayHeading(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function groupCareByDay(items: CareItem[]): [string, CareItem[]][] {
  const groups = new Map<string, CareItem[]>();
  for (const item of items) {
    const key = new Date(item.occurred_at).toDateString();
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(item);
  }
  return [...groups.entries()].sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
}

// This is what turns the classifier's raw output into the actual app
// experience: the same DemoResults feeding the "Raw data" view is grouped,
// filtered, and laid out here as the Care / Plan / Life Story screens
// described from the Figma mockups (Appointment Briefing w/ date filter,
// a shared calendar, and a memory feed with era-grouped "showreels").
export default function AppPreview({ results }: { results: DemoResults }) {
  const [tab, setTab] = useState<Tab>("care");
  const [range, setRange] = useState<DateRange>("all");

  const careByDay = useMemo(() => {
    let items = results.care;
    if (range !== "all") {
      const days = range === "7d" ? 7 : 30;
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      items = items.filter((item) => new Date(item.occurred_at).getTime() >= cutoff);
    }
    return groupCareByDay(items);
  }, [results.care, range]);

  const upcoming = useMemo(
    () =>
      [...results.calendar].sort((a, b) => {
        if (!a.due_at && !b.due_at) return 0;
        if (!a.due_at) return 1;
        if (!b.due_at) return -1;
        return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
      }),
    [results.calendar],
  );

  const moments = useMemo(
    () =>
      results.lifeStory
        .filter((item): item is LifeStoryItem & { occurred_at: string } => item.occurred_at !== null)
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [results.lifeStory],
  );

  const memoriesByEra = useMemo(() => {
    const groups = new Map<string, LifeStoryItem[]>();
    for (const item of results.lifeStory) {
      if (item.occurred_at !== null) continue;
      const key = item.era_label ?? "Memories";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()];
  }, [results.lifeStory]);

  return (
    <div className="cc-phone">
      <div className="cc-screen">
        {tab === "care" && (
          <>
            <div className="cc-screen-header">
              <h2>Appointment Briefing</h2>
              <div className="cc-range-filter">
                {(["7d", "30d", "all"] as const).map((r) => (
                  <button
                    key={r}
                    className={`cc-range-btn ${range === r ? "cc-range-btn-active" : ""}`}
                    onClick={() => setRange(r)}
                  >
                    {r === "7d" ? "7 days" : r === "30d" ? "30 days" : "All time"}
                  </button>
                ))}
              </div>
            </div>
            {careByDay.length === 0 && <p className="results-empty">Nothing to brief on for this range.</p>}
            {careByDay.map(([day, items]) => (
              <div className="cc-day-group" key={day}>
                <h4 className="cc-day-heading">{formatDayHeading(items[0].occurred_at)}</h4>
                {items.map((item) => (
                  <div className="cc-card" key={item.id}>
                    <div className="cc-card-meta">
                      <span
                        className="cc-tag"
                        style={{ background: "var(--cc-tag-medication-bg)", color: "var(--cc-tag-medication-text)" }}
                      >
                        {CARE_TYPE_LABEL[item.type] ?? item.type}
                      </span>
                      {item.mood && (
                        <span
                          className="cc-mood-dot"
                          style={{ background: MOOD_DOT[item.mood] }}
                          title={`Mood: ${item.mood}`}
                        />
                      )}
                    </div>
                    <p className="cc-card-summary">{item.summary}</p>
                    <p className="cc-card-source">via {item.person_name}</p>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}

        {tab === "plan" && (
          <>
            <div className="cc-screen-header">
              <h2>Plan</h2>
            </div>
            {upcoming.length === 0 && <p className="results-empty">Nothing on the calendar yet.</p>}
            {upcoming.map((item) => (
              <div className="cc-card" key={item.id}>
                <div className="cc-card-meta">
                  <span
                    className="cc-tag"
                    style={{ background: "var(--cc-tag-family-bg)", color: "var(--cc-tag-family-text)" }}
                  >
                    {item.item_type}
                  </span>
                  <span className="cc-card-date">{item.due_at ? formatShort(item.due_at) : "No date"}</span>
                </div>
                <p className="cc-card-summary">{item.title}</p>
                {item.notes && <p className="cc-card-notes">{item.notes}</p>}
              </div>
            ))}
          </>
        )}

        {tab === "life_story" && (
          <>
            <div className="cc-screen-header">
              <h2>Life Story</h2>
            </div>
            {memoriesByEra.length > 0 && (
              <div className="cc-showreel-row">
                {memoriesByEra.map(([era, items]) => (
                  <div className="cc-showreel-card" key={era}>
                    <span className="cc-showreel-label">{era}</span>
                    <p>{items[0].summary}</p>
                    {items.length > 1 && <span className="cc-showreel-count">+{items.length - 1} more</span>}
                  </div>
                ))}
              </div>
            )}
            {moments.length === 0 && memoriesByEra.length === 0 && (
              <p className="results-empty">No moments captured yet.</p>
            )}
            {moments.map((item) => (
              <div className="cc-card" key={item.id}>
                <p className="cc-card-date">{formatShort(item.occurred_at)}</p>
                <p className="cc-card-summary">{item.summary}</p>
                <p className="cc-card-source">via {item.person_name}</p>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="cc-tabs">
        <button className={`cc-tab ${tab === "care" ? "cc-tab-active" : ""}`} onClick={() => setTab("care")}>
          Care
        </button>
        <button className={`cc-tab ${tab === "plan" ? "cc-tab-active" : ""}`} onClick={() => setTab("plan")}>
          Plan
        </button>
        <button
          className={`cc-tab ${tab === "life_story" ? "cc-tab-active" : ""}`}
          onClick={() => setTab("life_story")}
        >
          Life Story
        </button>
      </div>
    </div>
  );
}
