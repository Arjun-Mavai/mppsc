import { Metadata } from 'next';
import { Suspense } from 'react';
import { mapRawQuestionToClientQuestion } from '@/lib/quiz-question-normalize';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { Question } from '@/types/quiz';
import { getOpenPyq2026WithQuestions } from './actions';
import OpenPyq2026Client from './OpenPyq2026Client';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://mppsc.zenscroll.app';
const pagePath = '/open/2026-mppsc-prelims';

export const metadata: Metadata = {
  title: '2026 MPPSC Prelims — Full paper with explanations (free)',
  description:
    'MPPSC 2026 Prelims previous year paper: full question set with Hindi & English explanations. Unlock once with your contact — no login.',
  alternates: { canonical: `${baseUrl}${pagePath}` },
  openGraph: {
    title: '2026 MPPSC Prelims — free paper + explanations | Mindful MPPSC',
    description:
      'Practice the full 2026 Prelims paper with instant bilingual explanations. Share with fellow aspirants.',
    url: `${baseUrl}${pagePath}`,
    siteName: 'Mindful MPPSC',
    type: 'website',
    images: [{ url: '/og-hero.webp', width: 1200, height: 630, alt: 'Mindful MPPSC' }],
  },
};

async function OpenPyqData() {
  const data = await getOpenPyq2026WithQuestions();
  if (!data || !data.questions.length) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <p className="text-lg font-bold text-slate-800">Paper is temporarily unavailable.</p>
        <p className="mt-2 text-sm text-slate-600">Please try again later or visit the home page.</p>
        <a
          href="/"
          className="mt-6 text-sm font-bold text-indigo-600 hover:underline"
        >
          ← Home
        </a>
      </div>
    );
  }

  const questions: Question[] = data.questions.map((q) =>
    mapRawQuestionToClientQuestion(q as unknown as Record<string, unknown>, {
      subject: q.subject || undefined,
      marks: SCORING_CONFIG.MARKS_PER_QUESTION,
      negativeMarks: SCORING_CONFIG.NEGATIVE_MARKING,
    })
  );

  if (!questions.length) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-slate-600">Could not load questions.</p>
      </div>
    );
  }

  const test = data.test;

  return <OpenPyq2026Client questions={questions} testTitle={test.title} />;
}

export default function OpenPyq2026Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50">
          <PYQFactsLoader variant="page" label="Loading 2026 paper…" theme="light" />
        </div>
      }
    >
      <OpenPyqData />
    </Suspense>
  );
}
