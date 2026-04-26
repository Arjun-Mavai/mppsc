export type BilingualOption =
  | string
  | { text: string; textEn?: string; text_en?: string; [key: string]: unknown };

export interface Question {
  id: string;
  question: string;
  questionEn?: string | null;
  options: BilingualOption[];
  correctAnswer: number;
  explanation?: string;
  explanationEn?: string | null;
  explanation_hi?: string | null; // Optional override handling if needed
  extendedData?: unknown; // Structured expert JSON data
  marks: number;

  negativeMarks?: number;
  type?: 'standard' | 'matching';
  subject?: string; // 🏷️ New field for mixed quizzes
  /**
   * Normalized from DB/API: { label, matchId, match, ... }.
   * Upload JSON may use `left` / `right` / `left_en` / `right_en`; those are converted in mapRawQuestionToClientQuestion.
   */
  matchPairs?: {
    id: string;
    label: string;
    labelEn?: string;
    match: string;
    matchId: string;
    matchEn?: string;
  }[];
}

export interface TestAttempt {
  id: string;
  testId: string;
  userId: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTaken: number;
  createdAt: Date;
}
