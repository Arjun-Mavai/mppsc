import { redirect } from 'next/navigation';
import {
  getPublishedPyqFacts,
  getPublishedPyqFactsByYear,
  getPyqInsightSubjects,
  getPyqInsightsCoverageSummary,
  getPyqPublishedTopicsBySubject,
} from '@/features/tests/actions/pyq-insights';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import PYQFactsClient from './PYQFactsClient';

// ISR: Revalidate every hour - facts are mostly static
export const revalidate = 3600;

interface PageProps {
  searchParams: Promise<{
    subject?: string;
    topic?: string;
    year?: string;
    view?: string;
    limit?: string;
  }>;
}

export default async function PYQFactsPage({ searchParams }: PageProps) {
  redirect('/');
  
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }
  
  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  const params = await searchParams;
  const [subjects, coverage] = await Promise.all([
    getPyqInsightSubjects(),
    getPyqInsightsCoverageSummary(2020, 2025),
  ]);

  const selectedSubject = params.subject?.trim() || subjects[0]?.subject || 'History';
  const selectedView = params.view === 'year' ? 'year' : 'subject';
  const selectedYear = params.year ? Number(params.year) : undefined;
  const yearOptions = coverage.years.filter((item) => item.pyqQuestionCount > 0).map((item) => item.year);
  const rawLimit = Number(params.limit);
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 10), 200) : 50;

  // 1. Fetch topics
  const topics = await getPyqPublishedTopicsBySubject(selectedSubject);

  // 2. Determine selected topic
  const selectedTopic = params.topic?.trim() || undefined;

  // 3. Fetch facts with combined filters
  const factsPayload = await getPublishedPyqFacts(
    selectedSubject, 
    selectedTopic === 'all' ? undefined : selectedTopic, 
    selectedYear,
    limit
  );

  return (
    <PYQFactsClient
      subjects={subjects}
      topics={topics}
      viewMode={selectedView}
      selectedYear={selectedYear}
      selectedSubject={selectedSubject}
      selectedTopic={selectedTopic}
      limit={limit}
      facts={'facts' in factsPayload ? factsPayload.facts : []}
      coverage={coverage}
      yearOptions={yearOptions}
    />
  );
}
