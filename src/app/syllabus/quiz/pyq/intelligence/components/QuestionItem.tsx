'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Repeat } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { YearBadge } from './shared/UnitBadge';

export interface QuestionData {
  id: string;
  text: string;
  textEn?: string | null;
  year: number;
  qNo?: number;
  subject?: string;
  testTitle?: string;
  /** Can be string[], DB JSON objects, or a JSON string */
  options?: unknown;
  optionsEn?: string[];
  correctAnswer?: number | string;
  explanation?: string | null;
  explanationEn?: string | null;
}

interface QuestionItemProps {
  question: QuestionData;
  index: number;
  isHindi: boolean;
  repeatCount?: number;
  showYear?: boolean;
  variant?: 'compact' | 'full' | 'card';
  defaultExpanded?: boolean;
  theme?: 'light' | 'dark';
  /** Hide link to in-app full question (e.g. public open page). */
  hideFullQuestionLink?: boolean;
  showAnswer?: boolean;
}

export function QuestionItem({
  question,
  index,
  isHindi,
  repeatCount = 0,
  showYear = true,
  variant = 'compact',
  theme = 'dark',
  showAnswer = false,
}: QuestionItemProps) {
  // Local toggle state for tapping individual question cards
  const [prevShowAnswer, setPrevShowAnswer] = useState(showAnswer);
  const [isAnswerToggled, setIsAnswerToggled] = useState<boolean | null>(null);

  // When parent showAnswer changes (unit level toggle "उत्तर दिखाएं / छिपाएं"), sync during render
  if (prevShowAnswer !== showAnswer) {
    setPrevShowAnswer(showAnswer);
    setIsAnswerToggled(null);
  }

  const isAnswerVisible = isAnswerToggled !== null ? isAnswerToggled : Boolean(showAnswer);
  const displayText = isHindi ? question.text : question.textEn || question.text;
  const altText = isHindi ? question.textEn : question.text;

  // Helper to normalize options and correct answer
  const normalizedOptions = useMemo(() => {
    if (!question.options) return [];

    type OptionObj = { id?: unknown; text?: unknown; text_en?: unknown; textEn?: unknown };

    let rawList: unknown[] = [];
    if (Array.isArray(question.options)) {
      rawList = question.options;
    } else if (typeof question.options === 'string') {
      try {
        let parsed = JSON.parse(question.options);
        if (typeof parsed === 'string') {
          try { parsed = JSON.parse(parsed); } catch { /* ignore */ }
        }
        if (Array.isArray(parsed)) {
          rawList = parsed;
        }
      } catch (e) {
        console.error('Error parsing question options:', e);
      }
    }

    if (!rawList || rawList.length === 0) return [];

    return rawList.map((opt, i) => {
      if (typeof opt === 'string') {
        return {
          id: String.fromCharCode(65 + i),
          text: opt,
          textEn: question.optionsEn?.[i] || opt,
        };
      }
      const o = (opt ?? {}) as OptionObj;
      return {
        id: String(o.id ?? String.fromCharCode(65 + i)),
        text: String(o.text ?? ''),
        textEn: String(o.text_en ?? o.textEn ?? o.text ?? ''),
      };
    });
  }, [question.options, question.optionsEn]);

  const correctIdx = useMemo(() => {
    if (question.correctAnswer === undefined || question.correctAnswer === null) return -1;

    // 1. Direct number
    if (typeof question.correctAnswer === 'number') {
      return Math.floor(question.correctAnswer);
    }

    const rawAns = String(question.correctAnswer).trim();
    if (!rawAns) return -1;

    // 2. Numeric / Float strings like "1.0", "0.0", "2", "3"
    const num = Number(rawAns);
    if (!isNaN(num) && rawAns !== '') {
      const idx = Math.floor(num);
      if (idx >= 0 && (normalizedOptions.length === 0 || idx < normalizedOptions.length)) {
        return idx;
      }
    }

    // 3. Single letter 'A', 'B', 'C', 'D' (or 'a', 'b', 'c', 'd')
    const upper = rawAns.toUpperCase();
    if (upper.length === 1) {
      const code = upper.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return code - 65;
      }
    }

    // 4. Try matching option ID in normalizedOptions
    const byId = normalizedOptions.findIndex(
      (opt) => opt.id.toLowerCase() === rawAns.toLowerCase()
    );
    if (byId !== -1) return byId;

    // 5. Try matching option text in normalizedOptions
    const byText = normalizedOptions.findIndex(
      (opt) =>
        opt.text.trim().toLowerCase() === rawAns.toLowerCase() ||
        opt.textEn.trim().toLowerCase() === rawAns.toLowerCase()
    );
    if (byText !== -1) return byText;

    return -1;
  }, [question.correctAnswer, normalizedOptions]);

  // Sahi Uttar (Hindi + English formatted cleanly like in screenshot)
  const correctDisplay = useMemo(() => {
    // 1. If we found the correct option in normalizedOptions
    if (correctIdx >= 0 && correctIdx < normalizedOptions.length) {
      const opt = normalizedOptions[correctIdx];
      const hi = opt.text?.trim() || '';
      const en = opt.textEn?.trim() || '';
      if (hi && en && hi.toLowerCase() !== en.toLowerCase()) {
        return `${hi} (${en})`;
      }
      return isHindi ? (hi || en) : (en || hi);
    }

    // 2. Fallback: If options not found or empty, never show raw "1.0" or "0.0"
    if (question.correctAnswer !== undefined && question.correctAnswer !== null) {
      const rawAns = String(question.correctAnswer).trim();
      const num = Number(rawAns);

      // If it's a numeric float/int like "1.0", convert to human option name
      if (!isNaN(num) && rawAns !== '') {
        const letter = String.fromCharCode(65 + Math.floor(num));
        return isHindi ? `विकल्प ${letter}` : `Option ${letter}`;
      }

      // If it's single letter like "A"
      if (rawAns.length === 1 && /^[A-Za-z]$/.test(rawAns)) {
        return isHindi ? `विकल्प ${rawAns.toUpperCase()}` : `Option ${rawAns.toUpperCase()}`;
      }

      return rawAns;
    }

    return '';
  }, [normalizedOptions, correctIdx, question.correctAnswer, isHindi]);

  const handleCardClick = () => {
    setIsAnswerToggled((prev) => (prev !== null ? !prev : !showAnswer));
  };

  if (variant === 'card') {
    return (
      <div
        className={cn(
          'rounded-2xl border transition-all',
          theme === 'light' 
            ? 'border-[#E5E5EA] bg-white hover:bg-[#F5F5F7]' 
            : 'border-white/[0.03] bg-black/20 hover:bg-black/30',
          isAnswerVisible && (theme === 'light' ? 'bg-[#F2F8FF] ring-1 ring-blue-500/20' : 'bg-black/40 ring-1 ring-emerald-500/20')
        )}
      >
        <div
          className="flex cursor-pointer items-start gap-4 p-4 sm:p-5"
          onClick={handleCardClick}
        >
          {/* Question Number */}
          <div className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[10px] font-black",
            theme === 'light'
              ? "border-blue-500/20 bg-blue-50 text-blue-600"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500"
          )}>
            {index + 1}
          </div>

          {/* Question Content */}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'mb-2 text-sm leading-relaxed font-semibold transition-colors sm:text-[15px]',
                theme === 'light' ? 'text-[#1D1D1F]' : 'text-slate-200'
              )}
            >
              {displayText}
            </p>

            {/* Answer Display */}
            {isAnswerVisible && correctDisplay && (
              <div className="flex items-center gap-1.5 mb-2 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shrink-0",
                  theme === 'light'
                    ? "text-emerald-700 bg-emerald-50 border-emerald-200/60"
                    : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                )}>
                  {isHindi ? 'सही उत्तर' : 'Correct Answer'}:
                </span>
                <span className={cn(
                  "text-xs sm:text-sm font-semibold line-clamp-2",
                  theme === 'light' ? "text-slate-800" : "text-emerald-300"
                )}>
                  {correctDisplay}
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-black tracking-wider text-slate-500/90 uppercase">
              <span className="text-emerald-500/80">{question.year}</span>
              <span className="h-1 w-1 rounded-full bg-slate-800" />
              <span className="truncate">
                {question.testTitle || `Q${question.qNo || index + 1}`}
              </span>
              {question.subject && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-800" />
                  <span className="truncate text-emerald-400/80">{question.subject}</span>
                </>
              )}
              {repeatCount > 1 && (
                <>
                  <span className="h-1 w-1 rounded-full bg-slate-800" />
                  <span className="text-rose-400">{repeatCount}x REPEAT</span>
                </>
              )}
              <div className="ml-auto flex items-center gap-1 text-slate-600">
                <ChevronDown className={cn("h-3 w-3 transition-transform duration-200", isAnswerVisible && "rotate-180 text-emerald-400")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("group/question relative transition-colors", theme === 'light' ? "bg-white" : "")}>
        <div
          className={cn(
            "flex cursor-pointer flex-col px-3 py-3.5 transition-all sm:p-5 gap-2",
            theme === 'light' ? "hover:bg-[#F5F5F7]" : "hover:bg-slate-800/40"
          )}
          onClick={handleCardClick}
        >
          {/* Top line: Q-number and Chevron */}
          <div className="flex items-center justify-between">
            <span className={cn(
              "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider",
              theme === 'light' ? "border-blue-200 bg-blue-50 text-blue-600" : "border-blue-500/20 bg-blue-500/10 text-blue-400"
            )}>
              Q{index + 1}
            </span>
            <div className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full transition-all",
              theme === 'light' ? "bg-slate-100 text-slate-500 hover:bg-slate-200" : "bg-slate-800 text-slate-400",
              isAnswerVisible && (theme === 'light' ? "bg-emerald-50 text-emerald-600" : "bg-emerald-500/20 text-emerald-400")
            )}>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", isAnswerVisible && "rotate-180")} />
            </div>
          </div>

          {/* Second line: Question Text (Spans full width from left) */}
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                'text-sm leading-relaxed transition-colors font-bold sm:text-[15px]',
                theme === 'light' ? 'text-slate-900' : 'text-slate-200'
              )}
            >
              {displayText}
            </p>
          </div>

          {/* Third line: Sahi Uttar (Clean green badge matching screenshot) */}
          {isAnswerVisible && correctDisplay && (
            <div className="flex items-start gap-1.5 pt-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                {isHindi ? 'सही उत्तर' : 'Correct Answer'}:
              </span>
              <span className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2">
                {correctDisplay}
              </span>
            </div>
          )}

          {/* Fourth line: Badges row */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {showYear && (
              <YearBadge
                year={question.year}
                variant="amber"
                className="border-amber-200 bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-700 uppercase rounded-md"
              />
            )}
            {question.subject && (
              <Badge className="border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold tracking-widest text-emerald-700 hover:bg-emerald-50 uppercase rounded-md">
                {question.subject}
              </Badge>
            )}
            {question.qNo && (
              <span className="font-mono text-[9px] font-bold tracking-widest text-slate-400 uppercase">
                SET-Q{question.qNo}
              </span>
            )}
            {repeatCount > 1 && (
              <Badge className="h-5 border-none bg-rose-500/20 px-1.5 text-[10px] text-rose-400">
                <Repeat className="mr-0.5 h-3 w-3" />
                {isHindi ? `${repeatCount}x रिपीट` : `Repeated ${repeatCount}x`}
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Full variant - used in detailed views
  return (
    <Link href={`/syllabus/quiz/pyq/question/${question.id}`} className="block">
      <div className="group/question relative cursor-pointer overflow-hidden bg-slate-950/20 p-5 transition-all hover:bg-slate-900/40 sm:p-6">
        <div className="flex items-start gap-4">
          {showYear && (
            <div className="mt-1 flex items-center gap-1.5">
              {question.qNo && (
                <span className="font-mono text-[10px] text-slate-500">Q{question.qNo}</span>
              )}
              {question.subject && (
                <Badge
                  variant="outline"
                  className="h-5 border-emerald-500/30 bg-emerald-500/10 px-1.5 text-[9px] font-black tracking-tight text-emerald-400 uppercase sm:inline-flex"
                >
                  {question.subject}
                </Badge>
              )}
              <YearBadge year={question.year} variant="emerald" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-relaxed font-medium break-words whitespace-normal text-slate-300 transition-colors group-hover/question:text-white sm:text-base">
              {displayText}
            </p>
            {altText && altText !== displayText && (
              <p className="mt-2 text-xs leading-relaxed break-words whitespace-normal text-slate-500 italic sm:text-sm">
                {altText}
              </p>
            )}
          </div>
          {repeatCount > 1 && (
            <Badge className="shrink-0 border-none bg-rose-500/20 px-2 py-1 text-xs text-rose-400">
              <Repeat className="mr-1 h-3 w-3" />
              {repeatCount}x
            </Badge>
          )}
          <ArrowRight className="h-4 w-4 shrink-0 -translate-x-1 text-slate-800 opacity-0 transition-all group-hover/question:translate-x-0 group-hover/question:text-emerald-500 group-hover/question:opacity-100" />
        </div>
      </div>
    </Link>
  );
}

interface QuestionListProps {
  questions: QuestionData[];
  isHindi: boolean;
  getRepeatCount?: (questionId: string) => number;
  showYears?: boolean;
  groupByYear?: boolean;
  maxVisible?: number;
  variant?: 'compact' | 'full' | 'card';
  showAllExpanded?: boolean;
  showAnswers?: boolean;
  theme?: 'light' | 'dark';
  hideFullQuestionLink?: boolean;
}

export function QuestionList({
  questions,
  isHindi,
  getRepeatCount,
  showYears = true,
  groupByYear = false,
  maxVisible,
  variant = 'compact',
  showAllExpanded = false,
  showAnswers = false,
  theme = 'dark',
  hideFullQuestionLink = false,
}: QuestionListProps) {
  const [showAll, setShowAll] = useState(false);

  if (groupByYear) {
    // Group questions by year
    const byYear = questions.reduce(
      (acc, q) => {
        if (!acc[q.year]) acc[q.year] = [];
        acc[q.year].push(q);
        return acc;
      },
      {} as Record<number, QuestionData[]>
    );

    const sortedYears = Object.keys(byYear)
      .map(Number)
      .sort((a, b) => b - a);

    return (
      <div
        className={cn(
          'divide-y',
          theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/30',
          variant === 'card' && 'space-y-4 divide-none p-4'
        )}
      >
        {sortedYears.map((year) => (
          <div key={year} className={cn(variant === 'card' && 'space-y-3')}>
            <div
              className={cn(
                'sticky top-0 z-10 flex items-center gap-2 bg-slate-900/95 px-4 py-2 backdrop-blur-sm',
                variant === 'card' && 'relative top-auto z-0 bg-transparent px-0 py-1'
              )}
            >
              <YearBadge year={year} variant="emerald" />
              <span className="text-xs text-slate-500">
                ({byYear[year].length} {isHindi ? 'प्रश्न' : 'questions'})
              </span>
            </div>
            <div
              className={cn(
                'divide-y',
                theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/20',
                variant === 'card' && 'grid gap-3 divide-none'
              )}
            >
              {byYear[year].map((q, idx) => (
                <QuestionItem
                  key={q.id}
                  question={q}
                  index={idx}
                  isHindi={isHindi}
                  repeatCount={getRepeatCount?.(q.id) || 0}
                  showYear={false}
                  variant={variant}
                  defaultExpanded={showAllExpanded}
                  showAnswer={showAnswers}
                  theme={theme}
                  hideFullQuestionLink={hideFullQuestionLink}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const visibleQuestions = maxVisible && !showAll ? questions.slice(0, maxVisible) : questions;
  const hasMore = maxVisible && questions.length > maxVisible;

  return (
    <div className={cn(variant === 'card' && 'grid gap-4 p-4 sm:p-5')}>
      <div
        className={cn(
          'divide-y',
          theme === 'light' ? 'divide-slate-200' : 'divide-slate-800/30',
          variant === 'card' && 'grid gap-4 divide-none'
        )}
      >
        {visibleQuestions.map((q, idx) => (
          <QuestionItem
            key={q.id}
            question={q}
            index={idx}
            isHindi={isHindi}
            repeatCount={getRepeatCount?.(q.id) || 0}
            showYear={showYears}
            variant={variant}
            defaultExpanded={showAllExpanded}
            showAnswer={showAnswers}
            theme={theme}
            hideFullQuestionLink={hideFullQuestionLink}
          />
        ))}
      </div>

      {hasMore && !showAll && (
        <div
          className={cn(
            'border-t p-4',
            theme === 'light' ? 'border-slate-200' : 'border-slate-800/30',
            variant === 'card' && 'border-none pt-2'
          )}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAll(true)}
            className={cn(
              'w-full',
              theme === 'light'
                ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                : 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
            )}
          >
            {isHindi
              ? `सभी ${questions.length} प्रश्न देखें`
              : `Show all ${questions.length} questions`}
            <ChevronDown className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
