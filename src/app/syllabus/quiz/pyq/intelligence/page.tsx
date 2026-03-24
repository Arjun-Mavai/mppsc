import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import {
  getUnitDistributionStats,
  getRepeatedQuestions,
  getMostRepeatedTopics,
  getSubjectDistributionStats,
  getOverallWeightageSubjectData,
} from '@/actions/pyq-analytics';
import { getSubjectWisePYQStats } from '@/features/tests/actions/pyq-analytics';
import PYQIntelligenceClient from './PYQIntelligenceClient';
import { unstable_cache } from 'next/cache';

// ISR: Revalidate every 1 hour (data is fixed for 6 years 2020-2025)
export const revalidate = 3600;

// Cached versions of the analytics functions  
const getCachedSubjectStats = unstable_cache(getSubjectDistributionStats, ['subject-stats-v5'], { revalidate: 3600 });
const getCachedUnitStats = unstable_cache(getUnitDistributionStats, ['unit-stats-v5'], { revalidate: 3600 });
const getCachedRepeatedQuestions = unstable_cache(getRepeatedQuestions, ['repeated-v6'], { revalidate: 3600 });
const getCachedTopicStats = unstable_cache(getMostRepeatedTopics, ['topics-v5'], { revalidate: 3600 });
const getCachedSubjectQuestionsData = unstable_cache(getOverallWeightageSubjectData, ['subject-questions-v5'], { revalidate: 3600 });

export default async function PYQIntelligencePage() {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }

  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  // Fetch all intelligence data in parallel
  const [subjectStats, unitStats, repeatedQuestions, topicStats, simpleSubjectStats, subjectQuestionsData] = await Promise.all([
    getCachedSubjectStats(),
    getCachedUnitStats(),
    getCachedRepeatedQuestions(),
    getCachedTopicStats(),
    getSubjectWisePYQStats(), // Same as PYQ page uses
    getCachedSubjectQuestionsData(), // Subject-wise questions for expanded view
  ]);

  return (
    <PYQIntelligenceClient
      subjectStats={subjectStats}
      stats={unitStats}
      repeatedQuestions={repeatedQuestions}
      topicStats={topicStats}
      simpleSubjectStats={simpleSubjectStats}
      subjectQuestionsData={subjectQuestionsData}
    />
  );
}
