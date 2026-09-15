'use client';

import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { UnitCard } from './UnitCard';
import { UnitDistributionStats, RepeatedQuestion } from '@/actions/pyq-analytics';
import { QuestionData } from './QuestionItem';

interface PaperAnalysisProps {
  stats: UnitDistributionStats[];
  repeatedQuestions: RepeatedQuestion[];
  isHindi: boolean;
  theme?: 'light' | 'dark';
}

export function PaperAnalysis({ stats, repeatedQuestions, isHindi, theme = 'dark' }: PaperAnalysisProps) {
  const [expandedYears, setExpandedYears] = useState<number[]>([]);

  const years = Array.from(new Set(stats.map((s) => s.year))).sort((a, b) => b - a);

  const toggleYear = (year: number) => {
    setExpandedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  // Helper to find repeat count
  const getRepeatCount = (questionId: string): number => {
    const match = repeatedQuestions.find((rq) => rq.questionId === questionId);
    return match?.count || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <TrendingUp className={cn("h-6 w-6", theme === 'light' ? "text-indigo-500" : "text-emerald-400")} />
        <h2 className={cn("text-xl font-bold sm:text-2xl", theme === 'light' ? "text-[#1D1D1F]" : "text-white")}>
          {isHindi ? 'पेपर वाइज विश्लेषण' : 'Paper-wise Analysis'}
        </h2>
      </div>

      <div className="space-y-4">
        {years.map((year, idx) => {
          const yearStats = stats.filter((s) => s.year === year);
          const totalQuestions = yearStats.reduce((acc, curr) => acc + curr.count, 0);
          const sortedUnits = [...yearStats].sort((a, b) => {
            const numA = parseInt(a.unitId.replace('unit_', ''));
            const numB = parseInt(b.unitId.replace('unit_', ''));
            if (isNaN(numA)) return 1;
            if (isNaN(numB)) return -1;
            return numA - numB;
          });
          const isExpanded = expandedYears.includes(year);

          const cardColors = [
            { bg: 'bg-[#f0fdfa]/80', border: 'border-[#ccfbf1]', hoverBg: 'hover:bg-[#f0fdfa]' },
            { bg: 'bg-[#fdf2f8]/80', border: 'border-[#fce7f3]', hoverBg: 'hover:bg-[#fdf2f8]' },
            { bg: 'bg-[#ecfdf5]/80', border: 'border-[#d1fae5]', hoverBg: 'hover:bg-[#ecfdf5]' },
            { bg: 'bg-[#fffbeb]/80', border: 'border-[#fef3c7]', hoverBg: 'hover:bg-[#fffbeb]' },
            { bg: 'bg-[#f5f3ff]/80', border: 'border-[#ede9fe]', hoverBg: 'hover:bg-[#f5f3ff]' },
          ];
          const colorIndex = (idx + 2) % cardColors.length;
          const colorTheme = cardColors[colorIndex];

          return (
            <div key={year} className="relative">
            <div className={cn(
                "absolute -inset-1 rounded-[2rem] opacity-20 blur-xl",
                theme === 'light' ? "bg-indigo-500/10" : "bg-gradient-to-r from-emerald-500/20 to-teal-500/20"
              )} />
              <Card className={cn(
                "relative z-10 overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 border",
                theme === 'light' 
                  ? `${colorTheme.border} ${colorTheme.bg} hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)]` 
                  : "border-slate-800 bg-slate-900 shadow-2xl"
              )}>
                {/* Year Header */}
                <div
                  className={cn(
                    "flex cursor-pointer items-center justify-between bg-transparent px-6 py-6",
                    theme === 'light' ? `border-b ${colorTheme.border}` : "border-b border-white/5"
                  )}
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex flex-col gap-1">
                    <div className={cn("mb-1 flex items-center gap-2 text-sm font-medium tracking-wider uppercase", theme === 'light' ? "text-[#86868B]" : "text-slate-400")}>
                      <div className={cn("h-1.5 w-1.5 rounded-full", theme === 'light' ? "bg-indigo-500" : "bg-emerald-500")} />
                      {isHindi ? 'MPPSC प्रिलिम्स' : 'MPPSC Prelims'}
                    </div>
                    <h3 className={cn("flex items-center gap-3 text-2xl font-extrabold tracking-tight sm:text-3xl", theme === 'light' ? "text-[#1D1D1F]" : "text-white")}>
                      {year}
                      <Badge
                        className={cn(
                          "hidden rounded-full px-2 py-0.5 text-xs font-bold sm:inline-flex",
                          theme === 'light' 
                            ? "border-indigo-100 bg-indigo-50 text-indigo-600" 
                            : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                        )}
                      >
                        {totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                      </Badge>
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "h-8 px-3 font-mono text-sm sm:inline-flex",
                        theme === 'light' 
                          ? "border-[#E5E5EA] bg-[#F5F5F7] text-[#1D1D1F]" 
                          : "border-slate-700 bg-slate-800 text-slate-300"
                      )}
                    >
                      {/* {sortedUnits.length} Units */}
                      10 {isHindi ? 'यूनिट्स' : 'Units'}
                    </Badge>
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border shadow-inner transition-colors",
                      theme === 'light' 
                        ? "border-[#E5E5EA] bg-white hover:bg-[#F5F5F7]" 
                        : "border-slate-700 bg-slate-800"
                    )}>
                      {isExpanded ? (
                        <ChevronUp className={cn("h-5 w-5", theme === 'light' ? "text-indigo-500" : "text-emerald-400")} />
                      ) : (
                        <ChevronDown className={cn("h-5 w-5", theme === 'light' ? "text-[#86868B]" : "text-slate-400")} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Year Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="px-1.5 py-4 sm:p-6">
                        <div className="space-y-4">
                          {sortedUnits.map((unitStat) => {
                            // Map questions to QuestionData format (including qNo, options, correctAnswer)
                            const questions: QuestionData[] = unitStat.questions.map((q) => ({
                              id: q.id,
                              text: q.text,
                              textEn: q.textEn,
                              year: q.year,
                              qNo: q.qNo,
                              subject: q.subject, // Map subject from DB
                              options: q.options,
                              correctAnswer: q.correctAnswer,
                              testTitle: `MPPSC Prelims ${q.year}`,
                            }));

                            return (
                                <UnitCard
                                  key={`${year}-${unitStat.unitId}`}
                                  unitId={unitStat.unitId}
                                  unitTitle={unitStat.unitTitle}
                                  questionCount={unitStat.count}
                                  totalQuestions={totalQuestions}
                                  questions={questions}
                                  isHindi={isHindi}
                                  getRepeatCount={getRepeatCount}
                                  variant="paper"
                                  groupQuestionsByYear={false}
                                  year={year}
                                  theme={theme}
                                />
                            );
                          })}
                        </div>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
