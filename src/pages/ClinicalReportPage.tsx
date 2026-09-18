import { useEffect, useMemo, useState } from "react";
import { useEntries } from "../context/EntriesContext";
import { generateClinicalReport } from "../lib/api";
import { EntryCard } from "../components/EntryCard";
import { lovedOne } from "../data/lovedOne";
import type { ClinicalReportResponse } from "../types";

export function ClinicalReportPage() {
  const { entries } = useEntries();
  const approved = useMemo(
    () =>
      entries
        .filter((e) => e.clinicianApproved)
        .sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
    [entries],
  );

  const [report, setReport] = useState<ClinicalReportResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedFor, setGeneratedFor] = useState(0);

  useEffect(() => {
    if (approved.length === 0 || approved.length === generatedFor) return;
    setLoading(true);
    setError(null);
    generateClinicalReport(approved)
      .then((data) => {
        setReport(data);
        setGeneratedFor(approved.length);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Something went wrong."))
      .finally(() => setLoading(false));
  }, [approved, generatedFor]);

  return (
    <div className="hide-scroll h-full overflow-y-auto px-4 pb-8 pt-4">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Clinical history log
      </p>
      <h1 className="mb-3 font-serif text-xl font-semibold text-foreground">{lovedOne.name}</h1>

      <div className="mb-4 rounded-xl p-3.5 text-xs leading-relaxed" style={{ background: "var(--secondary)", color: "var(--secondary-foreground)" }}>
        This report contains <strong>family and carer observations only</strong>, shared with explicit
        family approval. It is not a diagnosis or clinical assessment — patterns and safety notes below
        are for your own professional judgment.
      </div>

      {approved.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          No entries have been approved for clinician sharing yet. A family admin can approve entries
          from the Journey timeline.
        </div>
      )}

      {approved.length > 0 && loading && (
        <div className="animate-pulse space-y-2 rounded-2xl border border-border bg-card p-4">
          <div className="h-3 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          <div className="h-3 w-2/3 rounded bg-muted" />
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-xl p-3.5 text-sm" style={{ background: "rgba(91,113,134,0.1)", color: "var(--accent)" }}>
          {error}
        </div>
      )}

      {report && !loading && (
        <>
          <div className="mb-4 rounded-2xl border border-border bg-card p-4">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Summary</p>
            <p className="text-sm leading-relaxed text-foreground">{report.summary}</p>
          </div>

          {report.patterns.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Patterns reported by family &amp; carers
              </p>
              <div className="space-y-2">
                {report.patterns.map((p) => (
                  <div key={p.label} className="rounded-2xl border border-border bg-card p-3.5">
                    <p className="mb-0.5 text-sm font-semibold text-foreground">{p.label}</p>
                    <p className="text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.safetyNotes.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--accent)" }}>
                Worth your own assessment
              </p>
              <div className="space-y-2">
                {report.safetyNotes.map((s) => (
                  <div key={s.label} className="rounded-2xl p-3.5" style={{ background: "rgba(91,113,134,0.08)", border: "1px solid rgba(91,113,134,0.25)" }}>
                    <p className="mb-0.5 text-sm font-semibold" style={{ color: "var(--accent)" }}>{s.label}</p>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--secondary-foreground)" }}>{s.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {approved.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Full approved log ({approved.length})
          </p>
          <div className="space-y-3">
            {approved.map((entry) => (
              <EntryCard key={entry.id} entry={entry} role="clinician" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
