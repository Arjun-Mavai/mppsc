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
}: UnitCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const percentage = totalQuestions > 0 ? Math.round((questionCount / totalQuestions) * 100) : 0;
  const colorClass = getUnitColor(unitId);

  // Build View All URL
  const viewAllUrl = `/syllabus/quiz/pyq/intelligence/questions?unit=${unitId}&source=${variant}${year ? `&year=${year}` : ''}`;

  return (
    <div className="rounded-xl border border-slate-800/50 bg-slate-800/30 transition-colors hover:bg-slate-800/50">
      {/* Header */}
      <div
        className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <UnitBadge unitId={unitId} size="lg" />
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-white truncate">
              {formatUnitTitle(unitId, isHindi)}
            </h4>
            <Badge
              variant="secondary"
              className="h-5 shrink-0 border border-slate-700 bg-slate-900 px-2 font-mono text-[10px] text-slate-400"
            >
              {questionCount}
            </Badge>
          </div>
          <p className="mt-0.5 text-xs text-slate-500 truncate">
            {unitTitle}
          </p>
          
          {showPercentage && (
            <div className="mt-2 flex items-center gap-2">
              <Progress
                value={percentage}
                className={cn('h-1.5 flex-1 bg-slate-800', `[&>div]:${colorClass}`)}
              />
              <span className="text-xs font-medium text-slate-400 tabular-nums">
                {percentage}%
              </span>
            </div>
          )}
        </div>

        <div className="shrink-0">
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-emerald-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-slate-600" />
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
            <div className="border-t border-slate-800/50">
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
                    className="h-7 gap-1.5 px-2 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
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
                    className="inline-flex h-7 items-center gap-1.5 rounded-md bg-emerald-500/10 px-3 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20 hover:text-emerald-300"
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
                  variant="card"
                  showAllExpanded={showAllQuestions}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
