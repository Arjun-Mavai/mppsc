'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ChevronDown, Filter, Eye, EyeOff } from 'lucide-react';
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

export interface QuestionData {
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
  const [showAllExpanded, setShowAllExpanded] = useState(false);
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

  // Pre-process questions to avoid heavy logic in render loop
  const processedQuestions = useMemo(() => {
    return questions.map((q) => {
      const stemQ = questionDataToQuestion(q);
      const rawStem =
        (isHindi ? q.text : (q.textEn && String(q.textEn).trim() !== '' ? q.textEn : q.text)) ??
        '';
      const cleanedStem = cleanMatchingQuestionText(String(rawStem), stemQ);
      const stemFormatted =
        cleanedStem.trim().length > 0 ? cleanedStem : normalizeMultilineText(String(rawStem));
      
      const previewPlain = normalizeMultilineText(stemFormatted)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
        
      const previewShort =
        previewPlain.length === 0
          ? isHindi
            ? 'प्रश्न टेक्स्ट उपलब्ध नहीं'
            : 'Question text unavailable'
          : previewPlain;
            
      const parsedOptsRaw = parseQuestionOptions(q.options);
      const hasMatch = Array.isArray(q.matchPairs) && q.matchPairs.length > 0;
      const correctAnswerIdx = normalizeCorrectAnswer(q.correctAnswer);

      const processedOpts = parsedOptsRaw.slice(0, 4).map((opt, optIdx) => {
        const parsedOpt: {
          text?: unknown;
          text_en?: unknown;
          textEn?: unknown;
        } =
          typeof opt === 'object' && opt !== null
            ? (opt as Record<string, unknown>)
            : { text: opt };
        const optText = isHindi
          ? (parsedOpt.text ?? opt)
          : (parsedOpt.text_en ?? parsedOpt.textEn ?? parsedOpt.text ?? opt);
        const optDisplay = normalizeMultilineText(
          typeof optText === 'string' ? optText : String(optText ?? ''),
        );
        return {
          idx: optIdx,
          display: optDisplay,
          isCorrect: correctAnswerIdx === optIdx,
        };
      });

      return {
        ...q,
        stemQ,
        stemFormatted,
        previewShort,
        processedOpts,
        hasMatch,
        rawStem,
      };
    });
  }, [questions, isHindi]);

  // Filter questions by year
  const filteredQuestions = useMemo(() => {
    if (!filterYear) return processedQuestions;
    return processedQuestions.filter((q) => q.year === filterYear);
  }, [processedQuestions, filterYear]);

