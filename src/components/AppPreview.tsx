import { useMemo, useState, type ReactNode } from "react";
import type { CalendarItem, CareItem, DemoResults, LifeStoryItem } from "./ResultsPreview";
import type { ParsedWhatsAppMessage } from "../lib/parseWhatsAppExport";

type Tab = "care" | "plan" | "life";
type CareSubTab = "insights" | "log" | "staging" | "prompts";
type PlanView = "calendar" | "actions";
type LifeFilter = "all" | "snaps" | "bites" | "moments";
type DateRangePreset = "1w" | "1m" | "3m";

// Colors read directly from the real Care Co. app bundle (see AppPreview's
// PR description) - the app reuses the same severity color for both the
// category and severity badge on an insight card, so one map covers both.
const SEVERITY_COLORS: Record<string, { bg: string; text: string }> = {
  High: { bg: "#FDECEA", text: "#B85A5A" },
  Medium: { bg: "#FBF4EC", text: "#B8834A" },
  Low: { bg: "#E8EDF5", text: "#4A6FA5" },
  Positive: { bg: "#F0F5F0", text: "#6B9B6B" },
};

const ITEM_TYPE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  appointment: { bg: "#EFF5F4", text: "#5B8A84", label: "Appointment" },
  visit: { bg: "#E8EDF5", text: "#4A6FA5", label: "Visit" },
  trip: { bg: "#FBF4EC", text: "#B8834A", label: "Trip" },
  task: { bg: "#F4F3F1", text: "#6B6860", label: "Task" },
};

const AVATAR_PALETTE = [
  { bg: "#EFF5F4", text: "#5B8A84" },
  { bg: "#E8EDF5", text: "#4A6FA5" },
  { bg: "#F0F5F0", text: "#6B9B6B" },
  { bg: "#FBF4EC", text: "#B8834A" },
];

