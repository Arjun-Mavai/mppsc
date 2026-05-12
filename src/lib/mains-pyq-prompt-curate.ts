/** Only these exam years are injected into AI prompts (quality / recency). */
export const PYQ_PROMPT_EXAM_YEARS = [2024, 2023] as const;

export type PyqBand = 'S' | 'M' | 'L';

/** MPPSC-style buckets: short (2–3), mid (5–8), long (10+ incl. 18 case). */
export function pyqMarkBand(marks: number): PyqBand {
  if (marks <= 3) return 'S';
  if (marks <= 8) return 'M';
  return 'L';
}

export type CuratablePyq = {
  id: string;
  marks: number;
  examYear: number;
  linked: boolean;
};

/** Prefer linked stems, then newer year; cap each band (default 2) for prompt size / focus. */
export function curatePyqForPrompt<T extends CuratablePyq>(rows: T[], perBand = 2): T[] {
  const sorted = [...rows].sort((a, b) => {
    if (a.linked !== b.linked) return a.linked ? -1 : 1;
    if (b.examYear !== a.examYear) return b.examYear - a.examYear;
    return 0;
  });
  const n = { S: 0, M: 0, L: 0 };
  const out: T[] = [];
  for (const r of sorted) {
    const b = pyqMarkBand(r.marks);
    if (n[b] < perBand) {
      out.push(r);
      n[b]++;
    }
  }
  return out;
}

export function bandLabel(b: PyqBand): string {
  if (b === 'S') return 'SHORT (2–3 marks)';
  if (b === 'M') return 'MID (5–8 marks)';
  return 'LONG (10+ marks; incl. 11 / case 18)';
}
