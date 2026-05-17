import type { Metadata } from 'next';
import { verifyAuth } from '@/lib/auth';
import { isMainsVaultUnlockedUser } from '@/lib/mains-vault-access';
import { PyqLibraryClient } from '@/app/mains/syllabus/pyq-library/PyqLibraryClient';
import {
  getMainsPyqPaperPublic,
  listMainsPyqPapersLibrarySummary,
} from '@/actions/mains-pyq-prepared-actions';
import {
  isMainsPyqDemoPaper,
  MAINS_PYQ_DEMO_PAPER_NUMBER,
  MAINS_PYQ_DEMO_YEAR,
} from '@/lib/mains-vault-demo';
import type { QRow } from '@/app/mains/syllabus/pyq-library/PyqQuestionList';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MPPSC Mains PYQ desk — past papers & model answers',
  description:
    'Official MPPSC Mains previous-year questions with bilingual model answers and expert pointers — practise by paper and section.',
};

export default async function MainsPyqLibraryPage() {
  const user = await verifyAuth();
  const vaultUnlocked = isMainsVaultUnlockedUser(user);

  const papersRes = await listMainsPyqPapersLibrarySummary();
  const initialPapers = papersRes.success
    ? papersRes.data.map((p) => ({
        id: p.id,
        examYear: p.examYear,
        paperNumber: p.paperNumber,
        questionCount: p.questionCount,
      }))
    : [];

  let initialPaperId = initialPapers[0]?.id ?? '';
  let initialQuestions: QRow[] = [];

  if (initialPaperId) {
    if (!vaultUnlocked) {
      const demo = initialPapers.find(
        (p) => p.examYear === MAINS_PYQ_DEMO_YEAR && p.paperNumber === MAINS_PYQ_DEMO_PAPER_NUMBER
      );
      if (demo) initialPaperId = demo.id;
    }

    const needsQuestions =
      vaultUnlocked || isMainsPyqDemoPaper(
        initialPapers.find((p) => p.id === initialPaperId)?.examYear ?? 0,
        initialPapers.find((p) => p.id === initialPaperId)?.paperNumber ?? 0
      );

    if (needsQuestions) {
      const qs = await getMainsPyqPaperPublic(initialPaperId);
      if (qs.success) initialQuestions = qs.data.questions as QRow[];
    }
  }

  return (
    <PyqLibraryClient
      vaultUnlocked={vaultUnlocked}
      allowDemoAccess={!vaultUnlocked}
      initialPapers={initialPapers}
      initialPaperId={initialPaperId}
      initialQuestions={initialQuestions}
    />
  );
}
