'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { listMainsPyqPapersLibrarySummary, getMainsPyqPaperPublic } from '@/actions/mains-pyq-prepared-actions';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SyllabusLockMainsModal } from '@/features/mains/components/SyllabusLockMainsModal';
import { cn } from '@/lib/utils';
import { PyqDeskControls } from './PyqDeskControls';
import { PyqLibraryHeader } from './PyqLibraryHeader';
import { PyqQuestionList, type QRow } from './PyqQuestionList';
import { PyqLibraryErrorBoundary } from './PyqLibraryErrorBoundary';
import { MAINS_PYQ_DEMO_YEAR, MAINS_PYQ_DEMO_PAPER_NUMBER } from '@/lib/mains-vault-demo';

type Paper = {
  id: string;
  examYear: number;
  paperNumber: number;
};

type ReadingTheme = 'deep' | 'paper';

type MainsPyqPaperListResponse =
  | { success: true; data: Array<{ id: string; examYear: number; paperNumber: number }> }
  | { success: false; error: 'fetch_failed'; detail?: string };

export function PyqLibraryClient({
  vaultUnlocked,
  allowDemoAccess,
}: {
  vaultUnlocked: boolean;
  allowDemoAccess: boolean;
}) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  // State management
  const [papers, setPapers] = useState<Paper[]>([]);
  const [paperId, setPaperId] = useState('');
  const [questions, setQuestions] = useState<QRow[]>([]);

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
      setQuestions(r.data.questions as QRow[]);
    } else {
      setQuestions([]);
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
        <div className="mb-6 flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            className={cn(
              'h-9 px-3',
              themeDeep ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            )}
            asChild
          >
            <Link href="/mains/syllabus">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {hi ? 'सिलेबस' : 'Syllabus'}
            </Link>
          </Button>

          <button
            type="button"
            onClick={() => setDeskControlsOpen(!deskControlsOpen)}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95',
              deskControlsOpen
                ? themeDeep
                  ? 'border-amber-400 bg-amber-950/60 text-amber-300 shadow-md shadow-amber-500/15'
                  : 'border-amber-500 bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : themeDeep
                  ? 'border-slate-700 bg-slate-900 text-slate-300 hover:border-amber-500/50 hover:text-amber-300'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100/50'
            )}
            aria-expanded={deskControlsOpen}
            aria-label={hi ? 'पेपर, थीम व विवरण' : 'Paper, theme & description'}
          >
            <Target className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>

        <PyqLibraryHeader readingTheme={readingTheme} />

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
            paperNumber={papers.find((p) => p.id === paperId)?.paperNumber ?? 1}
            partFilter={partFilter}
            onPartFilterChange={setPartFilter}
            readingTheme={readingTheme}
            vaultUnlocked={vaultUnlocked}
            allowDemoAccess={allowDemoAccess}
            onVaultModalOpen={() => setVaultModalOpen(true)}
          />
        </PyqLibraryErrorBoundary>
      </div>

      <SyllabusLockMainsModal open={vaultModalOpen} onOpenChange={setVaultModalOpen} />
    </div>
  );
}
