/** Stored in `guests.lead_source` for attribution & admin. */
export const GUEST_LEAD_SOURCE = {
  OPEN_PYQ_2026: 'open_pyq_2026',
  FREE_QUIZ: 'free_quiz',
  INTELLIGENCE_REACTION: 'intelligence_reaction',
  SUBJECT_QUESTIONS_VIEW: 'subject_questions_view',
} as const;

export type GuestLeadSource = (typeof GUEST_LEAD_SOURCE)[keyof typeof GUEST_LEAD_SOURCE];

export function getGuestLeadSourceLabel(source: string | null | undefined): string {
  if (source === GUEST_LEAD_SOURCE.OPEN_PYQ_2026) {
    return 'Open PYQ 2026';
  }
  if (source === GUEST_LEAD_SOURCE.FREE_QUIZ) {
    return 'Free quiz';
  }
  if (source === GUEST_LEAD_SOURCE.INTELLIGENCE_REACTION) {
    return 'Intelligence Reaction';
  }
  if (!source) return '—';
  return source;
}
