import { notFound } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { isMainsVaultUnlockedUser } from '@/lib/mains-vault-access';
import { getMainsSyllabusTree } from '@/actions/mains-actions';
import { db } from '@/db';
import type { MainsUnitPart } from '@/lib/mains-syllabus-unit-label';
import { mainsPapers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MainsSyllabusPaperMobileGate } from '@/components/mains/MainsSyllabusPaperMobileGate';

export default async function MainsPaperIndexPage({
  params,
}: {
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;

  const paper = await db.query.mainsPapers.findFirst({
    where: eq(mainsPapers.id, paperId),
  });
  if (!paper) notFound();

  const tree = await getMainsSyllabusTree(paperId);
  if (!tree.success || !tree.data?.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-slate-400">
        <p>No units for this paper. Seed the mains syllabus script.</p>
      </div>
    );
  }

  let firstTopicId: string | null = null;
  for (const u of tree.data) {
    const first = u.topics?.[0];
    if (first) {
      firstTopicId = first.id;
      break;
    }
  }

  const units = tree.data.map((u) => ({
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
  }));

  if (!firstTopicId) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-slate-400">
        <p>This paper has units but no topics yet.</p>
      </div>
    );
  }

  const user = await verifyAuth();
  const vaultUnlocked = isMainsVaultUnlockedUser(user);

  return (
    <MainsSyllabusPaperMobileGate
      paperId={paperId}
      paperNumber={paper.paperNumber}
      titleEn={paper.titleEn}
      units={units}
      firstTopicId={firstTopicId}
      vaultUnlocked={vaultUnlocked}
    />
  );
}
