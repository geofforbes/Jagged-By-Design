export type Role = "family" | "admin";

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
