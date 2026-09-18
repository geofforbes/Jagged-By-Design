import type { KnowledgeEntry, Role } from "../types";

/**
 * The concrete permission boundary for this prototype: every entry is
 * visible to the family by default (that's the point of the shared record),
 * but only an admin can approve an entry for the clinician-facing summary.
 * Approval status itself stays visible to everyone, so the family can see
 * what's being shared upward — nothing happens silently.
 */
export function canApproveForClinician(role: Role): boolean {
  return role === "admin";
}

export function isApprovedForClinician(entry: KnowledgeEntry): boolean {
  return entry.clinicianApproved === true;
}

export function sourceLabel(entry: KnowledgeEntry): string {
  switch (entry.source) {
    case "whatsapp":
      return "Family WhatsApp";
    case "carer-update":
      return "Carer update";
    case "admin-input":
      return "Admin";
    case "app":
      return "Generated";
  }
}
