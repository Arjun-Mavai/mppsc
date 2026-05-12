import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMainsSyllabusTree } from '@/actions/mains-actions';
import { db } from '@/db';
import { mainsPapers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { MainsSyllabusSidebar } from '@/components/mains/MainsSyllabusSidebar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { MainsUnitPart } from '@/lib/mains-syllabus-unit-label';

export default async function MainsPaperSyllabusLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ paperId: string }>;
}) {
  const { paperId } = await params;

  const paper = await db.query.mainsPapers.findFirst({
    where: eq(mainsPapers.id, paperId),
  });
  if (!paper) notFound();

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
    <div className="flex h-[100dvh] overflow-hidden">
      <aside className="hidden w-80 shrink-0 border-r border-slate-800 lg:block">
        <div className="flex h-14 items-center border-b border-slate-800 px-4">
          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white" asChild>
            <Link href="/mains/syllabus">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All papers
            </Link>
          </Button>
        </div>
        <MainsSyllabusSidebar paperNumber={paper.paperNumber} units={units} language="hi" />
      </aside>

      <main className="min-h-0 min-w-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex h-14 items-center border-b border-slate-800 px-4 lg:hidden">
          <Button variant="ghost" size="sm" className="text-slate-400" asChild>
            <Link href="/mains/syllabus">Papers</Link>
          </Button>
          <span className="ml-3 truncate text-sm font-bold text-white">
            Paper {paper.paperNumber}
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </main>
    </div>
  );
}
