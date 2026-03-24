'use client';

import { useState } from 'react';
import { TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { UnitCard } from './UnitCard';
import { UnitDistributionStats, RepeatedQuestion } from '@/actions/pyq-analytics';
import { QuestionData } from './QuestionItem';

interface PaperAnalysisProps {
  stats: UnitDistributionStats[];
  repeatedQuestions: RepeatedQuestion[];
  isHindi: boolean;
}

export function PaperAnalysis({ stats, repeatedQuestions, isHindi }: PaperAnalysisProps) {
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
        <TrendingUp className="h-6 w-6 text-emerald-400" />
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {isHindi ? 'पेपर वाइज विश्लेषण' : 'Paper-wise Analysis'}
        </h2>
      </div>

      <div className="space-y-4">
        {years.map((year) => {
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

          return (
            <div key={year} className="relative">
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 opacity-20 blur-xl" />
              <Card className="relative z-10 overflow-hidden rounded-[2rem] border-slate-800 bg-slate-900 shadow-2xl">
                {/* Year Header */}
                <div
                  className="flex cursor-pointer items-center justify-between border-b border-white/5 bg-transparent px-6 py-6"
                  onClick={() => toggleYear(year)}
                >
                  <div className="flex flex-col gap-1">
                    <div className="mb-1 flex items-center gap-2 text-sm font-medium tracking-wider text-slate-400 uppercase">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {isHindi ? 'MPPSC प्रिलिम्स' : 'MPPSC Prelims'}
                    </div>
                    <h3 className="flex items-center gap-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                      {year}
                      <Badge
                        variant="outline"
                        className="hidden rounded-full border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-bold text-emerald-400 sm:inline-flex"
                      >
                        {totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                      </Badge>
                    </h3>
                  </div>

                  <div className="flex items-center gap-4">
                    <Badge
                      variant="secondary"
                      className="h-8 border border-slate-700 bg-slate-800 px-3 font-mono text-sm text-slate-300 sm:inline-flex"
                    >
                      {/* {sortedUnits.length} Units */}
                      10 {isHindi ? 'यूनिट्स' : 'Units'}
                    </Badge>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-slate-800 shadow-inner">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-slate-400" />
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
                      <CardContent className="p-4 sm:p-6">
                        <div className="space-y-4">
                          {sortedUnits.map((unitStat) => {
                            // Map questions to QuestionData format (including qNo)
                            const questions: QuestionData[] = unitStat.questions.map((q) => ({
                              id: q.id,
                              text: q.text,
                              textEn: q.textEn,
                              year: q.year,
                              qNo: q.qNo,
                              subject: q.subject, // Map subject from DB
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
