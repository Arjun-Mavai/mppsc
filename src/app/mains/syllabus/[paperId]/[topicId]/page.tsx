import Link from 'next/link';
import { notFound } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { isMainsVaultUnlockedUser } from '@/lib/mains-vault-access';
import { getMainsTopicForPage } from '@/actions/mains-actions';
import { MainsTopicContentClient } from '@/components/mains/MainsTopicContentClient';
import { db } from '@/db';
import { mainsPapers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function MainsTopicPage({
  params,
}: {
  params: Promise<{ paperId: string; topicId: string }>;
}) {
  const { paperId, topicId } = await params;

  const paper = await db.query.mainsPapers.findFirst({
    where: eq(mainsPapers.id, paperId),
  });
  if (!paper) notFound();

  const topicRes = await getMainsTopicForPage(topicId, paperId);
  if (!topicRes.success) notFound();

  const user = await verifyAuth();
  const vaultUnlocked = isMainsVaultUnlockedUser(user);

  const { unit, content, titleHi, titleEn } = topicRes.data;
  if (!unit) notFound();

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 px-3 dark:border-slate-800 lg:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/mains/syllabus/${paperId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <span className="truncate text-xs font-bold text-slate-600 dark:text-slate-300">
          {paper.paperNumber} ·{' '}
          {unit.part && unit.part !== 'NONE'
            ? `Part ${unit.part} · `
            : null}
          U{unit.unitNumber}
        </span>
      </div>

      <MainsTopicContentClient
        vaultLocked={!vaultUnlocked && !!content}
        topic={{ id: topicRes.data.id, titleHi, titleEn, unitId: unit.id }}
        content={
          content
            ? {
                conceptHi: content.conceptHi,
                conceptEn: content.conceptEn,
                expertStrategyHi: content.expertStrategyHi ?? '',
                expertStrategyEn: content.expertStrategyEn ?? '',
                modelAnswers: content.modelAnswers as Record<string, { text: string }[]>,
                keyTermsHi: content.keyTermsHi ?? null,
                keyTermsEn: content.keyTermsEn ?? null,
                richPayload: (content as { richPayload?: Record<string, unknown> | null }).richPayload ?? null,
              }
            : null
        }
      />
    </div>
  );
}
