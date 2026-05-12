import { getMainsProgressOverview } from '@/actions/mains-actions';
import { MainsSyllabusHubClient, type MainsSyllabusHubPaper } from '@/app/mains/syllabus/MainsSyllabusHubClient';

export default async function MainsSyllabusPaperPickerPage() {
  const res = await getMainsProgressOverview();
  const missing =
    !res.success && (res as { error?: string; hint?: string }).error === 'mains_tables_missing'
      ? (res as { hint?: string }).hint ?? null
      : null;

  const papers: MainsSyllabusHubPaper[] =
    res.success && res.data
      ? res.data.map((p) => ({
          id: p.id,
          paperNumber: p.paperNumber,
          titleEn: p.titleEn,
          titleHi: p.titleHi,
          totalTopics: p.totalTopics,
          publishedTopics: p.publishedTopics,
          progress: p.progress,
        }))
      : [];

  return <MainsSyllabusHubClient papers={papers} missing={missing} />;
}
