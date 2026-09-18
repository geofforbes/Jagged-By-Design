interface CareItem {
  id: number;
  type: string;
  occurred_at: string;
  summary: string;
  mood: string | null;
  person_name: string;
}

interface LifeStoryItem {
  id: number;
  occurred_at: string | null;
  era_label: string | null;
  summary: string;
  person_name: string;
}

interface CalendarItem {
  id: number;
  title: string;
  item_type: string;
  due_at: string | null;
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

const MOOD_TAG: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: "var(--cc-tag-family-bg)", text: "var(--cc-tag-family-text)", label: "Positive" },
  neutral: { bg: "var(--cc-border)", text: "var(--cc-text-secondary)", label: "Neutral" },
  negative: { bg: "var(--cc-tag-safety-bg)", text: "var(--cc-tag-safety-text)", label: "Negative" },
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
            const mood = item.mood ? MOOD_TAG[item.mood] : null;
            return (
              <div className="cc-card" key={item.id}>
                <div className="cc-card-meta">
                  <span className="cc-tag" style={{ background: "var(--cc-tag-medication-bg)", color: "var(--cc-tag-medication-text)" }}>
                    {item.type}
                  </span>
                  {mood && (
                    <span className="cc-tag" style={{ background: mood.bg, color: mood.text }}>
                      {mood.label}
                    </span>
                  )}
                  <span className="cc-card-date">{formatDate(item.occurred_at)}</span>
                </div>
                <p className="cc-card-summary">{item.summary}</p>
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
                <span className="cc-tag" style={{ background: "var(--cc-tag-family-bg)", color: "var(--cc-tag-family-text)" }}>
                  {item.item_type}
                </span>
                {item.due_at && <span className="cc-card-date">{formatDate(item.due_at)}</span>}
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