  // Auto-expand all questions in PDF mode
  useEffect(() => {
    if (isPdfMode && filteredQuestions.length > 0) {
      const t = setTimeout(() => {
        setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
        setShowAllExpanded(true);
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

  const toggleAll = useCallback(() => {
    if (showAllExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filteredQuestions.map((q) => q.id)));
    }
    setShowAllExpanded(!showAllExpanded);
  }, [showAllExpanded, filteredQuestions]);

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
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-200 selection:bg-violet-500/30">
      {/* Dynamic Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] animate-pulse rounded-full bg-violet-600/10 blur-[120px]" />
        <div
          className="absolute right-[-10%] bottom-[-10%] h-[600px] w-[600px] animate-pulse rounded-full bg-amber-600/5 blur-[120px]"
          style={{ animationDelay: '2s' }}
        />
        <div className="absolute top-[30%] left-[20%] h-[400px] w-[400px] rounded-full bg-purple-600/5 blur-[100px]" />
      </div>

      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-50 border-b border-white/[0.03] bg-slate-950/70 backdrop-blur-2xl">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-16 items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="group rounded-xl bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-white active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-black tracking-tight text-white sm:text-lg">
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
      <div className="sticky top-16 z-40 border-b border-white/[0.03] bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Filter Group - Horizontal Pills */}
            <div className="flex flex-col gap-3">
              {/* Year Filter Pills */}
              {uniqueYears.length > 1 && (
                <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
                  <div className="flex h-9 items-center rounded-2xl bg-white/5 p-1">
                    <button
                      onClick={() => setFilterYear(null)}
                      className={cn(
                        'h-full rounded-xl px-4 text-[10px] font-black tracking-widest transition-all active:scale-95',
                        filterYear === null
                          ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'text-slate-400 hover:text-white'
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
                            ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                            : 'text-slate-400 hover:text-white'
                        )}
                      >
                        {y}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Expand/Collapse All - Glass Action */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="h-9 gap-2 rounded-xl border-white/5 bg-white/5 px-4 text-xs font-bold text-white transition-all hover:bg-white/10 active:scale-95 sm:ml-auto"
            >
              <AnimatePresence mode="wait">
                {showAllExpanded ? (
                  <motion.div
                    key="collapse"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2"
                  >
                    <EyeOff className="h-4 w-4 text-amber-500" />
                    {isHindi ? 'सब बंद करें' : 'Collapse All'}
                  </motion.div>
                ) : (
                  <motion.div
                    key="expand"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4 text-amber-500" />
                    {isHindi ? 'सब खोलें' : 'Expand All'}
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      {/* Questions List - Premium Cards */}
      <div
        className="relative mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6"
        data-testid="questions-container"
      >
        {filteredQuestions.map((q, idx) => {
          const isExpanded = expandedIds.has(q.id);
          const {
            stemFormatted,
            previewShort,
            processedOpts,
            hasMatch,
            rawStem,
          } = q;

          return (
            <div
              key={q.id}
              className="group relative transition-all duration-300"
              data-question-item
              data-question-id={q.id}
            >
              {/* Card Accent Glow */}
              <div
                className={cn(
                  'absolute -inset-px rounded-[2rem] opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100',
                  isExpanded ? 'opacity-40' : ''
                )}
                style={{
                  background: `linear-gradient(to right, ${isExpanded ? '#8b5cf6' : '#1e293b'}, transparent)`,
                }}
              />

              <Card
                className={cn(
                  'relative z-10 overflow-hidden rounded-[2rem] border-white/[0.03] bg-slate-900/40 shadow-2xl backdrop-blur-sm transition-all duration-300',
                  isExpanded ? 'bg-slate-900/80 ring-1 ring-violet-500/20' : 'hover:bg-slate-900/60'
                )}
              >
                {/* Question Header Area */}
                <div
                  className="flex cursor-pointer items-start gap-5 p-5 sm:p-7"
                  onClick={() => toggleQuestion(q.id)}
                >
                  {/* Styled Numbering */}
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rotate-45 rounded-xl bg-amber-500/10 transition-colors group-hover:bg-amber-500/20" />
                    <span className="relative text-sm font-black text-amber-500">{idx + 1}</span>
                  </div>

                  <div className="min-w-0 flex-1 pt-1">
                    <p
                      className={cn(
                        'text-[15px] leading-[1.6] font-bold tracking-tight text-slate-200 sm:text-[17px]',
                        !isExpanded && 'line-clamp-none'
                      )}
                    >
                      {previewShort || '\u00a0'}
                    </p>

                    <div className="mt-3 flex items-center gap-3">
                      <YearBadge
                        year={q.year ?? 2020}
                        variant="amber"
                        className="border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[10px] font-black text-amber-500 uppercase"
                      />
                      {q.subject && (
                        <Badge className="border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                          {q.subject}
                        </Badge>
                      )}
                      {q.qNo && (
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                          SET-Q{q.qNo}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-1 flex shrink-0 items-center">
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-500 transition-all',
                        isExpanded
                          ? 'rotate-180 bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                          : 'group-hover:text-slate-300'
                      )}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Expanded Content Area */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-6 border-t border-white/[0.05] bg-slate-950/40 p-5 sm:p-7">
                        <div className="rounded-2xl border border-white/10 bg-slate-50 p-4 sm:p-5 text-slate-900 shadow-inner">
                          {stemFormatted.trim() ? (
                            <FormattedQuestionText
                              text={stemFormatted}
                              className="!text-slate-900 text-[15px] font-semibold leading-relaxed sm:text-[17px]"
                            />
                          ) : (
                            <p className="text-[15px] font-semibold text-slate-700 sm:text-[17px]">
                              {isHindi ? 'प्रश्न टेक्स्ट उपलब्ध नहीं' : 'Question text unavailable'}
                            </p>
                          )}
                        </div>

                        {q.type === 'matching' && hasMatch && (
                          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-4">
                            <RenderTableQuestion
                              matchPairs={q.matchPairs}
                              language={isHindi ? 'hi' : 'en'}
                              darkMode={true}
                            />
                          </div>
                        )}

                        {processedOpts.length > 0 && (
                          <div className="grid gap-4 sm:grid-cols-2">
                            {processedOpts.map((opt) => {
                              const isCorrect = opt.isCorrect;
                              const optDisplay = opt.display;
                              const optIdx = opt.idx;

                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    'group/opt relative flex items-center gap-4 rounded-2xl border p-4 transition-all duration-300',
                                    isCorrect
                                      ? 'border-emerald-500/30 bg-emerald-500/[0.08] shadow-[0_0_20px_rgba(16,185,129,0.05)]'
                                      : 'border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05]'
                                  )}
                                >
                                  <div
                                    className={cn(
                                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-all',
                                      isCorrect
                                        ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                                        : 'bg-white/5 text-slate-500 group-hover/opt:bg-white/10 group-hover/opt:text-slate-300'
                                    )}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </div>
                                  <div
                                    className={cn(
                                      'flex-1 whitespace-pre-line text-sm leading-relaxed font-medium',
                                      isCorrect ? 'text-emerald-100' : 'text-slate-300'
                                    )}
                                  >
                                    {optDisplay}
                                  </div>
                                  {isCorrect && (
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                                      <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Premium Insights Section */}
                        <div className="space-y-4 pt-4">
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
                              darkMode={true}
                              questionId={q.id}
                              questionText={rawStem}
                              source="expert_analysis"
                            />
                          )}

                          {/* <div className="flex items-center justify-between border-t border-white/5 pt-4">
                             <YearBadge year={q.year ?? 2020} variant="amber" className="px-3 bg-amber-500/10 text-amber-500 border-amber-500/20" />
                             <Link
                                href={`/syllabus/quiz/pyq/question/${q.id}`}
                                className="group inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-amber-500 transition-colors hover:text-amber-400"
                              >
                                Detailed Analysis
                                <ArrowLeft className="h-3 w-3 rotate-180 transition-transform group-hover:translate-x-1" />
                              </Link>
                          </div> */}
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
          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-white/10 bg-white/[0.02] p-20 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5">
              <Filter className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-black text-white">
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
