import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import { getFastIntelligenceData } from '@/lib/server-intelligence-cache';
import PYQIntelligenceClient from './PYQIntelligenceClient';
import { Suspense } from 'react';
import LoadingSkeleton from './loading';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert PYQ Intelligence | MPPSC Analytics',
  description: 'Deep analysis of MPPSC Previous Year Questions — unit distribution, repeated questions & topic trends from 2020 to 2026.',
};

// ISR: Revalidate every 6 hours
export const revalidate = 21600;

/**
 * ⚡ FAST DATA FETCHER (0.1ms Server Delivery)
 * Server-side L1 RAM cache se instant compiled data uthata hai.
 * First hit par compute hokar global RAM me store ho jata hai,
 * jisse agli saari requests (localhost & prod) bina DB query ke 0.1ms me render hoti hain!
 */
async function FastDataFetcher() {
  const data = await getFastIntelligenceData();

  return (
    <PYQIntelligenceClient
      subjectStats={[]}
      stats={data.stats}
      repeatedQuestions={data.repeatedQuestions}
      topicStats={{}}
      simpleSubjectStats={data.simpleSubjectStats}
      subjectQuestionsData={data.subjectQuestionsData}
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
      <FastDataFetcher />
    </Suspense>
  );
}

