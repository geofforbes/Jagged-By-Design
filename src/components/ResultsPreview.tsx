export interface CareItem {
  id: number;
  insight_category: string;
  severity: string;
  title: string;
  body: string;
  occurred_at: string;
  person_name: string;
}

export interface LifeStoryItem {
  id: number;
  occurred_at: string | null;
  era_label: string | null;
  summary: string;
  person_name: string;
  // Set client-side after classification, from a browser-local object URL -
  // photos never leave the browser, so the server never sees or sets this.
  photo_url: string | null;
  // True when this moment came from a voice note ("Bite") rather than text
  // or a photo - only set by the hardcoded demo dataset for now.
  is_bite?: boolean;
}

export interface CalendarItem {
  id: number;
  title: string;
  item_type: string;
  due_at: string | null;
  due_time: string | null;
  notes: string | null;
  person_name: string;
}

export interface DemoResults {
  care: CareItem[];
  lifeStory: LifeStoryItem[];
  calendar: CalendarItem[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

const SEVERITY_TAG: Record<string, { bg: string; text: string }> = {
  High: { bg: "var(--cc-tag-high-bg)", text: "var(--cc-tag-high-text)" },
  Medium: { bg: "var(--cc-tag-medium-bg)", text: "var(--cc-tag-medium-text)" },
  Low: { bg: "var(--cc-tag-low-bg)", text: "var(--cc-tag-low-text)" },
  Positive: { bg: "var(--cc-tag-positive-bg)", text: "var(--cc-tag-positive-text)" },
};

export default function ResultsPreview({ results }: { results: DemoResults }) {
  const total = results.care.length + results.lifeStory.length + results.calendar.length;

  return (
    <div className="results">
      <div className="results-summary">
        <div className="results-stat">
          <span className="results-stat-value">{results.care.length}</span>
          <span className="results-stat-label">Care</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-value">{results.lifeStory.length}</span>
          <span className="results-stat-label">Life Story</span>
        </div>
        <div className="results-stat">
          <span className="results-stat-value">{results.calendar.length}</span>
          <span className="results-stat-label">Calendar</span>
        </div>
      </div>

      {total === 0 && <p className="results-empty">No care-relevant content found in that conversation yet.</p>}

      {results.care.length > 0 && (
        <section className="results-section">
          <h3>Care</h3>
          {results.care.map((item) => {
            const severity = SEVERITY_TAG[item.severity] ?? SEVERITY_TAG.Low;
            return (
              <div className="cc-card" key={item.id}>
                <div className="cc-card-meta">
                  <span className="cc-tag" style={{ background: severity.bg, color: severity.text }}>
                    {item.insight_category}
                  </span>
                  <span className="cc-tag" style={{ background: severity.bg, color: severity.text }}>
                    {item.severity}
                  </span>
                  <span className="cc-card-date">{formatDate(item.occurred_at)}</span>
                </div>
                <p className="cc-card-summary">
                  <strong>{item.title}</strong>
                </p>
                <p className="cc-card-notes">{item.body}</p>
                <p className="cc-card-source">via {item.person_name}</p>
              </div>
            );
          })}
        </section>
      )}

      {results.calendar.length > 0 && (
        <section className="results-section">
          <h3>Plan</h3>
          {results.calendar.map((item) => (
            <div className="cc-card" key={item.id}>
              <div className="cc-card-meta">
                <span className="cc-tag" style={{ background: "var(--cc-tag-low-bg)", color: "var(--cc-tag-low-text)" }}>
                  {item.item_type}
                </span>
                {item.due_at && (
                  <span className="cc-card-date">
                    {formatDate(item.due_at)}
                    {item.due_time ? ` · ${item.due_time}` : ""}
                  </span>
                )}
              </div>
              <p className="cc-card-summary">{item.title}</p>
              {item.notes && <p className="cc-card-notes">{item.notes}</p>}
              <p className="cc-card-source">via {item.person_name}</p>
            </div>
          ))}
        </section>
      )}

      {results.lifeStory.length > 0 && (
        <section className="results-section">
          <h3>Life Story</h3>
          {results.lifeStory.map((item) => (
            <div className="cc-card" key={item.id}>
              <div className="cc-card-meta">
                <span className="cc-card-date">{item.era_label ?? formatDate(item.occurred_at)}</span>
              </div>
              <p className="cc-card-summary">{item.summary}</p>
              <p className="cc-card-source">via {item.person_name}</p>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
