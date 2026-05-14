import Link from 'next/link';
import { notFound } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { isMainsVaultUnlockedUser } from '@/lib/mains-vault-access';
import { getMainsTopicForPage, getMainsSyllabusTree } from '@/actions/mains-actions';
import { MainsTopicContentClient } from '@/components/mains/MainsTopicContentClient';
import { db } from '@/db';
import { mainsPapers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { MainsUnitPart } from '@/lib/mains-syllabus-unit-label';
import { MainsMobileSyllabusDrawer } from '@/components/mains/MainsMobileSyllabusDrawer';

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
  const isFreeUnit = !user && unit.part === 'A' && unit.unitNumber === 1;

  // Fetch syllabus tree for the unified quick navigation drawer
  const tree = await getMainsSyllabusTree(paperId);
  const units =
    tree.success && tree.data
      ? tree.data.map((u) => ({
          id: u.id,
          unitNumber: u.unitNumber,
          part: u.part as MainsUnitPart,
          titleHi: u.titleHi,
          titleEn: u.titleEn,
          topics: (u.topics ?? []).map((t) => ({
            id: t.id,
            titleHi: t.titleHi,
            titleEn: t.titleEn,
            status: t.status ?? 'draft',
          })),
        }))
      : [];

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <div className="flex min-h-0 flex-1 flex-col w-full overflow-hidden">
        <MainsTopicContentClient
          standalonePage={true}
          vaultLocked={!vaultUnlocked && !isFreeUnit && !!content}
          topic={{
            id: topicRes.data.id,
            titleHi,
            titleEn,
            unitId: unit.id,
            paperId,
            paperNumber: paper.paperNumber,
          }}
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
    </div>
  );
}
