import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import { db } from '@/db';
import { questions as questionsTable } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import { getUnitDistributionStats, getOverallWeightageSubjectData } from '@/actions/pyq-analytics';
import ViewAllQuestionsClient from './ViewAllQuestionsClient';

export default async function ViewAllQuestionsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }

  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  const params = await searchParams;
  const unitId = params.unit as string;
  const unitTitleParam = params.unitTitle as string;
  const source = (params.source as 'paper' | 'overall' | 'topic' | 'subject' | 'combined') || 'overall';
  const year = params.year ? Number(params.year) : undefined;
  const subject = params.subject as string;

  let questionIds: string[] = [];
  let unitTitle = unitTitleParam || '';

  if (source === 'subject' || source === 'overall') {
    const data = await getOverallWeightageSubjectData();
    const group = data.find((g) => g.subject === subject);
    if (group) {
      questionIds = group.questions.map((q) => q.id);
      unitTitle = subject;
    }
  } else if (source === 'paper' || source === 'combined') {
    const data = await getUnitDistributionStats();
    if (source === 'paper' && year) {
      const group = data.find((g) => g.year === year && g.unitId === unitId);
      if (group) {
        questionIds = group.questions.map((q) => q.id);
        unitTitle = group.unitTitle;
      }
    } else {
      // Combined or fallback
      const groups = data.filter((g) => g.unitId === unitId);
      questionIds = groups.flatMap((g) => g.questions.map((q) => q.id));
      unitTitle = groups[0]?.unitTitle || '';
    }
  }

  // Fetch full details for the identified question IDs
  let fullQuestions: any[] = [];
  if (questionIds.length > 0) {
    const chunkSize = 100;
    for (let i = 0; i < questionIds.length; i += chunkSize) {
      const chunk = questionIds.slice(i, i + chunkSize);
      const chunkQuestions = await db
        .select()
        .from(questionsTable)
        .where(inArray(questionsTable.id, chunk));
      fullQuestions = [...fullQuestions, ...chunkQuestions];
    }

    fullQuestions.sort((a, b) => {
      return (a.order || 0) - (b.order || 0);
    });
  }

  return (
    <ViewAllQuestionsClient
      unitId={unitId}
      unitTitle={unitTitle}
      questions={fullQuestions}
      source={source}
      year={year}
      subject={subject}
    />
  );
}
