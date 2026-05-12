'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listMainsPyqPapersLibrarySummary, getMainsPyqPaperPublic } from '@/actions/mains-pyq-prepared-actions';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockMainsModal } from '@/features/mains/components/SyllabusLockMainsModal';
import { MAINS_PYQ_DEMO_PAPER_NUMBER, MAINS_PYQ_DEMO_YEAR } from '@/lib/mains-vault-demo';
import { cn } from '@/lib/utils';
import { PyqDeskControls } from './PyqDeskControls';
import { PyqLibraryHeader } from './PyqLibraryHeader';
import { PyqQuestionList, type QRow } from './PyqQuestionList';
import { PyqLibraryErrorBoundary } from './PyqLibraryErrorBoundary';

type Paper = {
  id: string;
  examYear: number;
  paperNumber: number;
};

type ReadingTheme = 'deep' | 'paper';

type MainsPyqPaperListResponse =
  | { success: true; data: Array<{ id: string; examYear: number; paperNumber: number }> }
  | { success: false; error: 'fetch_failed'; detail?: string };

export function PyqLibraryClient({ vaultUnlocked }: { vaultUnlocked: boolean }) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  // State management
  const [papers, setPapers] = useState<Paper[]>([]);
  const [paperId, setPaperId] = useState('');
  const [questions, setQuestions] = useState<QRow[]>([]);
  const [meta, setMeta] = useState<{ examYear: number; paperNumber: number } | null>(null);

  const [loadingList, setLoadingList] = useState(true);
  const [loadingQ, setLoadingQ] = useState(false);
  const [papersError, setPapersError] = useState(false);
  const [papersErrorDetail, setPapersErrorDetail] = useState<string | null>(null);
  const [questionsLoadIssue, setQuestionsLoadIssue] = useState<'none' | 'not_found' | 'fetch_failed'>('none');

  const [readingTheme, setReadingTheme] = useState<ReadingTheme>('paper');
  const [deskControlsOpen, setDeskControlsOpen] = useState(false);
  const [partFilter, setPartFilter] = useState<string>('ALL');
  const [vaultModalOpen, setVaultModalOpen] = useState(false);

  // Load papers list
  const loadList = useCallback(async () => {
    setLoadingList(true);
    const r = (await listMainsPyqPapersLibrarySummary()) as MainsPyqPaperListResponse;
    setLoadingList(false);
    setPapersError(!r.success);
    setPapersErrorDetail(!r.success && 'detail' in r ? (r.detail ?? null) : null);
    if (!r.success) {
      setPapers([]);
      return;
    }
    const list = r.data ?? [];
    setPapers(list);
    if (list.length === 0) {
      setPaperId('');
      return;
    }
    setPaperId((prev) => {
      if (prev && list.some((p) => p.id === prev)) return prev;
      if (!vaultUnlocked) {
        const demo = list.find((p) => p.examYear === MAINS_PYQ_DEMO_YEAR && p.paperNumber === MAINS_PYQ_DEMO_PAPER_NUMBER);
        if (demo) return demo.id;
      }
      return list[0]!.id;
    });
  }, [vaultUnlocked]);

  // Load questions for selected paper
  const loadQs = useCallback(async (pid: string) => {
    if (!pid) return;
    setLoadingQ(true);
    setQuestionsLoadIssue('none');
    const r = await getMainsPyqPaperPublic(pid);
    setLoadingQ(false);
    if (r.success && r.data) {
      setMeta({ examYear: r.data.paper.examYear, paperNumber: r.data.paper.paperNumber });
      setQuestions(r.data.questions as QRow[]);
    } else {
      setQuestions([]);
      setMeta(null);
      if (r.success === false) {
        setQuestionsLoadIssue(r.error === 'not_found' ? 'not_found' : 'fetch_failed');
      }
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadList();
  }, [loadList]);

  // Load questions when paper changes
  useEffect(() => {
    if (!paperId) return;
    loadQs(paperId);
  }, [paperId, loadQs]);

  // Reset filter on paper change
  useEffect(() => {
    setPartFilter('ALL');
  }, [paperId]);

  const isDemoPaper =
    meta != null && meta.examYear === MAINS_PYQ_DEMO_YEAR && meta.paperNumber === MAINS_PYQ_DEMO_PAPER_NUMBER;

  const themeDeep = readingTheme === 'deep';
  const shell = cn(
    'relative min-h-screen w-screen max-w-[100vw] overflow-x-hidden px-2 pb-24 pt-5 sm:px-2.5 sm:pb-28 sm:pt-6',
    themeDeep ? 'text-slate-100' : 'bg-[#fafbfc] text-slate-900'
  );
  const blobClass = 'pointer-events-none absolute rounded-full blur-[100px] opacity-40';

  return (
    <div className={shell} style={{ marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
      {!themeDeep ? (
        <>
          <div className={`${blobClass} top-[-80px] right-[-120px] h-[420px] w-[420px] bg-pink-100`} />
          <div className={`${blobClass} top-[30%] left-[-100px] h-[380px] w-[380px] bg-emerald-100`} />
          <div className={`${blobClass} bottom-[10%] right-[10%] h-[320px] w-[320px] bg-amber-100`} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-slate-50/80 to-transparent" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-3xl px-1 sm:px-1.5">
        <Button
          variant="ghost"
          className={cn(
            'mb-6',
            themeDeep ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          )}
          asChild
        >
          <Link href="/mains/syllabus">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {hi ? 'सिलेबस' : 'Syllabus'}
          </Link>
        </Button>

        <PyqLibraryHeader
          readingTheme={readingTheme}
          deskControlsOpen={deskControlsOpen}
          onControlsToggle={setDeskControlsOpen}
        />

        <PyqDeskControls
          papers={papers}
          paperId={paperId}
          onPaperChange={setPaperId}
          readingTheme={readingTheme}
          onThemeChange={setReadingTheme}
          deskControlsOpen={deskControlsOpen}
          onControlsToggle={setDeskControlsOpen}
        />

        <PyqLibraryErrorBoundary
          readingTheme={readingTheme}
          papersError={papersError}
          papersErrorDetail={papersErrorDetail}
          questionsLoadIssue={questionsLoadIssue}
          loadingList={loadingList}
          loadingQ={loadingQ}
          papersCount={papers.length}
          onRetryPapers={loadList}
        >
          <PyqQuestionList
            questions={questions}
            partFilter={partFilter}
            onPartFilterChange={setPartFilter}
            readingTheme={readingTheme}
            vaultUnlocked={vaultUnlocked}
            isDemoPaper={isDemoPaper}
            onVaultModalOpen={() => setVaultModalOpen(true)}
          />
        </PyqLibraryErrorBoundary>
      </div>

      <SyllabusLockMainsModal open={vaultModalOpen} onOpenChange={setVaultModalOpen} />
    </div>
  );
}
