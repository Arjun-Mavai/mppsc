import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Hourglass } from 'lucide-react';
import { MainsMobileSyllabusDrawer } from '@/components/mains/MainsMobileSyllabusDrawer';
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

  let firstTopicId: string | null = null;
  if (tree.success && tree.data?.length) {
    for (const u of tree.data) {
      const first = u.topics?.[0];
      if (first) {
        firstTopicId = first.id;
        break;
      }
    }
  }

  if (!tree.success || !tree.data?.length || !firstTopicId) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        {/* Header Container with Syllabus Menu Drawer */}
        <div className="fixed top-14 left-0 right-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-md shadow-sm dark:border-slate-800/80 dark:bg-slate-950/90">
          <div className="flex items-center gap-2 min-w-0 text-left pr-1">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl shrink-0" asChild>
              <Link href="/mains">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="min-w-0 text-left pr-1">
              <p className="truncate text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 leading-tight">
                🎯 Paper {paper.paperNumber}
              </p>
              <p className="truncate text-xs font-black text-slate-900 dark:text-slate-100 mt-0.5 leading-snug">
                {paper.titleHi || paper.titleEn}
              </p>
            </div>
          </div>
          <div className="flex items-center shrink-0">
            <MainsMobileSyllabusDrawer paperNumber={paper.paperNumber} language="hi" />
          </div>
        </div>

        {/* 3D Premium Coming Soon Container */}
        <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-16 text-center bg-slate-50/40 dark:bg-slate-900/40 pt-20">
          <div className="max-w-2xl w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-950 p-10 md:p-14 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 space-y-6">
            <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 shadow-inner mb-2">
              <Hourglass className="size-8" />
            </div>

            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-xs font-black uppercase tracking-widest text-amber-400 border border-amber-500/30 shadow-sm">
                <span>🚀</span>
                <span>जल्द आ रहा है · Coming Soon</span>
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                {paper.titleHi ? `पेपर ${paper.paperNumber}: ${paper.titleHi}` : `Paper ${paper.paperNumber}: ${paper.titleEn}`}
              </h2>

              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg mx-auto pt-2 font-medium">
                इस पेपर के सभी यूनिट्स, टॉपिक्स और एक्सपर्ट मॉडल उत्तर तैयार किए जा रहे हैं। जल्द ही पूरे विश्लेषण और मेंस लाइब्रेरी के साथ उपलब्ध होंगे।
              </p>
            </div>
          </div>
        </div>
      </div>
    );
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
      allowGuestPreview={!user}
    />
  );
}
