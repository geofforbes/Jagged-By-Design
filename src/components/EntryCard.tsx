import type { KnowledgeEntry, Role } from "../types";
import { CARE_CATEGORIES } from "../types";
import { canApproveForClinician, isApprovedForClinician, sourceLabel } from "../lib/permissions";
import { CONTENT_KIND_LABEL } from "../lib/labels";

const CATEGORY_ICON: Record<KnowledgeEntry["category"], string> = {
  visit: "👋",
  observation: "👀",
  photo: "📷",
  mood: "🌤️",
  pharmacy: "💊",
  memory: "🌿",
  appointment: "🩺",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

interface EntryCardProps {
  entry: KnowledgeEntry;
  role: Role;
  onToggleApprove?: (id: string) => void;
}

export function EntryCard({ entry, role, onToggleApprove }: EntryCardProps) {
  const isCare = CARE_CATEGORIES.includes(entry.category);
  const approved = isApprovedForClinician(entry);

  return (
    <article
      className={`rounded-2xl border p-4 shadow-sm ${
        isCare
          ? "border-clinical-100 bg-clinical-50"
          : "border-coral-300/40 bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-ink-700">
          <span aria-hidden>{CATEGORY_ICON[entry.category]}</span>
          <span className="font-semibold capitalize">{entry.category}</span>
          <span>·</span>
          <span>{formatDate(entry.occurredAt)}</span>
        </div>
        <span
          className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            isCare ? "bg-clinical-100 text-clinical-700" : "bg-coral-100 text-coral-600"
          }`}
        >
          {CONTENT_KIND_LABEL[entry.contentKind]}
        </span>
      </div>

      <h3 className="mt-2 font-display text-lg font-semibold text-ink-900">{entry.title}</h3>
      <p className="mt-1 text-sm leading-relaxed text-ink-700">{entry.body}</p>

      {entry.photoUrl && (
        <img
          src={entry.photoUrl}
          alt={entry.title}
          className="mt-3 h-40 w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-700/80">
        <span>
          {entry.contributor} · {sourceLabel(entry)}
        </span>

        <div className="flex items-center gap-2">
          {approved && (
            <span className="rounded-full bg-sage-300/60 px-2.5 py-1 font-semibold text-ink-800">
              Shared with clinician
            </span>
          )}

          {canApproveForClinician(role) && onToggleApprove && (
            <button
              type="button"
              onClick={() => onToggleApprove(entry.id)}
              className={`rounded-full border px-2.5 py-1 font-semibold transition-colors ${
                approved
                  ? "border-sage-500 text-sage-500 hover:bg-sage-50"
                  : "border-clinical-300 text-clinical-700 hover:bg-clinical-100"
              }`}
            >
              {approved ? "Revoke clinician sharing" : "Approve for clinician summary"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
