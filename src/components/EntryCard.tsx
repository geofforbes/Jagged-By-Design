import type { KnowledgeEntry, Role } from "../types";
import { CARE_CATEGORIES } from "../types";
import { canApproveForClinician, isApprovedForClinician, sourceLabel } from "../lib/permissions";
import { CONTENT_KIND_LABEL } from "../lib/labels";
import { avatarColor } from "../lib/avatarColor";
import { formatRelative } from "../lib/format";

const CATEGORY_ICON: Record<KnowledgeEntry["category"], string> = {
  visit: "👋",
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
  const color = avatarColor(entry.contributor);

  return (
    <article
      className="flex-1 overflow-hidden rounded-2xl border"
      style={{
        background: isCare ? "var(--secondary)" : "var(--card)",
        borderColor: "var(--border)",
      }}
    >
      {entry.photoUrl && (
        <div className="h-36 overflow-hidden" style={{ background: "#e5ded5" }}>
          <img src={entry.photoUrl} alt={entry.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: color }}
            >
              {entry.contributor[0]}
            </div>
            <p className="text-xs font-medium text-muted-foreground">{entry.contributor}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm" aria-hidden>
              {CATEGORY_ICON[entry.category]}
            </span>
            <p className="text-xs text-muted-foreground">{formatRelative(entry.occurredAt)}</p>
          </div>
        </div>

        <p className="mb-1 font-serif text-sm font-semibold text-foreground">{entry.title}</p>
        <p className="text-sm leading-relaxed text-secondary-foreground">{entry.body}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize text-muted-foreground">
            {entry.category}
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {CONTENT_KIND_LABEL[entry.contentKind]}
          </span>
          <span className="text-xs text-muted-foreground">· {sourceLabel(entry)}</span>
        </div>

        {(approved || canApproveForClinician(role)) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {approved && (
              <span
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: "rgba(74,123,106,0.15)", color: "var(--primary)" }}
              >
                Shared with clinician
              </span>
            )}
            {canApproveForClinician(role) && onToggleApprove && (
              <button
                type="button"
                onClick={() => onToggleApprove(entry.id)}
                className="rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors"
                style={
                  approved
                    ? { borderColor: "var(--primary)", color: "var(--primary)" }
                    : { borderColor: "var(--border)", color: "var(--foreground)" }
                }
              >
                {approved ? "Revoke clinician sharing" : "Approve for clinician summary"}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
