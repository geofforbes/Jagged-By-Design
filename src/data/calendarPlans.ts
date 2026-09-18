import type { DayPlan } from "../types";

/**
 * Seeded as if a family lead and clinician had jointly been noting
 * day-specific safety considerations, grounded in nearby Journey entries.
 * Days with no entry here are shown as unrestricted.
 */
export const calendarPlans: DayPlan[] = [
  {
    date: "2026-08-19",
    restrictions: { cooking: true },
    note: "Some difficulty with the TV remote this week — keeping the cooker supervised too, just to be safe.",
    setBy: "Sarah (Family Lead)",
  },
  {
    date: "2026-08-28",
    restrictions: { driving: true },
    note: "Standing precaution since the hearing test — driving stays off the table.",
    setBy: "Dr. Whitfield (Clinician)",
  },
  {
    date: "2026-09-01",
    restrictions: { mobility: true },
    note: "Trouble unlocking her phone to call for help today — steady company on walks for now.",
    setBy: "Sarah (Family Lead)",
  },
  {
    date: "2026-09-16",
    restrictions: { outings: true, driving: true },
    note: "A harder afternoon with some frustration — no unaccompanied outings today.",
    setBy: "Sarah (Family Lead)",
  },
  {
    date: "2026-09-17",
    restrictions: { cooking: true, driving: true },
    note: "A little confused first thing this morning — supervised in the kitchen today.",
    setBy: "Denise (Carer)",
  },
];
