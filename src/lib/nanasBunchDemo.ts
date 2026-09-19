import type { DemoResults } from "../components/ResultsPreview";

/**
 * Curated, hand-built structured output for the exact "Nana's Bunch" chat
 * export (Sally / Helen Lowe / Willow House family) the user confirmed is
 * the one actual file used in the live demo. Per explicit instruction: full
 * dynamic parsing to hit a specific, polished bar for this file wasn't worth
 * the cost - this hardcoded dataset IS the demo's "Care Co. app" content for
 * this file, grounded in real lines from that chat (see git history for the
 * source .txt). Detected in DemoPage.tsx by a couple of distinctive real
 * sender names; any other upload still goes through the live classifier.
 *
 * photo_url is left null here and filled in at runtime in DemoPage.tsx from
 * the real zip's own attachment blobs, matched by attachmentFilename - the
 * same mechanism used for any other zip upload.
 */
export const NANAS_BUNCH_MARKER_SENDERS = ["Helen Lowe", "Zoe Bennett"];

export const NANAS_BUNCH_LOVED_ONE = "Sally";
export const NANAS_BUNCH_ALIASES = ["Nana", "Mom", "Mum"];

export const NANAS_BUNCH_PHOTO_ATTACHMENTS: Record<number, string> = {
  1: "IMG-2026-0829.jpg",
  3: "IMG-2026-0829-B.jpg",
};

export function buildNanasBunchResults(): DemoResults {
  return {
    care: [
      {
        id: 1,
        insight_category: "Cognitive",
        severity: "High",
        title: "Increased confusion and distress during a visit",
        body: "Sally believed a visiting family member had come to make her leave and repeatedly asked where her bags were. Settled once he stayed and looked at old recipe books with her - family noted this was more confused and frightened than the previous day.",
        occurred_at: "2026-09-16T15:04:00Z",
        person_name: "Liam Bennett",
      },
      {
        id: 2,
        insight_category: "Safety",
        severity: "Medium",
        title: "Swelling in feet, nurse and GP review arranged",
        body: "Staff noted Sally's feet looking puffy; a nurse checked and a GP review was arranged. Family were asked to keep an eye on how new shoes fit while the swelling is monitored.",
        occurred_at: "2026-09-14T10:42:00Z",
        person_name: "Mark Bennett",
      },
      {
        id: 3,
        insight_category: "Cognitive",
        severity: "Medium",
        title: "Short-term memory lapse - misplaced item",
        body: "Sally asked for help finding her handbag while it was on the chair beside her the whole time. Brief moment of confusion, resolved quickly once pointed out.",
        occurred_at: "2026-09-03T19:17:00Z",
        person_name: "Liam Bennett",
      },
      {
        id: 4,
        insight_category: "Sleep / Circadian",
        severity: "Medium",
        title: "Early waking, reminiscing about childhood",
        body: "Sally called at six asking if the school bus had come, appearing to recall her own childhood rather than the present day. Settled after breakfast with no distress.",
        occurred_at: "2026-09-08T08:29:00Z",
        person_name: "Helen Lowe",
      },
      {
        id: 5,
        insight_category: "Social",
        severity: "Low",
        title: "Brief misidentification during a phone call",
        body: "Sally mistook a family member for her sister for a moment during a call, but retained other specific details (their dislike of office coffee) accurately. Common presentation, no distress noted.",
        occurred_at: "2026-09-16T10:32:00Z",
        person_name: "Ella Lowe",
      },
      {
        id: 6,
        insight_category: "Positive",
        severity: "Positive",
        title: "Engaged, joyful outing to a cafe",
        body: "Sally chose the cafe, sang along with the radio and recalled her mother playing the same song on Sundays. Ate half a scone and all the jam. Positive affect throughout.",
        occurred_at: "2026-09-12T11:06:00Z",
        person_name: "Zoe Bennett",
      },
    ],
    lifeStory: [
      {
        id: 7,
        occurred_at: "2026-08-29T10:41:00Z",
        era_label: null,
        summary: "Sally after breakfast in the courtyard - still enjoys walking to the dining room when she feels up to it, on her own terms.",
        person_name: "Helen Lowe",
        photo_url: null,
      },
      {
        id: 8,
        occurred_at: "2026-08-29T10:56:00Z",
        era_label: null,
        summary: "A genuinely cheerful music session - Sally laughed and remembered the chorus, even losing track of the day for a while.",
        person_name: "Priya Bennett",
        photo_url: null,
        is_bite: true,
      },
      {
        id: 9,
        occurred_at: "2026-08-29T15:18:00Z",
        era_label: null,
        summary: "Pasties after music - Sally supervised the crimping and ate one while it was still warm.",
        person_name: "Priya Bennett",
        photo_url: null,
      },
      {
        id: 10,
        occurred_at: "2026-09-03T19:17:00Z",
        era_label: null,
        summary: "A funny mix-up - Sally asked for help finding her handbag, which was on the chair right beside her the whole time.",
        person_name: "Liam Bennett",
        photo_url: null,
        is_bite: true,
      },
      {
        id: 11,
        occurred_at: "2026-09-12T11:06:00Z",
        era_label: null,
        summary: "Sang along with the cafe radio and remembered her mother playing the same song on Sundays.",
        person_name: "Zoe Bennett",
        photo_url: null,
      },
      {
        id: 12,
        occurred_at: "2026-09-13T18:22:00Z",
        era_label: null,
        summary: "Held hands for twenty minutes, quiet and content - called her daughter \"my little girl\" and told her to put a jersey on.",
        person_name: "Helen Lowe",
        photo_url: null,
      },
      {
        id: 13,
        occurred_at: "2026-09-17T11:58:00Z",
        era_label: null,
        summary: "Picked purple flowers in the garden and gave the family her first proper smile of the day.",
        person_name: "Zoe Bennett",
        photo_url: null,
      },
    ],
    calendar: [
      {
        id: 14,
        title: "GP review - swelling follow-up",
        item_type: "appointment",
        due_at: "2026-09-15",
        due_time: "11:00",
        notes: "Nurse following the swelling; GP to send written note after.",
        person_name: "Helen Lowe",
      },
      {
        id: 15,
        title: "Return size 6 shoes to shop",
        item_type: "task",
        due_at: "2026-09-17",
        due_time: null,
        notes: "Full refund - keep the receipt photo.",
        person_name: "Priya Bennett",
      },
      {
        id: 16,
        title: "Hairdresser appointment",
        item_type: "appointment",
        due_at: "2026-09-22",
        due_time: "12:00",
        notes: "Ella taking her - haircut and a coffee if she's got the energy.",
        person_name: "Ella Lowe",
      },
      {
        id: 17,
        title: "Sunday garden tea",
        item_type: "visit",
        due_at: "2026-09-20",
        due_time: null,
        notes: "Zoe bringing a flask and the photo album, weather permitting - check with Sally on the morning.",
        person_name: "Zoe Bennett",
      },
    ],
  };
}
