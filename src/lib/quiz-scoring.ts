import { QUIZ_CONSTANTS } from '@/config/quiz';

export const SCORING_CONFIG = {
  MARKS_PER_QUESTION: QUIZ_CONSTANTS.MARKS_PER_QUESTION,
  NEGATIVE_MARKING: QUIZ_CONSTANTS.NEGATIVE_MARKING,
} as const;

/**
 * Normalizes correctAnswer from various formats (number, string index "0", or letter "A"-"D")
 * to a numeric index (0-3) for safe comparison in UI and submission.
 */
export function normalizeCorrectAnswer(answer: string | number | null | undefined): number {
  if (answer == null || answer === '') return -1;
  
  // If already a number, just return it
  if (typeof answer === 'number') return Math.floor(answer);
  
  const trimmed = String(answer).trim().toUpperCase();
  if (!trimmed) return -1;

  // 1. Handle numeric strings "0", "1", etc.
  // We use Number() because it handles "0" correctly and returns NaN for "A"
  const num = Number(trimmed);
  if (!isNaN(num) && trimmed !== '') return Math.floor(num);

  // 2. Handle labels A, B, C, D...
  // Use charCode to be generic (A=0, B=1, ...)
  if (trimmed.length === 1) {
    const charCode = trimmed.charCodeAt(0);
    if (charCode >= 65 && charCode <= 90) {
      return charCode - 65;
    }
  }

  return -1;
}

export function calculateScore(
  totalQuestions: number,
  correctCount: number,
  wrongCount: number
): { totalScore: number; maxMarks: number; percentage: number } {
  const totalScore =
    correctCount * SCORING_CONFIG.MARKS_PER_QUESTION - wrongCount * SCORING_CONFIG.NEGATIVE_MARKING;
  const maxMarks = totalQuestions * SCORING_CONFIG.MARKS_PER_QUESTION;

  // Ensure score doesn't go below 0 if that's the rule, but standard exams allow negative.
  // User requested "proper marks distribution".
  // Usually we show negative if user got negative.
  // But let's keep exact value.

  const percentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;

  return {
    totalScore: parseFloat(totalScore.toFixed(2)),
    maxMarks,
    percentage,
  };
}