function avatarStyle(name: string): { bg: string; text: string } {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

const FILTER_LABELS: { id: LifeFilter; label: string; emoji: string }[] = [
  { id: "snaps", label: "Snaps", emoji: "📷" },
  { id: "bites", label: "Bites", emoji: "🎧" },
  { id: "moments", label: "Moments", emoji: "💬" },
];

const DATE_RANGE_PRESETS: { id: DateRangePreset; label: string; days: number }[] = [
  { id: "1w", label: "1 Week", days: 7 },
  { id: "1m", label: "1 Month", days: 30 },
  { id: "3m", label: "3 Months", days: 90 },
];

function formatCardDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function formatShort(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

function formatMonth(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function dateKey(iso: string): string {
  return iso.slice(0, 10);
}

function mondayOf(date: Date): Date {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// A static, clearly-labeled stand-in for screens that need clinician- or
// family-entered data (or a further inference step) rather than direct chat
// extraction - Staging & Indicators, Conversation Starters, Actions, and Key
// Contacts. Present so the navigation feels complete, but never fabricated.
function NotYetGenerated({ children }: { children: ReactNode }) {
  return (
    <div className="co-placeholder">
      <p>{children}</p>
    </div>
  );
}

export default function AppPreview({
  results,
  lovedOneName,
  messages,
}: {
  results: DemoResults;
  lovedOneName: string;
  messages: ParsedWhatsAppMessage[];
}) {
  const [tab, setTab] = useState<Tab>("care");
  const [careSubTab, setCareSubTab] = useState<CareSubTab>("insights");
  const [openInsightId, setOpenInsightId] = useState<number | null>(results.care[0]?.id ?? null);
  const [planView, setPlanView] = useState<PlanView>("calendar");
  const [lifeFilter, setLifeFilter] = useState<LifeFilter>("all");
  const [dateRangePreset, setDateRangePreset] = useState<DateRangePreset>("1m");

  const conversationDays = useMemo(() => new Set(messages.map((m) => dateKey(m.timestamp.toISOString()))).size, [
    messages,
  ]);

  const lastUpdated = useMemo(() => {
    if (messages.length === 0) return null;
    return messages.reduce((latest, m) => (m.timestamp > latest ? m.timestamp : latest), messages[0].timestamp);
  }, [messages]);

  const safetyCount = results.care.filter((c) => c.insight_category === "Safety").length;
  const positiveCount = results.care.filter((c) => c.severity === "Positive").length;

  const rangeDays = DATE_RANGE_PRESETS.find((p) => p.id === dateRangePreset)?.days ?? 30;
  const rangeCutoff = Date.now() - rangeDays * 24 * 60 * 60 * 1000;

  const sortedInsights = useMemo(
    () =>
      [...results.care]
        .filter((item) => new Date(item.occurred_at).getTime() >= rangeCutoff)
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [results.care, rangeCutoff],
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of results.calendar) {
      if (!item.due_at) continue;
      const key = dateKey(item.due_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(item);
    }
    for (const items of map.values()) {
      items.sort((a, b) => (a.due_time ?? "99:99").localeCompare(b.due_time ?? "99:99"));
    }
    return map;
  }, [results.calendar]);

  const weekAnchor = useMemo(() => {
    const dates = [...eventsByDay.keys()].sort();
    return mondayOf(dates.length > 0 ? new Date(dates[0]) : new Date());
  }, [eventsByDay]);

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekAnchor);
      d.setDate(d.getDate() + i);
      const key = dateKey(d.toISOString());
      return { date: d, key, hasEvents: eventsByDay.has(key) };
    });
  }, [weekAnchor, eventsByDay]);

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const activeDay = selectedDay ?? week.find((w) => w.hasEvents)?.key ?? week[0]?.key ?? null;
  const dayEvents = activeDay ? (eventsByDay.get(activeDay) ?? []) : [];
  const undatedEvents = results.calendar.filter((item) => !item.due_at);

  const moments = useMemo(
    () =>
      results.lifeStory
        .filter((item): item is LifeStoryItem & { occurred_at: string } => item.occurred_at !== null)
        .filter((item) => {
          if (lifeFilter === "all") return true;
          if (lifeFilter === "snaps") return !!item.photo_url;
          if (lifeFilter === "bites") return !!item.is_bite;
          return !item.photo_url && !item.is_bite; // "moments"
        })
        .sort((a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime()),
    [results.lifeStory, lifeFilter],
  );

  const momentsByMonth = useMemo(() => {
    const groups = new Map<string, LifeStoryItem[]>();
    for (const item of moments) {
      const key = formatMonth(item.occurred_at as string);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(item);
    }
    return [...groups.entries()];
  }, [moments]);

  return (
    <div className="co-phone">
      <div className="co-status-bar">
        <span className="co-status-time">9:41</span>
        <div className="co-status-icons">
          <svg width="17" height="12" viewBox="0 0 17 12" fill="none" aria-hidden="true">
            <rect x="0" y="4" width="3" height="8" rx="1" fill="#1A1917" />
            <rect x="4.5" y="2.5" width="3" height="9.5" rx="1" fill="#1A1917" />
            <rect x="9" y="0.5" width="3" height="11.5" rx="1" fill="#1A1917" />
            <rect x="13.5" y="0" width="3" height="12" rx="1" fill="#1A1917" opacity="0.3" />
          </svg>
          <div className="co-status-battery" />
        </div>
      </div>

      <div className="co-screen">
        {tab === "care" && (
          <>
            <div className="co-care-header">
              <p className="co-eyebrow">Care Portal</p>
              <h1 className="co-patient-name">{lovedOneName || "Loved one"}</h1>
              {(safetyCount > 0 || results.care.length > 0) && (
                <div className="co-flag-pill">
                  <span className="co-flag-dot" />
                  {results.care.length} insight{results.care.length === 1 ? "" : "s"} this conversation
                </div>
              )}
            </div>

            <div className="co-stat-grid">
              <div className="co-stat">
                <p className="co-stat-value" style={{ color: "#5B8A84" }}>
                  {conversationDays}
                </p>
                <p className="co-stat-label">Conversation days</p>
              </div>
              <div className="co-stat">
                <p className="co-stat-value" style={{ color: "#B8834A" }}>
                  {results.care.length}
                </p>
                <p className="co-stat-label">Clinical flags</p>
              </div>
              <div className="co-stat">
                <p className="co-stat-value" style={{ color: "#6B9B6B" }}>
                  {positiveCount}
                </p>
                <p className="co-stat-label">Positive moments</p>
              </div>
              <div className="co-stat">
                <p className="co-stat-value" style={{ color: "#B85A5A" }}>
                  {safetyCount}
                </p>
                <p className="co-stat-label">Safety notes</p>
              </div>
            </div>

            {lastUpdated && (
              <div className="co-sync-bar">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                  <circle cx="6" cy="6" r="6" fill="#25D366" />
                  <path d="M3.5 6.2l1.5 1.5 3.5-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p>
                  Updated via WhatsApp ·{" "}
                  <span style={{ color: "#6B6860", fontWeight: 500 }}>
                    {lastUpdated.toLocaleDateString(undefined, { day: "numeric", month: "short" })},{" "}
                    {lastUpdated.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                  </span>
                </p>
              </div>
            )}

            <div className="co-subtabs">
              <button
                className={`co-subtab ${careSubTab === "insights" ? "co-subtab-active" : ""}`}
                onClick={() => setCareSubTab("insights")}
              >
                Insights
              </button>
              <button
                className={`co-subtab ${careSubTab === "log" ? "co-subtab-active" : ""}`}
                onClick={() => setCareSubTab("log")}
              >
                Log
              </button>
              <button
                className={`co-subtab ${careSubTab === "staging" ? "co-subtab-active" : ""}`}
                onClick={() => setCareSubTab("staging")}
              >
                Staging
              </button>
              <button
                className={`co-subtab ${careSubTab === "prompts" ? "co-subtab-active" : ""}`}
                onClick={() => setCareSubTab("prompts")}
              >
                Prompts
              </button>
            </div>

            <div className="co-body">
              {careSubTab === "insights" && (
                <>
                  <div className="co-range-row">
                    <p className="co-section-label" style={{ padding: 0, margin: 0 }}>
                      Date range
                    </p>
                    <div className="co-range-pills">
                      {DATE_RANGE_PRESETS.map((p) => (
                        <button
                          key={p.id}
                          className={`co-range-pill ${dateRangePreset === p.id ? "co-range-pill-active" : ""}`}
                          onClick={() => setDateRangePreset(p.id)}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="co-section-label">AI-extracted observations from family conversations · Auto-logged</p>
                  {sortedInsights.length === 0 && (
                    <p className="co-empty">Nothing flagged in this date range.</p>
                  )}
                  {sortedInsights.map((item) => (
                    <InsightCard
                      key={item.id}
                      item={item}
                      isOpen={openInsightId === item.id}
                      onToggle={() => setOpenInsightId(openInsightId === item.id ? null : item.id)}
                    />
                  ))}
                  {sortedInsights.length > 0 && (
                    <div className="co-methodology">
                      <p>
                        <strong>Source methodology · </strong>
                        Observations are extracted from family conversations by Care Co. using AI. All entries are
                        flagged for clinician review — they are supporting information, not clinical assessments.
                      </p>
                    </div>
                  )}
                </>
              )}
              {careSubTab === "log" && (
                <NotYetGenerated>
                  A full conversation log view is a straightforward addition on top of the same extracted data - not
                  built in this demo pass.
                </NotYetGenerated>
              )}
              {careSubTab === "staging" && (
                <NotYetGenerated>
                  Clinical staging (e.g. the Global Deterioration Scale) is entered by the care team, not extracted
                  from chat - not shown in this demo.
                </NotYetGenerated>
              )}
              {careSubTab === "prompts" && (
                <NotYetGenerated>
                  Conversation prompts would be generated from {lovedOneName || "the loved one"}'s life story - not
                  built in this demo pass.
                </NotYetGenerated>
              )}
            </div>
          </>
        )}

        {tab === "plan" && (
          <>
            <div className="co-plan-header">
              <div>
                <p className="co-eyebrow">{week[0] ? formatMonth(week[0].date.toISOString()) : ""}</p>
                <h1 className="co-patient-name">{lovedOneName ? `${lovedOneName}'s Plan` : "Plan"}</h1>
              </div>
              <div className="co-plan-view-toggle">
                <button
                  className={`co-plan-view-btn ${planView === "calendar" ? "co-plan-view-btn-active" : ""}`}
                  onClick={() => setPlanView("calendar")}
                >
                  Calendar
                </button>
                <button
                  className={`co-plan-view-btn ${planView === "actions" ? "co-plan-view-btn-active" : ""}`}
                  onClick={() => setPlanView("actions")}
                >
                  Actions
                </button>
              </div>
            </div>

            <div className="co-body">
              {planView === "calendar" ? (
                <>
                  <div className="co-week-strip">
                    {week.map((w) => {
                      const isSelected = w.key === activeDay;
                      return (
                        <button
                          key={w.key}
                          className={`co-week-day ${isSelected ? "co-week-day-active" : ""}`}
                          onClick={() => setSelectedDay(w.key)}
                        >
                          <span className="co-week-day-label">
                            {w.date.toLocaleDateString(undefined, { weekday: "short" })}
                          </span>
                          <span className="co-week-day-num">{w.date.getDate()}</span>
                          {w.hasEvents && <span className="co-week-day-dot" />}
                        </button>
                      );
                    })}
                  </div>

                  <p className="co-section-label">
                    {activeDay
                      ? new Date(activeDay).toLocaleDateString(undefined, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })
                      : ""}
                  </p>
                  {dayEvents.length === 0 && <p className="co-empty">Nothing scheduled this day.</p>}
                  {dayEvents.map((item) => (
                    <CalendarCard key={item.id} item={item} />
                  ))}

                  {undatedEvents.length > 0 && (
                    <>
                      <p className="co-section-label" style={{ marginTop: 16 }}>
                        No date given
                      </p>
                      {undatedEvents.map((item) => (
                        <CalendarCard key={item.id} item={item} />
                      ))}
                    </>
                  )}

                  <div className="co-key-contacts">
                    <p className="co-section-label" style={{ padding: 0 }}>
                      Key contacts
                    </p>
                    <NotYetGenerated>
                      Clinician, carer, and emergency contacts are set up by the family - not derived from chat.
                    </NotYetGenerated>
                  </div>
                </>
              ) : (
                <NotYetGenerated>
                  Recommended actions would be generated from Care insights (e.g. a safety flag becoming a referral
                  task) - not built in this demo pass.
                </NotYetGenerated>
              )}
            </div>
          </>
        )}

        {tab === "life" && (
          <>
            <div className="co-life-header">
              <p className="co-eyebrow">Life Story</p>
              <div className="co-life-header-row">
                <h1 className="co-patient-name">{lovedOneName || "Loved one"}</h1>
                <div
                  className="co-life-avatar"
                  style={{ background: avatarStyle(lovedOneName || "?").bg, color: avatarStyle(lovedOneName || "?").text }}
                >
                  {(lovedOneName || "?").charAt(0).toUpperCase()}
                </div>
              </div>
            </div>

            <div className="co-body">
              <div className="co-quote-card">
                <p className="co-quote-text">It's about the destination, not the journey.</p>
                <p className="co-quote-sub">
                  This space celebrates who {lovedOneName || "they"} are — their life, their stories, and the moments
                  that define them — not just the road they're on.
                </p>
              </div>

              <div className="co-filter-row">
                {FILTER_LABELS.map((f) => (
                  <button
                    key={f.id}
                    className={`co-filter-chip ${lifeFilter === f.id ? "co-filter-chip-active" : ""}`}
                    onClick={() => setLifeFilter(lifeFilter === f.id ? "all" : f.id)}
                  >
                    <span>{f.emoji}</span> {f.label}
                  </button>
                ))}
              </div>

              {momentsByMonth.length === 0 && <p className="co-empty">No moments captured yet.</p>}
              {momentsByMonth.map(([month, items]) => (
                <div key={month} className="co-month-group">
                  <div className="co-month-heading">
                    <span>{month}</span>
                    <div className="co-month-rule" />
                    <span>{items.length} memories</span>
                  </div>
                  {items.map((item) => {
                    const style = avatarStyle(item.person_name);
                    return (
                      <div className="co-memory-card" key={item.id}>
                        {item.photo_url && <img src={item.photo_url} alt="" className="co-memory-photo" />}
                        <div className="co-memory-body">
                          <div className="co-memory-meta">
                            <div className="co-memory-avatar" style={{ background: style.bg, color: style.text }}>
                              {item.person_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="co-memory-author">{item.person_name}</span>
                            <span className="co-memory-date">· {formatShort(item.occurred_at as string)}</span>
                            <span className="co-memory-type">
                              {item.photo_url ? "📷 Snap" : item.is_bite ? "🎧 Bite" : "💬 Moment"}
                            </span>
                          </div>
                          <p className="co-memory-caption">{item.summary}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="co-tabs">
        <button className={`co-tab ${tab === "care" ? "co-tab-active" : ""}`} onClick={() => setTab("care")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 10.5L12 3L21 10.5V21a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10.5z"
              fill={tab === "care" ? "#EFF5F4" : "none"}
              stroke={tab === "care" ? "#5B8A84" : "#B0ADA8"}
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: tab === "care" ? "#5B8A84" : "#B0ADA8" }}>Care</span>
        </button>
        <button className={`co-tab ${tab === "plan" ? "co-tab-active" : ""}`} onClick={() => setTab("plan")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="17" rx="2.5" fill="none" stroke={tab === "plan" ? "#5B8A84" : "#B0ADA8"} strokeWidth="1.6" />
            <path d="M8 2v4M16 2v4M3 10h18" stroke={tab === "plan" ? "#5B8A84" : "#B0ADA8"} strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span style={{ color: tab === "plan" ? "#5B8A84" : "#B0ADA8" }}>Plan</span>
        </button>
        <button className={`co-tab ${tab === "life" ? "co-tab-active" : ""}`} onClick={() => setTab("life")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 21s-8-5-8-11a5 5 0 0110-1.2A5 5 0 0122 10c0 6-10 11-10 11z"
              fill={tab === "life" ? "#EFF5F4" : "none"}
              stroke={tab === "life" ? "#5B8A84" : "#B0ADA8"}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ color: tab === "life" ? "#5B8A84" : "#B0ADA8" }}>Life Story</span>
        </button>
      </div>
      <div className="co-home-indicator-row">
        <div className="co-home-indicator" />
      </div>
    </div>
  );
}

function InsightCard({ item, isOpen, onToggle }: { item: CareItem; isOpen: boolean; onToggle: () => void }) {
  const color = SEVERITY_COLORS[item.severity] ?? SEVERITY_COLORS.Low;
  return (
    <div className="co-card">
      <button className="co-insight-button" onClick={onToggle}>
        <span className="co-insight-dot" style={{ background: color.text }} />
        <div className="co-insight-main">
          <div className="co-insight-tags">
            <span className="co-insight-date">{formatCardDate(item.occurred_at)}</span>
            <span className="co-tag-badge" style={{ background: color.bg, color: color.text }}>
              {item.insight_category}
            </span>
            <span className="co-tag-badge" style={{ background: color.bg, color: color.text }}>
              {item.severity}
            </span>
          </div>
          <p className="co-insight-title">{item.title}</p>
        </div>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          style={{ transform: isOpen ? "rotate(180deg)" : "none", flexShrink: 0, marginTop: 4 }}
        >
          <path d="M3 5l4 4 4-4" stroke="#A09D98" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {isOpen && (
        <div className="co-insight-body">
          <p>{item.body}</p>
        </div>
      )}
    </div>
  );
}

function CalendarCard({ item }: { item: CalendarItem }) {
  const style = ITEM_TYPE_STYLE[item.item_type] ?? ITEM_TYPE_STYLE.task;
  return (
    <div className="co-card co-event-card">
      {item.due_time && <span className="co-event-time">{item.due_time}</span>}
      <div className="co-event-main">
        <div className="co-insight-tags">
          <span className="co-tag-badge" style={{ background: style.bg, color: style.text }}>
            {style.label}
          </span>
        </div>
        <p className="co-insight-title">{item.title}</p>
        {item.notes && <p className="co-event-notes">{item.notes}</p>}
      </div>
    </div>
  );
}
