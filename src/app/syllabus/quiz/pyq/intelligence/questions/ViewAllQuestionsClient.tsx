'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Filter, Eye, EyeOff, Check, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import {
  FormattedQuestionText,
  RenderTableQuestion,
  cleanMatchingQuestionText,
  normalizeMultilineText,
  parseQuestionOptions,
} from '@/features/tests/utils/questionFormatter';
import type { Question } from '@/types/quiz';
import { YearBadge } from '../components/shared/UnitBadge';
import { formatUnitTitle, getUnitColor } from '../components/shared/constants';
import { normalizeCorrectAnswer } from '@/lib/quiz-scoring';

interface QuestionData {
  id: string;
  text: string;
  textEn?: string | null;
  year?: number;
  qNo?: number;
  type?: string;
  options?: unknown[];
  matchPairs?: unknown[];
  correctAnswer?: number;
  explanation?: string | null;
  explanationEn?: string | null;
  explanation_hi?: string | null;
  extendedData?: string | Record<string, unknown> | null;
  subject?: string | null;
}

interface ViewAllQuestionsClientProps {
  unitId: string;
  unitTitle: string;
  questions: QuestionData[];
  source: 'paper' | 'overall' | 'topic' | 'subject';
  topicTitle?: string;
  year?: number;
  subject?: string;
}

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

/** Same shape as open 2026 paper view for `cleanMatchingQuestionText` / `FormattedQuestionText`. */
function questionDataToQuestion(q: QuestionData): Question {
  const opts = parseQuestionOptions(q.options);
  return {
    id: q.id,
    question: q.text,
    questionEn: q.textEn ?? null,
    options: opts as Question['options'],
    correctAnswer:
      typeof q.correctAnswer === 'number' && !Number.isNaN(q.correctAnswer) ? q.correctAnswer : 0,
    marks: 2,
    negativeMarks: 0,
    type: q.type === 'matching' ? 'matching' : 'standard',
    matchPairs: (q.matchPairs as Question['matchPairs']) ?? undefined,
  };
}

export default function ViewAllQuestionsClient({
  unitId,
  unitTitle,
  questions,
  source,
  topicTitle,
  year,
  subject,
}: ViewAllQuestionsClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAnswersOnCollapsed, setShowAnswersOnCollapsed] = useState(false);
  const [filterYear, setFilterYear] = useState<number | null>(null);

  // Check if we're in PDF mode (for Puppeteer)
  const searchParams = useSearchParams();
  const isPdfMode = searchParams.get('pdf_mode') === 'true';

  // Get unique years for filtering
  const uniqueYears = useMemo(() => {
    return Array.from(
      new Set(questions.map((q) => q.year).filter((y): y is number => y !== undefined))
    ).sort((a, b) => b - a);
  }, [questions]);

  // Filter questions by year
  const filteredQuestions = useMemo(() => {
    if (!filterYear) return questions;
    return questions.filter((q) => q.year === filterYear);
  }, [questions, filterYear]);

  // Auto-expand all questions in PDF mode
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
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const colorClass = getUnitColor(unitId);

  // Title based on source
  const pageTitle = useMemo(() => {
    if (source === 'topic' && topicTitle) {
      return topicTitle;
    }
    if (source === 'paper' && year) {
      return `MPPSC Prelims ${year} - ${formatUnitTitle(unitId)}`;
    }
    if (source === 'subject' && subject) {
      return `${subject} Questions (2020-2026)`;
    }
    return `${formatUnitTitle(unitId)} - ${unitTitle}`;
  }, [source, topicTitle, year, unitId, unitTitle, subject]);

  return (
    <div className="min-h-screen 2xl:min-h-[92vh] w-full mx-auto 2xl:max-w-[1600px] 2xl:my-6 2xl:rounded-[2.5rem] 2xl:border 2xl:border-slate-200/60 2xl:shadow-2xl overflow-hidden bg-[#FAFBFD] pb-24 text-slate-900 selection:bg-violet-500/30 transition-all duration-500">
      {/* Light Multi-Gradient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-50/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] h-[50%] w-[50%] rounded-full bg-rose-50/60 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[50%] w-[50%] rounded-full bg-amber-50/40 blur-[120px]" />
      </div>

      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-2xl">
        <div className="mx-auto max-w-4xl 2xl:max-w-5xl px-4 sm:px-6 transition-all duration-500">
          <div className="flex h-16 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="group rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-black tracking-tight text-slate-900 sm:text-lg">
                {pageTitle}
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
            <div
              className={cn(
                'h-10 w-1 rounded-full bg-gradient-to-b to-transparent opacity-50',
                colorClass.replace('bg-', 'from-').replace('indigo', 'violet')
              )}
            />
          </div>
        </div>
      </div>

      {/* Modernized Controls */}
      <div className="sticky top-16 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl 2xl:max-w-5xl px-4 py-4 sm:px-6 transition-all duration-500">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Group - Horizontal Pills */}
            <div className="flex flex-col gap-3">
              {/* Year Filter Pills */}
              {uniqueYears.length > 1 && (
                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                  <div className="flex h-9 items-center rounded-2xl bg-slate-100 p-1">
                    <button
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

            {/* Answer Visibility Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnswersOnCollapsed(!showAnswersOnCollapsed)}
              className={cn(
                "h-9 gap-2 rounded-xl border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 sm:ml-auto",
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

      {/* Questions List - Premium Cards */}
      <div
        className="relative mx-auto max-w-4xl 2xl:max-w-5xl space-y-4 px-1.5 py-6 sm:px-6 transition-all duration-500"
        data-testid="questions-container"
      >
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedIds.has(q.id);
          const stemQ = questionDataToQuestion(q);
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

                {/* Expanded Content Area */}
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

                        {/* Premium Insights Section */}
                        <div className="space-y-4 pt-2">
                          {(q.explanation || q.explanationEn || !!q.extendedData) && (
                            <StructuredExplanation
                              extendedData={q.extendedData}
                              plainExplanation={
                                isHindi
                                  ? (q.explanation_hi ?? q.explanation) || ''
                                  : q.explanationEn || q.explanation || ''
                              }
                              explanationEn={q.explanationEn}
                              explanationHi={q.explanation_hi || q.explanation}
                              language={isHindi ? 'hi' : 'en'}
                              darkMode={false}
                              questionId={q.id}
                              questionText={rawStem}
                              source="expert_analysis"
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

        {/* Empty State */}
        {filteredQuestions.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 bg-white p-20 text-center shadow-sm">
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
      </div>
    </div>
  );
}
