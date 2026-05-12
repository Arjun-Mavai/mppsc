/**
 * EXAMPLE 1: Protect Quiz Question Display
 * 
 * Usage in QuizPlayClient.tsx:
 * <ProtectedQuestionCard question={question} userId={userId} />
 */

import { useSession } from 'next-auth/react';
import { ProtectedContent } from '@/hooks/use-content-protection';

interface QuestionCardProps {
  questionId: string;
  questionText: string;
  options: string[];
}

export function ProtectedQuestionCard({
  questionId,
  questionText,
  options,
}: QuestionCardProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <ProtectedContent
      userId={userId}
      type="question"
      contentId={questionId}
      enableTracking={true}
    >
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <div className="text-lg font-semibold mb-4">{questionText}</div>
        
        <div className="space-y-3">
          {options.map((option, idx) => (
            <label key={idx} className="flex items-center p-3 border rounded-md hover:bg-blue-50 cursor-pointer">
              <input type="radio" name="answer" className="mr-3" />
              <span>{option}</span>
            </label>
          ))}
        </div>
      </div>
    </ProtectedContent>
  );
}

/**
 * EXAMPLE 2: Protect Answer Explanation
 * 
 * Usage: <ProtectedExplanation questionId={id} explanation={text} />
 */

export function ProtectedExplanation({
  questionId,
  explanation,
}: {
  questionId: string;
  explanation: string;
}) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return (
    <ProtectedContent
      userId={userId}
      type="explanation"
      contentId={questionId}
      enableTracking={true}
    >
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
        <h4 className="font-semibold mb-2">📖 Explanation</h4>
        <p className="text-gray-800 leading-relaxed">{explanation}</p>
      </div>
    </ProtectedContent>
  );
}

/**
 * EXAMPLE 3: Protect Entire Quiz Session
 * 
 * Usage in QuizPlayClient:
 * <ProtectedQuizSession userId={userId} quizId={quizId}>
 *   <AllQuestions />
 * </ProtectedQuizSession>
 */

export function ProtectedQuizSession({
  children,
  userId,
  quizId,
}: {
  children: React.ReactNode;
  userId?: string;
  quizId: string;
}) {
  return (
    <ProtectedContent userId={userId} type="quiz" contentId={quizId} enableTracking={true}>
      <div>{children}</div>
    </ProtectedContent>
  );
}
