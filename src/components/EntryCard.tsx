import type { KnowledgeEntry, Role } from "../types";
import { CARE_CATEGORIES } from "../types";
import { canApproveForClinician, isApprovedForClinician, sourceLabel } from "../lib/permissions";
import { CONTENT_KIND_LABEL } from "../lib/labels";
import { formatTime } from "../lib/format";

const CATEGORY_ICON: Record<KnowledgeEntry["category"], string> = {
  visit: "☀️",
  observation: "👀",
  photo: "📷",
  mood: "🌤️",
  pharmacy: "💊",
  memory: "🌿",
  appointment: "🩺",
};

interface EntryCardProps {
  entry: KnowledgeEntry;
  role: Role;
  onToggleApprove?: (id: string) => void;
}

export function EntryCard({ entry, role, onToggleApprove }: EntryCardProps) {
  const isCare = CARE_CATEGORIES.includes(entry.category);
  const approved = isApprovedForClinician(entry);

  return (
    <div className="flex-1 pb-4">
      <p className="mb-1.5 text-xs text-muted-foreground">{formatTime(entry.occurredAt)}</p>
      <div
        className="overflow-hidden rounded-2xl"
        style={{ background: isCare ? "var(--secondary)" : "white", boxShadow: "0 1px 6px rgba(44,40,37,0.07)" }}
      >
        {entry.photoUrl && (
          <img src={entry.photoUrl} alt={entry.title} className="h-32 w-full object-cover" style={{ background: "var(--border)" }} />
        )}
        <div className="p-3.5">
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <h3 className="flex-1 font-serif text-sm font-semibold leading-snug text-foreground">{entry.title}</h3>
            <span className="flex-shrink-0 text-base leading-none" aria-hidden>
              {CATEGORY_ICON[entry.category]}
            </span>
          </div>
          <p className="mb-2.5 text-xs leading-relaxed text-secondary-foreground">{entry.body}</p>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full px-2 py-0.5 text-xs capitalize" style={{ background: "rgba(74,123,106,0.1)", color: "var(--primary)" }}>
              {entry.category}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {CONTENT_KIND_LABEL[entry.contentKind]}
            </span>
            <span className="self-center text-xs text-muted-foreground">
              {entry.contributor} · {sourceLabel(entry)}
            </span>
          </div>

          {(approved || canApproveForClinician(role)) && (
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {approved && (
                <span className="rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: "rgba(74,123,106,0.15)", color: "var(--primary)" }}>
                  Shared with clinician
                </span>
              )}
              {canApproveForClinician(role) && onToggleApprove && (
                <button
                  type="button"
                  onClick={() => onToggleApprove(entry.id)}
                  className="rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors"
                  style={approved ? { borderColor: "var(--primary)", color: "var(--primary)" } : { borderColor: "var(--border)", color: "var(--foreground)" }}
                >
                  {approved ? "Revoke clinician sharing" : "Approve for clinician summary"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
