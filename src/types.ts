export type Role = "family" | "admin" | "clinician";

export type EntryCategory =
  | "visit"
  | "observation"
  | "photo"
  | "mood"
  | "pharmacy"
  | "memory"
  | "appointment";

/**
 * Practical/care entries and emotional/memory entries must be visually
 * distinguishable in the timeline (per brief) — this groups categories
 * into the two tones the UI styles differently.
 */
export const CARE_CATEGORIES: EntryCategory[] = [
  "pharmacy",
  "appointment",
  "observation",
  "mood",
];
export const MEMORY_CATEGORIES: EntryCategory[] = ["visit", "photo", "memory"];

export type VisibilityTag = "family" | "care-team" | "clinician-shareable";

export type ContentKind = "fact" | "family-observation" | "ai-summary";

export interface KnowledgeEntry {
  id: string;
  category: EntryCategory;
  contentKind: ContentKind;
  /** When the underlying event happened. */
  occurredAt: string;
  /** When it was captured into the knowledge base (e.g. WhatsApp message time). */
  recordedAt: string;
  contributor: string;
  source: "whatsapp" | "carer-update" | "admin-input" | "app";
  visibility: VisibilityTag;
  title: string;
  body: string;
  photoUrl?: string;
  /** Admin has explicitly approved this entry for a clinician summary. */
  clinicianApproved?: boolean;
  tags?: string[];
  /** Display-only hint for the Memories screen; inferred if omitted. */
  memoryKind?: "photo" | "story" | "voice";
}

export interface LifeFact {
  label: string;
  value: string;
}

export interface LovedOneProfile {
  name: string;
  preferredName: string;
  photoUrl: string;
  birthYear: number;
  lifeFacts: LifeFact[];
  circleOfCare: { name: string; relationship: string }[];
}

export interface Citation {
  entryId: string;
  title: string;
  contentKind: ContentKind;
}

export interface AskResponse {
  answer: string;
  citations: Citation[];
}

export type HighlightTone = "positive" | "practical" | "caution";

export interface Highlight {
  label: string;
  text: string;
  tone: HighlightTone;
}

export interface BeforeIVisitResponse {
  summary: string;
  highlights: Highlight[];
  starters: string[];
  avoid: string[];
  citations: Citation[];
}

/**
 * A pattern or safety note surfaced for a clinician's own judgment —
 * never a diagnosis or a staging assignment.
 */
export interface ClinicalNote {
  label: string;
  detail: string;
}

export interface ClinicalReportResponse {
  summary: string;
  patterns: ClinicalNote[];
  safetyNotes: ClinicalNote[];
  citations: Citation[];
}

export type RestrictionCategory = "mobility" | "cooking" | "outings" | "driving";

export const RESTRICTION_LABELS: Record<RestrictionCategory, string> = {
  mobility: "Independent mobility",
  cooking: "Independent cooking",
  outings: "Unsupervised outings",
  driving: "Driving",
};

export interface DayPlan {
  /** YYYY-MM-DD */
  date: string;
  /** true = restricted that day. Categories not present are unrestricted. */
  restrictions: Partial<Record<RestrictionCategory, boolean>>;
  note?: string;
  setBy?: string;
}
