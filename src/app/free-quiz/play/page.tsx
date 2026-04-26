import { redirect } from 'next/navigation';
import { getFreeQuizWithQuestions } from '../actions';
import { FreeQuizPlayClient } from './FreeQuizPlayClient';
import { verifyAuth } from '@/lib/auth';
import { Question } from '@/types/quiz';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { mapRawQuestionToClientQuestion } from '@/lib/quiz-question-normalize';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ProductionErrorBoundary } from '@/components/ProductionErrorBoundary';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';

interface PageProps {
  searchParams: Promise<{ testId?: string }>;
}

// Global loading state for this page
function LoadingSkeleton() {
  return <PYQFactsLoader variant="page" label="Preparing your quiz..." theme="light" />;
}

async function FreeQuizDataFetcher({ searchParams }: { searchParams: Promise<{ testId?: string }> }) {
  const user = await verifyAuth();
  const params = await searchParams;
  const { testId } = params;

  // testId nahi h to listing pe wapas bhejo
  if (!testId) redirect('/free-quiz');

  // Test + questions fetch karo
  const testData = await getFreeQuizWithQuestions(testId);

  if (!testData || !testData.questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Test Not Found</h1>
          <p className="text-slate-500">
            Ye test available nahi h ya questions nahi hain.
          </p>
          <a href="/free-quiz" className="text-indigo-600 hover:underline">
            ← Back to Free Quizzes
          </a>
        </div>
      </div>
    );
  }

  // Questions ko Quiz format me map karo — questionText, explanation_hi/en, left/right matchPairs
  const questions: Question[] = testData.questions.map((q) =>
    mapRawQuestionToClientQuestion(q as unknown as Record<string, unknown>, {
      subject: q.subject || undefined,
      marks: SCORING_CONFIG.MARKS_PER_QUESTION,
      negativeMarks: SCORING_CONFIG.NEGATIVE_MARKING,
    })
  );

  if (questions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Invalid Questions</h1>
          <p className="text-slate-500">Questions load nahi ho paaye.</p>
          <a href="/free-quiz" className="text-indigo-600 hover:underline">
            ← Back to Free Quizzes
          </a>
        </div>
      </div>
    );
  }

  const tags = Array.isArray(testData.tags) ? (testData.tags as string[]) : [];
  const disableInstantMode = tags.includes('no-instant-mode');

  return (
    <ProductionErrorBoundary>
      <FreeQuizPlayClient
        questions={questions}
        testId={testId}
        title={testData.title}
        disableInstantMode={disableInstantMode}
        user={
          user
            ? {
                name: user.name || 'Guest',
                email: user.email,
                mobile: user.phone,
              }
            : null
        }
      />
    </ProductionErrorBoundary>
  );
}

export default async function FreeQuizPlayPage({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <FreeQuizDataFetcher searchParams={searchParams} />
    </Suspense>
  );
}
