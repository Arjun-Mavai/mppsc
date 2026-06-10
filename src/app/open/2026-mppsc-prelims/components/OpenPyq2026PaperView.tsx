'use client';

/**
 * Public open PYQ 2026 — visual parity with
 * /syllabus/quiz/pyq/intelligence/questions (e.g. subject=All).
 * Self-contained: intelligence ViewAllQuestionsClient is not modified.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Filter, Eye, EyeOff, Star, Trophy, Loader2, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { ConnectSocials } from '@/components/ConnectSocials';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import { submitZenFeedback } from '@/actions/intelligence-actions';
import { toast } from 'sonner';
import {
  FormattedQuestionText,
  RenderTableQuestion,
  cleanMatchingQuestionText,
  normalizeMultilineText,
  parseQuestionOptions,
} from '@/features/tests/utils/questionFormatter';
import type { Question } from '@/types/quiz';
import { YearBadge } from '@/app/syllabus/quiz/pyq/intelligence/components/shared/UnitBadge';
import { getUnitColor } from '@/app/syllabus/quiz/pyq/intelligence/components/shared/constants';
import type { OpenPaperViewQuestion } from '@/lib/map-quiz-to-open-paper-view';
import { normalizeCorrectAnswer } from '@/lib/quiz-scoring';

export type { OpenPaperViewQuestion };

const CARD_THEMES = [
  {
    border: 'border-blue-200/60 hover:border-blue-300',
    accent: '#3b82f6',
    ring: 'ring-blue-500/25',
    numberBg: 'bg-blue-100/60 text-blue-600 border-blue-200',
    badge: 'border-blue-500/20 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20',
    bg: 'bg-blue-50/60',
    bgActive: 'bg-blue-50/90',
  },
  {
    border: 'border-pink-200/60 hover:border-pink-300',
    accent: '#ec4899',
    ring: 'ring-pink-500/25',
    numberBg: 'bg-pink-100/60 text-pink-600 border-pink-200',
    badge: 'border-pink-500/20 bg-pink-500/10 text-pink-600 hover:bg-pink-500/20',
    bg: 'bg-pink-50/60',
    bgActive: 'bg-pink-50/90',
  },
  {
    border: 'border-emerald-200/60 hover:border-emerald-300',
    accent: '#10b981',
    ring: 'ring-emerald-500/25',
    numberBg: 'bg-emerald-100/60 text-emerald-600 border-emerald-200',
    badge: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20',
    bg: 'bg-emerald-50/60',
    bgActive: 'bg-emerald-50/90',
  },
  {
    border: 'border-amber-200/60 hover:border-amber-300',
    accent: '#f59e0b',
    ring: 'ring-amber-500/25',
    numberBg: 'bg-amber-100/60 text-amber-600 border-amber-200',
    badge: 'border-amber-500/20 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20',
    bg: 'bg-amber-50/60',
    bgActive: 'bg-amber-50/90',
  },
];

function openRowToQuestion(q: OpenPaperViewQuestion): Question {
  const opts = parseQuestionOptions(q.options);
  return {
    id: q.id,
    question: q.text,
    questionEn: q.textEn ?? null,
    options: opts as Question['options'],
    correctAnswer: normalizeCorrectAnswer(q.correctAnswer),
    marks: 2,
    negativeMarks: 0,
    type: q.type === 'matching' ? 'matching' : 'standard',
    matchPairs: (q.matchPairs as Question['matchPairs']) ?? undefined,
  };
}

export function OpenPyq2026PaperView({
  questions,
  pageTitle,
  formalTitleHi,
  formalTitleEn,
  unitId = 'unmapped',
  backHref = '/',
  guestMobile,
}: {
  questions: OpenPaperViewQuestion[];
  pageTitle: string;
  /** Optional long exam line — shown in header when set (bilingual). */
  formalTitleHi?: string;
  formalTitleEn?: string;
  /** Used for header accent; defaults to unmapped. */
  unitId?: string;
  backHref?: string;
  guestMobile?: string;
}) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAnswersOnCollapsed, setShowAnswersOnCollapsed] = useState(false);
  const [filterYear, setFilterYear] = useState<number | null>(null);

  const searchParams = useSearchParams();
  const isPdfMode = searchParams.get('pdf_mode') === 'true';

  const uniqueYears = useMemo(() => {
    return Array.from(
      new Set(questions.map((q) => q.year).filter((y): y is number => y !== undefined))
    ).sort((a, b) => b - a);
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    if (!filterYear) return questions;
    return questions.filter((q) => q.year === filterYear);
  }, [questions, filterYear]);

  useEffect(() => {
    if (isPdfMode && filteredQuestions.length > 0) {
      const t = setTimeout(() => {
        setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
      }, 0);
      return () => clearTimeout(t);
    }
  }, [isPdfMode, filteredQuestions]);

  const toggleQuestion = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const colorClass = getUnitColor(unitId);
  const headerTitle =
    formalTitleHi && formalTitleEn
      ? isHindi
        ? formalTitleHi
        : formalTitleEn
      : pageTitle;

  return (
    <div
      className="min-h-screen bg-[#FAFBFD] pb-24 text-slate-900 selection:bg-violet-500/30"
      data-open-pyq-paper="true"
    >
      {/* Light Multi-Gradient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-50/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] h-[50%] w-[50%] rounded-full bg-rose-50/60 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[50%] w-[50%] rounded-full bg-amber-50/40 blur-[120px]" />
      </div>

      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => router.push(backHref)}
              className="group rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95"
              aria-label="Back to home"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-lg">
                {headerTitle}
              </h1>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-1.5 w-1.5 animate-pulse rounded-full',
                    colorClass.replace('bg-', 'bg-').replace('indigo', 'violet')
                  )}
                />
                <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                  {filteredQuestions.length} {isHindi ? 'प्रश्न' : 'Solved Questions'}
                </p>
              </div>
            </div>
            <ConnectSocials minimal className="shrink-0 scale-90 sm:scale-100" />
          </div>
        </div>
      </div>

      <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-3">
              {uniqueYears.length > 1 && (
                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                  <div className="flex h-9 items-center rounded-2xl bg-slate-100 p-1">
                    <button
                      type="button"
                      onClick={() => setFilterYear(null)}
                      className={cn(
                        'h-full rounded-xl px-4 text-[10px] font-black tracking-widest transition-all active:scale-95',
                        filterYear === null
                          ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                          : 'text-slate-500 hover:text-slate-900'
                      )}
                    >
                      ALL YEARS
                    </button>
                    {uniqueYears.map((y) => (
                      <button
                        type="button"
                        key={y}
                        onClick={() => setFilterYear(y)}
                        className={cn(
                          'h-full rounded-xl px-4 text-[10px] font-black tracking-widest transition-all active:scale-95',
                          filterYear === y
                            ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                            : 'text-slate-500 hover:text-slate-900'
                        )}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswersOnCollapsed(!showAnswersOnCollapsed)}
              className={cn(
                "h-9 gap-2 rounded-xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-55 transition-all active:scale-95 sm:ml-auto",
                showAnswersOnCollapsed && "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70"
              )}
            >
              <CheckCircle className={cn("h-4 w-4 transition-colors", showAnswersOnCollapsed ? "text-emerald-600" : "text-slate-400")} />
              <span>
                {isHindi 
                  ? (showAnswersOnCollapsed ? 'उत्तर छिपाएं' : 'उत्तर दिखाएं') 
                  : (showAnswersOnCollapsed ? 'Hide Answers' : 'Show Answers')}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div
        className="relative mx-auto max-w-4xl space-y-4 px-1.5 py-6 sm:px-6"
        data-testid="open-pyq-questions-container"
      >
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedIds.has(q.id);
          const stemQ = openRowToQuestion(q);
          const rawStem =
            (isHindi ? q.text : (q.textEn && String(q.textEn).trim() !== '' ? q.textEn : q.text)) ??
            '';
          const stemFormatted = cleanMatchingQuestionText(String(rawStem), stemQ);
          const previewPlain = normalizeMultilineText(stemFormatted)
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          const parsedOpts = parseQuestionOptions(q.options);
          const hasMatch = Array.isArray(q.matchPairs) && q.matchPairs.length > 0;

          const correctAnswerIndex = normalizeCorrectAnswer(q.correctAnswer);
          const correctOpt = parsedOpts[correctAnswerIndex];
          const parsedCorrectOpt: {
            text?: unknown;
            text_en?: unknown;
            textEn?: unknown;
          } = typeof correctOpt === 'object' && correctOpt !== null
            ? (correctOpt as Record<string, unknown>)
            : { text: correctOpt };
          const correctOptText = isHindi
            ? (parsedCorrectOpt.text ?? correctOpt)
            : (parsedCorrectOpt.text_en ?? parsedCorrectOpt.textEn ?? parsedCorrectOpt.text ?? correctOpt);
          const correctDisplay = normalizeMultilineText(
            typeof correctOptText === 'string' ? correctOptText : String(correctOptText ?? '')
          );

          const cardTheme = CARD_THEMES[idx % CARD_THEMES.length];

          return (
            <div
              key={q.id}
              className="group relative transition-all duration-300"
              data-question-item
              data-question-id={q.id}
            >
              <div
                className={cn(
                  'absolute -inset-px rounded-[1.25rem] sm:rounded-[2rem] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100',
                  isExpanded ? 'opacity-40' : ''
                )}
                style={{
                  background: `linear-gradient(to right, ${cardTheme.accent}, transparent)`,
                }}
              />

              <Card
                className={cn(
                  'relative z-10 overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border shadow-[0_4px_20px_rgba(0,0,0,0.015)] transition-all duration-300',
                  cardTheme.border,
                  isExpanded ? `${cardTheme.bgActive} ring-2 ${cardTheme.ring} shadow-[0_8px_30px_rgba(0,0,0,0.03)]` : `${cardTheme.bg} hover:shadow-[0_8px_25px_rgba(0,0,0,0.03)]`
                )}
              >
                <div
                  className="flex cursor-pointer flex-col pl-4 pr-3 py-4 sm:pl-7 sm:pr-7 sm:py-6 select-none gap-2.5"
                  onClick={() => toggleQuestion(q.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider", cardTheme.numberBg)}>
                      Q{idx + 1}
                    </span>
                    <div
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full bg-white/50 text-slate-400 transition-all border border-slate-200',
                        isExpanded
                          ? 'rotate-180 text-white shadow-sm'
                          : 'group-hover:text-slate-700'
                      )}
                      style={{
                        backgroundColor: isExpanded ? cardTheme.accent : undefined,
                        borderColor: isExpanded ? cardTheme.accent : undefined,
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    {isExpanded ? (
                      <FormattedQuestionText
                        text={stemFormatted}
                        className="text-[16px] leading-[1.7] font-bold tracking-tight text-slate-900 sm:text-[18px]"
                      />
                    ) : (
                      <p className="text-[16px] leading-[1.7] font-bold tracking-tight text-slate-800 line-clamp-2 sm:text-[18px]">
                        {previewPlain || '\u00a0'}
                      </p>
                    )}
                  </div>

                  {!isExpanded && showAnswersOnCollapsed && q.type !== 'matching' && correctDisplay && (
                    <div className="flex items-center gap-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {isHindi ? 'सही उत्तर' : 'Correct Answer'}:
                      </span>
                      <span className="text-[14px] font-bold text-slate-700 truncate max-w-[85%]">
                        {correctDisplay}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <YearBadge
                      year={q.year ?? 2020}
                      variant="amber"
                      className="border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase rounded-md"
                    />
                    {q.subject && (
                      <Badge className="border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold tracking-widest text-emerald-700 hover:bg-emerald-50 uppercase rounded-md">
                        {q.subject}
                      </Badge>
                    )}
                    {q.qNo && (
                      <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                        SET-Q{q.qNo}
                      </span>
                    )}
                  </div>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-6 border-t border-dashed border-slate-200 bg-slate-50/30 pl-4 pr-3 py-5 sm:pl-7 sm:pr-7 sm:py-7">
                        {q.type === 'matching' && hasMatch && (
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <RenderTableQuestion
                              matchPairs={q.matchPairs}
                              language={isHindi ? 'hi' : 'en'}
                              darkMode={false}
                            />
                          </div>
                        )}

                        {parsedOpts.length > 0 && (
                          <div className="grid gap-3 sm:grid-cols-2">
                            {parsedOpts.slice(0, 4).map((opt, optIdx) => {
                              const parsedOpt: {
                                text?: unknown;
                                text_en?: unknown;
                                textEn?: unknown;
                              } =
                                typeof opt === 'object' && opt !== null
                                  ? (opt as Record<string, unknown>)
                                  : { text: opt };
                              const isCorrect = correctAnswerIndex === optIdx;
                              const optText = isHindi
                                ? (parsedOpt.text ?? opt)
                                : (parsedOpt.text_en ?? parsedOpt.textEn ?? parsedOpt.text ?? opt);
                              const optDisplay = normalizeMultilineText(
                                typeof optText === 'string' ? optText : String(optText ?? ''),
                              );

                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    'group/opt relative flex items-center gap-3.5 rounded-2xl border p-4 transition-all duration-200',
                                    isCorrect
                                      ? 'border-emerald-200 bg-emerald-50/70 shadow-[0_4px_12px_rgba(16,185,129,0.04)]'
                                      : 'border-slate-100 bg-white hover:bg-slate-50 hover:border-slate-200 hover:-translate-y-0.5'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-all border',
                                      isCorrect
                                        ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-50 border-slate-200 text-slate-500 group-hover/opt:bg-slate-100'
                                    )}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <div
                                    className={cn(
                                      'flex-1 whitespace-pre-line text-sm leading-relaxed font-semibold transition-colors',
                                      isCorrect ? 'text-emerald-900 font-semibold' : 'text-slate-600'
                                    )}
                                  >
                                    {optDisplay}
                                  </div>
                                  {isCorrect && (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                      <Check className="h-3 w-3 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="space-y-4 pt-2">
                          {(q.explanation || q.explanationEn || !!q.extendedData) && (
                            <StructuredExplanation
                              extendedData={q.extendedData}
                              plainExplanation={
                                isHindi
                                  ? q.explanation || ''
                                  : q.explanationEn || q.explanation || ''
                              }
                              explanationEn={q.explanationEn}
                              explanationHi={q.explanation_hi || q.explanation}
                              language={isHindi ? 'hi' : 'en'}
                              darkMode={false}
                              questionId={q.id}
                              questionText={rawStem}
                              guestMobile={guestMobile}
                              source="open_paper_view"
                            />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white/50 p-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <Filter className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-800">
              {isHindi ? 'कोई प्रश्न नहीं मिला' : 'No matches found'}
            </h3>
            <p className="mx-auto mt-2 max-w-[250px] text-sm text-slate-500">
              {isHindi
                ? 'सॉरी, इस साल या इस फ़िल्टर के लिए कोई डेटा नहीं है।'
                : 'Try selecting a different year or broader filters to find what you are looking for.'}
            </p>
          </div>
        )}

        {/* --- ZEN COMPLETION CARD --- */}
        {filteredQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative mt-20"
          >
            <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-violet-500 via-amber-500 to-emerald-500 opacity-20 blur-xl transition-all duration-500 group-hover:opacity-30" />
            
            <Card className="relative z-10 overflow-hidden rounded-[2.5rem] border-slate-200 bg-white p-8 text-center shadow-lg sm:p-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 shadow-inner ring-1 ring-slate-200">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    ease: "easeInOut" 
                  }}
                >
                  <Trophy className="h-10 w-10 text-amber-500" />
                </motion.div>
              </div>

              <h2 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                {isHindi ? 'शानदार! आपने पूरा पेपर देख लिया' : 'Congratulations! You read them all'}
              </h2>
              
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600 sm:text-lg">
                {isHindi 
                  ? 'हमें उम्मीद है कि ये premium explanations आपकी तैयारी में मदद करेंगी।' 
                  : 'We hope these premium explanations help you master the MPPSC syllabus.'}
              </p>

              <ZenFeedbackForm guestMobile={guestMobile} isHindi={isHindi} />

              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                  className="h-12 rounded-2xl border-slate-200 bg-slate-50 px-8 font-bold text-slate-700 hover:bg-slate-100"
                >
                  {isHindi ? 'होम पर जाएं' : 'Back to Home'}
                </Button>
                <Button
                  onClick={() => window.open('https://t.me/MPPSC2026_Mission', '_blank')}
                  className="h-12 rounded-2xl bg-sky-600 px-8 font-bold text-white hover:bg-sky-700 shadow-[0_0_20px_rgba(2,132,199,0.3)]"
                >
                  {isHindi ? 'टेलीग्राम जॉइन करें' : 'Join Telegram'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ZenFeedbackForm({ guestMobile, isHindi }: { guestMobile?: string; isHindi: boolean }) {
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const availableTags = isHindi 
    ? ['Concept Clear', 'Bilingual Help', 'Time Saver', 'Premium UI'] 
    : ['Concept Clear', 'Bilingual Help', 'Time Saver', 'Premium UI'];

  const toggleTag = (tag: string) => {
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
  };

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);
    try {
      await submitZenFeedback({
        guestMobile,
        rating,
        tags,
        comment
      });
      setIsDone(true);
      toast.success(isHindi ? 'फीडबैक के लिए धन्यवाद!' : 'Thank you for your feedback!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingInfo = (r: number) => {
    switch (r) {
      case 1: return { emoji: '😞', color: 'bg-rose-400', label: 'Needs Work' };
      case 2: return { emoji: '😐', color: 'bg-amber-400', label: 'Average' };
      case 3: return { emoji: '😊', color: 'bg-emerald-400', label: 'Good' };
      case 4: return { emoji: '🌟', color: 'bg-blue-400', label: 'Excellent' };
      case 5: return { emoji: '🔥', color: 'bg-orange-400', label: 'Amazing!' };
      default: return { emoji: '✨', color: 'bg-slate-400', label: '' };
    }
  };

  if (isDone) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 rounded-3xl bg-emerald-50 p-6 border border-emerald-200"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check className="h-6 w-6" />
          </div>
          <p className="font-bold text-emerald-800">
            {isHindi ? 'आपका फीडबैक मिल गया! धन्यवाद' : 'Feedback received! Thank you'}
          </p>
        </div>
      </motion.div>
    );
  }

  const ratingInfo = getRatingInfo(rating);

  return (
    <div className="relative mt-10 flex flex-col gap-8">
      {/* Floating Indicator with Emojis - Responsive */}
      <AnimatePresence>
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute -top-16 -right-2 z-20 sm:-top-20 sm:-right-6"
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-4 rounded-[2rem] bg-white px-6 py-3 shadow-2xl ring-1 ring-slate-200 text-slate-900">
                <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_15px_rgba(0,0,0,0.1)]">
                  {ratingInfo.emoji}
                </span>
                <div className="flex flex-col text-left">
                  <span className={cn("text-xs font-black uppercase leading-none tracking-wider", ratingInfo.color.replace('bg-', 'text-'))}>
                    {rating} Stars
                  </span>
                  <span className="mt-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {ratingInfo.label}
                  </span>
                </div>
              </div>
              {/* Animated Underline */}
              <motion.div 
                animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className={cn("mt-2 h-1.5 w-12 rounded-full blur-[3px] shadow-[0_0_10px_rgba(0,0,0,0.1)]", ratingInfo.color)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
          {isHindi ? 'रेटिंग दें' : 'Rate your experience'}
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              className={cn(
                "group relative flex h-12 w-12 items-center justify-center rounded-2xl transition-all active:scale-90",
                rating >= star ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              )}
            >
              <Star className={cn("h-6 w-6", rating >= star ? "fill-black" : "group-hover:text-amber-500")} />
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {rating > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-6 overflow-hidden"
          >
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                {isHindi ? 'क्या अच्छा लगा?' : 'What did you like?'}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      tags.includes(tag) 
                        ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" 
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase text-left sm:text-center">
                {isHindi ? 'कोई सुझाव? (Optional)' : 'Any comments? (Optional)'}
              </p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={isHindi ? 'यहाँ लिखें...' : 'Type here...'}
                className="w-full min-h-[100px] rounded-2xl bg-white border border-slate-200 p-4 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <Button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="h-12 w-full rounded-2xl bg-amber-500 text-[11px] font-black uppercase tracking-widest text-black hover:bg-amber-400 shadow-xl shadow-amber-500/20"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isHindi ? 'फीडबैक भेजें' : 'Send Feedback'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
