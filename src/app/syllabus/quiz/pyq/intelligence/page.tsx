import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import {
  getUnitDistributionStats,
  getRepeatedQuestions,
  getOverallWeightageSubjectData,
  type RepeatedQuestion,
} from '@/actions/pyq-analytics';
import { getSubjectWisePYQStats } from '@/features/tests/actions/pyq-analytics';
import PYQIntelligenceClient from './PYQIntelligenceClient';
import { unstable_cache } from 'next/cache';
import { Suspense } from 'react';
import LoadingSkeleton from './loading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert PYQ Intelligence | MPPSC Analytics',
  description: 'Deep analysis of MPPSC Previous Year Questions — unit distribution, repeated questions & topic trends from 2020 to 2025.',
};

// ISR: Revalidate every 6 hours — data is fixed for 2020–2025 period
export const revalidate = 21600;

// ── Cached analytics functions (unique stable keys) ─────────────────────────
const getCachedUnitStats = unstable_cache(
  getUnitDistributionStats,
  ['intelligence-unit-stats-v6'],
  { revalidate: 21600 }
);
const getCachedSubjectQuestionsData = unstable_cache(
  getOverallWeightageSubjectData,
  ['intelligence-subject-questions-v6'],
  { revalidate: 21600 }
);

async function IntelligenceDataFetcher() {
  // 🚀 Optimize: Only run queries that are actually rendered in the UI
  const [unitStats, repeatedQuestions, simpleSubjectStats, subjectQuestionsData] =
    await Promise.all([
      getCachedUnitStats(),
      getRepeatedQuestions(),          // Already has its own unstable_cache internally
      getSubjectWisePYQStats(),        // Already has its own unstable_cache internally
      getCachedSubjectQuestionsData(),
    ]);

  // Strip down raw repeated questions because PaperAnalysis only needs the count
  const minimalRepeatedQuestions: RepeatedQuestion[] = repeatedQuestions.map(rq => ({
    questionId: rq.questionId,
    count: rq.count,
    text: '', // Omitted to save RSC payload size
    occurrences: [],
    topics: []
  }));

  return (
    <PYQIntelligenceClient
      subjectStats={[]}
      stats={unitStats}
      repeatedQuestions={minimalRepeatedQuestions}
      topicStats={{}}
      simpleSubjectStats={simpleSubjectStats}
      subjectQuestionsData={subjectQuestionsData}
    />
  );
}

export default async function PYQIntelligencePage() {
  const user = await verifyAuth();
  if (!user) redirect('/pricing');

  const tier = getUserTier(user);
  if (tier === 'free') redirect('/pricing');

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <IntelligenceDataFetcher />
    </Suspense>
  );
}
