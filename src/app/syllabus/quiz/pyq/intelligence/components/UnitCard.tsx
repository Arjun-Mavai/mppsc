'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Eye, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UnitBadge } from './shared/UnitBadge';
import { formatUnitTitle, getUnitColor } from './shared/constants';
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
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const percentage = totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0;
  const colorClass = getUnitColor(unitId);

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
    <div className={cn(
      "rounded-xl border transition-colors",
      theme === 'light' 
        ? `${colorTheme.border} ${isExpanded ? colorTheme.activeBg : cn(colorTheme.bg, colorTheme.hoverBg)}`
        : "border-slate-800/50 bg-slate-800/30 hover:bg-slate-800/50"
    )}>
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <UnitBadge unitId={unitId} size="lg" />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className={cn("text-sm font-bold truncate", theme === 'light' ? "text-[#1D1D1F]" : "text-white")}>
              {formatUnitTitle(unitId, isHindi)}
            </h4>
            <Badge
              variant="secondary"
              className={cn(
                "h-5 shrink-0 px-2 font-mono text-[10px]",
                theme === 'light' 
                  ? "border-[#E5E5EA] bg-[#F5F5F7] text-[#86868B]" 
                  : "border-slate-700 bg-slate-900 text-slate-400"
              )}
            >
              {questionCount}
            </Badge>
          </div>
          <p className={cn("mt-0.5 text-xs truncate", theme === 'light' ? "text-[#86868B]" : "text-slate-500")}>
            {unitTitle}
          </p>
          
          {showPercentage && (
            <div className="mt-2 flex items-center gap-2">
              <Progress
                value={percentage}
                className={cn('h-1.5 flex-1', theme === 'light' ? 'bg-[#F5F5F7]' : 'bg-slate-800', `[&>div]:${colorClass}`)}
              />
              <span className={cn("text-xs font-medium tabular-nums", theme === 'light' ? "text-[#86868B]" : "text-slate-400")}>
                {percentage}%
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className={cn("h-5 w-5", theme === 'light' ? "text-indigo-500" : "text-emerald-400")} />
          ) : (
            <ChevronDown className={cn("h-5 w-5", theme === 'light' ? "text-[#86868B]" : "text-slate-600")} />
          )}
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className={cn("border-t", theme === 'light' ? colorTheme.border : "border-slate-800/50")}>
              {/* Header with View All button */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-5">
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                  {isHindi ? 'प्रश्न' : 'Questions'} ({questions.length})
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAllQuestions(!showAllQuestions);
                    }}
                    className={cn(
                      "h-7 gap-1.5 px-2 text-xs transition-all",
                      theme === 'light' 
                        ? "text-[#86868B] hover:bg-[#F5F5F7] hover:text-[#1D1D1F]" 
                        : "text-slate-400 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showAllQuestions 
                      ? (isHindi ? 'संक्षिप्त' : 'Collapse')
                      : (isHindi ? 'विस्तार' : 'Expand')}
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
              
              <div className={cn(
                'overflow-y-auto',
                showAllQuestions ? 'max-h-none' : 'max-h-[80vh] sm:max-h-none'
              )}>
                <QuestionList
                  questions={questions}
                  isHindi={isHindi}
                  getRepeatCount={getRepeatCount}
                  showYears={true}
                  groupByYear={groupQuestionsByYear}
                  variant={theme === 'light' ? 'compact' : 'card'}
                  showAllExpanded={showAllQuestions}
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
