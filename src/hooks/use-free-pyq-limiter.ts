/**
 * Free PYQ Limiter: Show only 5 free questions to non-login users
 * 
 * Logic:
 * • Sort by marks: 2-mark + 3-mark questions
 * • Show ~6 marks total (5 questions)
 * • Hide rest with unlock modal
 * • Minimal code, zero performance impact
 */

'use client';

import { useSession } from 'next-auth/react';
import { Lock } from 'lucide-react';

export interface Question {
  id: string;
  marks: number;
  text: string;
  [key: string]: any;
}

const FREE_QUESTION_LIMIT = 5;

/**
 * Filter questions for free users
 * Returns: Questions up to ~6 marks (typically 2-mark + 3-mark + 1 more)
 */
export function getFreePyqQuestions(allQuestions: Question[]): Question[] {
  if (!allQuestions) return [];

  // Sort by marks (ascending): 2-mark first, then 3-mark
  const sorted = [...allQuestions].sort((a, b) => (a.marks || 0) - (b.marks || 0));

  // Take first 5 questions or until 6+ marks
  let totalMarks = 0;
  const free: Question[] = [];

  for (const q of sorted) {
    if (free.length >= FREE_QUESTION_LIMIT) break;
    if (totalMarks + (q.marks || 0) > 6) break;

    free.push(q);
    totalMarks += q.marks || 0;
  }

  return free.length > 0 ? free : sorted.slice(0, FREE_QUESTION_LIMIT);
}

/**
 * Component: Show free questions + unlock overlay
 * Usage: <FreePyqDisplay questions={questions} />
 */
export function FreePyqDisplay({
  questions,
  renderQuestion,
}: {
  questions: Question[];
  renderQuestion: (q: Question, idx: number) => React.ReactNode;
}) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  if (!questions || questions.length === 0) return <div>No questions available</div>;

  // If logged in, show all
  if (isLoggedIn) {
    return (
      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={q.id}>{renderQuestion(q, idx)}</div>
        ))}
      </div>
    );
  }

  // Non-login: Show only free questions
  const freeQuestions = getFreePyqQuestions(questions);
  const hiddenCount = questions.length - freeQuestions.length;

  return (
    <div className="space-y-6">
      {/* Free questions */}
      {freeQuestions.map((q, idx) => (
        <div
          key={q.id}
          className="opacity-100 relative"
          style={{ userSelect: 'none' }}
        >
          {renderQuestion(q, idx)}
          {/* Subtle lock badge */}
          <div className="absolute -top-1 -right-1 bg-slate-100 rounded-full p-1 text-xs text-slate-500">
            ✓ Free
          </div>
        </div>
      ))}

      {/* Unlock section (blurred, locked) */}
      {hiddenCount > 0 && (
        <div className="relative mt-12 pt-12 border-t-2 border-slate-200">
          {/* Blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-white/30 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-3">
              <Lock className="w-8 h-8 text-slate-400 mx-auto" />
              <div>
                <p className="font-semibold text-slate-700">
                  {hiddenCount} more questions locked
                </p>
                <p className="text-sm text-slate-500">
                  Sign up to unlock all {questions.length} questions
                </p>
              </div>
            </div>
          </div>

          {/* Hidden questions (blurred beneath overlay) */}
          <div className="blur-md opacity-40 pointer-events-none space-y-6">
            {questions.slice(freeQuestions.length).slice(0, 2).map((q, idx) => (
              <div key={q.id}>{renderQuestion(q, freeQuestions.length + idx)}</div>
            ))}
            {hiddenCount > 2 && (
              <div className="text-center text-slate-500 py-4">
                +{hiddenCount - 2} more questions...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Hook: Determine if user can see all questions
 * Usage: const canSeeAll = useCanSeeAllQuestions();
 */
export function useCanSeeAllQuestions(): boolean {
  const { data: session } = useSession();
  return !!session?.user;
}
