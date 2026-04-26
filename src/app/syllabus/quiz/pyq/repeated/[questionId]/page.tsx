
import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { questions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getRepeatedQuestions } from '@/actions/pyq-analytics';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import RepeatedQuestionDetailClient from './RepeatedQuestionDetailClient';
import { z } from 'zod';

interface PageProps {
  params: Promise<{
    questionId: string;
  }>;
}

export default async function RepeatedQuestionDetailPage({ params }: PageProps) {
  const { questionId: rawQuestionId } = await params;
  const parsedQuestionId = z.string().uuid().safeParse(rawQuestionId);
  if (!parsedQuestionId.success) {
    notFound();
  }
  const questionId = parsedQuestionId.data;

  // 1. Auth Check
  const user = await verifyAuth();
  if (!user) redirect('/pricing');
  const tier = getUserTier(user);
  if (tier === 'free') redirect('/pricing');

  // 2. Fetch Question Data
  const [questionData] = await db
    .select({
      id: questions.id,
      text: questions.questionText,
      textEn: questions.questionTextEn,
      options: questions.options,
      correctAnswer: questions.correctAnswer,
      explanation: questions.explanation,
      explanationEn: questions.explanationEn,
      extendedData: questions.extendedData,
      testId: questions.testId,
    })
    .from(questions)
    .where(eq(questions.id, questionId));

  if (!questionData) notFound();

  // 3. Fetch Repeated Stats (to show years/occurrences)
  const allRepeated = await getRepeatedQuestions();
  const repeatedStats = allRepeated.find(r => r.questionId === questionId);

  return (
    <RepeatedQuestionDetailClient 
      question={questionData} 
      stats={repeatedStats}
    />
  );
}
