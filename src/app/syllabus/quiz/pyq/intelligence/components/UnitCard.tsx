'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UnitBadge } from './shared/UnitBadge';
import { formatUnitTitle } from './shared/constants';
import { QuestionList, QuestionData } from './QuestionItem';
import { TransitionLink } from '@/components/ui/transition-link';

interface UnitCardProps {
  unitId: string;
  unitTitle: string;
  questionCount: number;
  totalQuestions: number;
  questions: QuestionData[];
  isHindi: boolean;
  getRepeatCount?: (questionId: string) => number;
  defaultExpanded?: boolean;
  variant?: 'paper' | 'combined';
  showPercentage?: boolean;
  groupQuestionsByYear?: boolean;
  year?: number;
  theme?: 'light' | 'dark';
}

export function UnitCard({
  unitId,
  unitTitle,
  questionCount,
  totalQuestions,
  questions,
  isHindi,
  getRepeatCount,
  defaultExpanded = false,
  variant = 'combined',
  showPercentage = true,
  groupQuestionsByYear = false,
  year,
  theme = 'dark',
}: UnitCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  // 🟢 State to toggle all answers in this unit
  const [showAnswers, setShowAnswers] = useState(false);
  const percentage = totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0;

  // Build View All URL
  const viewAllUrl = `/syllabus/quiz/pyq/intelligence/questions?unit=${unitId}&source=${variant}${year ? `&year=${year}` : ''}`;

  const unitNum = parseInt(unitId.replace('unit_', '')) || 1;
  const cardColors = [
    { bg: 'bg-[#f0fdfa]/80', hoverBg: 'hover:bg-[#f0fdfa]', border: 'border-[#ccfbf1]', text: 'text-[#0f766e]', activeBg: 'bg-[#f0fdfa]' },
    { bg: 'bg-[#fdf2f8]/80', hoverBg: 'hover:bg-[#fdf2f8]', border: 'border-[#fce7f3]', text: 'text-[#be185d]', activeBg: 'bg-[#fdf2f8]' },
    { bg: 'bg-[#ecfdf5]/80', hoverBg: 'hover:bg-[#ecfdf5]', border: 'border-[#d1fae5]', text: 'text-[#047857]', activeBg: 'bg-[#ecfdf5]' },
    { bg: 'bg-[#fffbeb]/80', hoverBg: 'hover:bg-[#fffbeb]', border: 'border-[#fef3c7]', text: 'text-[#b45309]', activeBg: 'bg-[#fffbeb]' },
    { bg: 'bg-[#f5f3ff]/80', hoverBg: 'hover:bg-[#f5f3ff]', border: 'border-[#ede9fe]', text: 'text-[#6d28d9]', activeBg: 'bg-[#f5f3ff]' },
  ];
  const colorIndex = (unitNum - 1) % cardColors.length;
  const colorTheme = cardColors[colorIndex];

  return (
    <div
      className={cn(
        'rounded-[1.5rem] border transition-all duration-300',
        theme === 'light'
          ? (isExpanded ? `${colorTheme.border} ${colorTheme.activeBg}` : `${colorTheme.border} ${colorTheme.bg} ${colorTheme.hoverBg}`)
          : (isExpanded ? 'border-white/10 bg-white/[0.05]' : 'border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.04]')
      )}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <UnitBadge
          unitId={unitId}
          className="shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className={cn("text-base font-bold sm:text-lg", theme === 'light' ? colorTheme.text : "text-white")}>
              {unitTitle ? `${formatUnitTitle(unitId, isHindi)}: ${unitTitle}` : formatUnitTitle(unitId, isHindi)}
            </h4>
            <div className="flex items-center gap-3">
              <span className={cn("text-sm font-black", theme === 'light' ? colorTheme.text : "text-emerald-400")}>
                {questionCount} {isHindi ? 'प्रश्न' : 'Questions'}
              </span>
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full border transition-all',
                  isExpanded
                    ? (theme === 'light' ? `${colorTheme.text} border-current bg-white shadow-xs` : 'border-emerald-400 bg-emerald-500 text-black shadow-xs')
                    : (theme === 'light' ? 'border-slate-200 bg-white text-[#86868B]' : 'border-white/5 bg-white/5 text-slate-500')
                )}
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </div>

          {showPercentage && (
            <div className="mt-2 flex items-center gap-3">
              <Progress value={percentage} className="h-1 flex-1 bg-white/5" />
              <span className="text-[10px] font-black text-slate-500">{percentage}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn("border-t", theme === 'light' ? colorTheme.border : "border-slate-800/50")}>
              {/* Header with Show/Hide Answers and View All button */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {isHindi ? 'प्रश्न' : 'Questions'} ({questions.length})
                </span>
                <div className="flex items-center gap-2">
                  {/* 🟢 Minimalist CheckCircle Toggle: उत्तर दिखाएं / उत्तर छिपाएं */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAnswers(!showAnswers);
                    }}
                    className={cn(
                      "h-7 gap-1.5 rounded-lg border px-2.5 text-xs font-bold transition-all active:scale-95",
                      showAnswers
                        ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/70 shadow-xs"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <CheckCircle className={cn("h-3.5 w-3.5 transition-colors", showAnswers ? "text-emerald-600" : "text-slate-400")} />
                    <span>
                      {isHindi 
                        ? (showAnswers ? 'उत्तर छिपाएं' : 'उत्तर दिखाएं') 
                        : (showAnswers ? 'Hide Answers' : 'Show Answers')}
                    </span>
                  </Button>

                  <TransitionLink
                    href={viewAllUrl}
                    onClick={(e) => e.stopPropagation()}
                    transitionTypes={['slide']}
                    className={cn(
                      "inline-flex h-7 items-center gap-1.5 rounded-md px-3 text-xs font-bold transition-colors",
                      theme === 'light'
                        ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                        : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                    )}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {isHindi ? 'सभी देखें' : 'View All'}
                  </TransitionLink>
                </div>
              </div>
              
              <div className="overflow-y-auto max-h-[80vh] sm:max-h-none">
                <QuestionList
                  questions={questions}
                  isHindi={isHindi}
                  getRepeatCount={getRepeatCount}
                  showYears={true}
                  groupByYear={groupQuestionsByYear}
                  variant={theme === 'light' ? 'compact' : 'card'}
                  showAllExpanded={showAnswers}
                  showAnswers={showAnswers}
                  theme={theme}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
