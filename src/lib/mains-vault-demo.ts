/** Public teaser: full PYQ desk UI; only these unlock without `mppsc_mains`. */

export const MAINS_PYQ_DEMO_YEAR = 2024;
export const MAINS_PYQ_DEMO_PAPER_NUMBER = 1;

/** One free teaser per marks band below (2m / 5m / 7m) when the paper has them. */
export const MAINS_PYQ_FREE_QUESTION_CAP = 3;

/** Prefer one question each from these bands (Paper 1, demo year only). Order = pick priority. */
export const MAINS_PYQ_FREE_MARKS_PRIORITY = [2, 5, 7] as const;

export type PyqMarksPickRow = { id: string; marks: number };

/**
 * Chooses up to `MAINS_PYQ_FREE_QUESTION_CAP` ids in **display order** of `questions`:
 * first match per preferred mark (2 → 5 → 7), then any extra from the tail if slots remain.
 */
export function pickMainsPyqFreeDemoQuestionIds(questions: PyqMarksPickRow[]): Set<string> {
  const ids = new Set<string>();
  for (const m of MAINS_PYQ_FREE_MARKS_PRIORITY) {
    if (ids.size >= MAINS_PYQ_FREE_QUESTION_CAP) break;
    const hit = questions.find((q) => q.marks === m && !ids.has(q.id));
    if (hit) ids.add(hit.id);
  }
  if (ids.size < MAINS_PYQ_FREE_QUESTION_CAP) {
    for (const q of questions) {
      if (ids.size >= MAINS_PYQ_FREE_QUESTION_CAP) break;
      if (!ids.has(q.id)) ids.add(q.id);
    }
  }
  return ids;
}

/** Display order for free strip: preferred marks bands first, then stable by original index. */
function markTierForDemoSort(marks: number): number {
  if (marks === 2) return 0;
  if (marks === 5) return 1;
  if (marks === 7) return 2;
  return 99;
}

export function orderMainsPyqRowsForVaultDemo<T extends PyqMarksPickRow>(
  questions: T[],
  freeIds: Set<string>,
  vaultUnlocked: boolean
): T[] {
  if (vaultUnlocked || freeIds.size === 0) return questions;
  const free = questions.filter((q) => freeIds.has(q.id));
  const locked = questions.filter((q) => !freeIds.has(q.id));
  free.sort((a, b) => markTierForDemoSort(a.marks) - markTierForDemoSort(b.marks));
  return [...free, ...locked];
}
