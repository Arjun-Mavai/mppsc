'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Eye, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { OverallWeightageSubjectData } from '@/actions/pyq-analytics';
import { SUBJECTS, SUBJECT_VARIANTS } from '@/lib/pyq-ui-constants';
import { TransitionLink } from '@/components/ui/transition-link';
import { QuestionList, QuestionData } from './QuestionItem';

interface OverallWeightageProps {
  simpleSubjectStats: Record<string, number>;
  subjectQuestionsData: OverallWeightageSubjectData[];
  isHindi: boolean;
}

export function OverallWeightage({
  simpleSubjectStats,
  subjectQuestionsData,
  isHindi,
}: OverallWeightageProps) {
  const router = useRouter();
  const [isMainExpanded, setIsMainExpanded] = useState(false);
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);

  // Get total questions from simple stats (same as PYQ page)
  const totalQuestions = useMemo(
    () => Object.values(simpleSubjectStats).reduce((sum, count) => sum + count, 0),
    [simpleSubjectStats]
  );

  // 🔧 PERF FIX: Memoize expensive array operations (map/filter/sort)
  // This prevents recalculation on every expandedSubjects or isMainExpanded change
  const subjectsWithCounts = useMemo(
    () =>
      SUBJECTS.map((sub) => ({
        ...sub,
        count: simpleSubjectStats[sub.name] || 0,
        percentage:
          totalQuestions > 0
            ? Math.round(((simpleSubjectStats[sub.name] || 0) / totalQuestions) * 100)
            : 0,
      }))
        .filter((sub) => sub.count > 0)
        .sort((a, b) => b.count - a.count),
    [simpleSubjectStats, totalQuestions]
  );

  const toggleMainSection = () => {
    setIsMainExpanded(!isMainExpanded);
  };

  const toggleSubject = (subjectName: string) => {
    setExpandedSubjects((prev) =>
      prev.includes(subjectName) ? prev.filter((s) => s !== subjectName) : [...prev, subjectName]
    );
  };

  useEffect(() => {
    router.prefetch('/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject');
  }, [router]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
        <h2 className="text-xl font-black tracking-tight text-white sm:text-2xl">
          {isHindi ? 'कुल महत्व (2020-2025)' : 'Overall Weightage (2020-2025)'}
        </h2>
      </div>

      {/* Main Overall Weightage Section - Same style as Paper Analysis */}
      <div className="relative">
        <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-600/20 to-teal-500/10 opacity-20 blur-xl" />

        <Card className="relative z-10 overflow-hidden rounded-[2rem] border-white/[0.03] bg-[#080510]/80 shadow-2xl backdrop-blur-xl">
          {/* Main Header - Same style as Paper Analysis year header */}
          <div
            className="flex cursor-pointer items-center justify-between border-b border-white/[0.05] bg-transparent px-6 py-6"
            onClick={toggleMainSection}
          >
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {isHindi ? 'MPPSC प्रिलिम्स' : 'MPPSC Prelims'}
              </div>
              <h3 className="flex items-center gap-3 text-2xl font-black tracking-tight text-amber-500 sm:text-3xl">
                {isHindi ? 'कुल वेटेज' : 'Overall Weightage'}
                <Badge
                  variant="outline"
                  className="hidden rounded-full border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-black text-emerald-500 sm:inline-flex"
                >
                  {totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                </Badge>
              </h3>
            </div>

            <div className="flex items-center gap-4">
              <Badge
                variant="secondary"
                className="h-8 border border-white/[0.05] bg-white/[0.03] px-3 text-[10px] font-black text-slate-400 sm:inline-flex"
              >
                {subjectsWithCounts.length} {isHindi ? 'विषय' : 'Subjects'}
              </Badge>

              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                  isMainExpanded
                    ? 'border-emerald-400 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'border-white/5 bg-white/5 text-slate-500'
                )}
              >
                {isMainExpanded ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>

          {/* Main Expanded Content */}
          <AnimatePresence>
            {isMainExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4">
                    {/* All Subject Cards Inside */}
                    {subjectsWithCounts.map((sub) => {
                      const variant = SUBJECT_VARIANTS[sub.color];
                      const Icon = sub.icon;
                      const isSubjectExpanded = expandedSubjects.includes(sub.name);

                      return (
                        <div
                          key={sub.name}
                          className={cn(
                            'rounded-[1.5rem] border transition-all duration-300',
                            isSubjectExpanded
                              ? 'border-white/10 bg-white/[0.05]'
                              : 'border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.04]'
                          )}
                        >
                          {/* Subject Header */}
                          <div
                            className="flex cursor-pointer items-center gap-4 p-4 sm:p-5"
                            onClick={() => toggleSubject(sub.name)}
                          >
                            <div
                              className={cn(
                                'flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br shadow-inner',
                                variant.bg.replace('indigo', 'violet')
                              )}
                            >
                              <Icon
                                className={cn('h-5 w-5', variant.text.replace('indigo', 'violet'))}
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="truncate text-sm font-black tracking-tight text-white">
                                  {isHindi ? sub.nameHi : sub.name}
                                </h4>
                                <span className="font-mono text-[10px] font-black text-emerald-500/60">
                                  {sub.count}
                                </span>
                              </div>
                              <p className="mt-0.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                                {sub.percentage}%{' '}
                                {isHindi ? 'कुल प्रश्नों का' : 'of total questions'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <TransitionLink
                                href={`/syllabus/quiz/pyq/intelligence/questions?subject=${encodeURIComponent(sub.name)}&source=subject`}
                                onClick={(e) => e.stopPropagation()}
                                transitionTypes={['slide']}
                                className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-500/10 px-4 text-[10px] font-black tracking-widest text-emerald-500 uppercase transition-all hover:bg-emerald-500/20 active:scale-95"
                              >
                                {isHindi ? 'देखें' : 'View'}
                                <ExternalLink className="h-3 w-3" />
                              </TransitionLink>

                              <div
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                                  isSubjectExpanded
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'text-slate-600'
                                )}
                              >
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 transition-transform',
                                    isSubjectExpanded && 'rotate-180'
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Subject Expanded content */}
                          <AnimatePresence>
                            {isSubjectExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="space-y-3 border-t border-white/[0.05] p-0">
                                  {(() => {
                                    // Find questions for this subject
                                    const subjectData = subjectQuestionsData.find(
                                      (data) =>
                                        data.subject === sub.name || data.subject === sub.nameHi
                                    );
                                    const subjectQuestions = subjectData?.questions || [];
                                    
                                    // Map to QuestionData format
                                    const mappedQuestions: QuestionData[] = subjectQuestions.map(q => ({
                                      id: q.id,
                                      text: q.text,
                                      textEn: q.textEn,
                                      year: q.year,
                                      qNo: q.qNo,
                                      testTitle: q.testTitle,
                                      subject: q.subject
                                    }));

                                    return mappedQuestions.length > 0 ? (
                                      <QuestionList
                                        questions={mappedQuestions}
                                        isHindi={isHindi}
                                        maxVisible={5}
                                        variant="card"
                                        showYears={true}
                                      />
                                    ) : (
                                      <div className="rounded-xl border border-dashed border-white/5 bg-white/[0.02] py-8 text-center mx-4 my-4">
                                        <p className="text-[10px] font-black tracking-[0.2em] text-slate-600 uppercase">
                                          {isHindi ? 'कोई प्रश्न उपलब्ध नहीं' : 'No segments found'}
                                        </p>
                                      </div>
                                    );
                                  })()}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </div>

      {/* Overall View All Button */}
      <div className="flex justify-center pt-8">
        <TransitionLink
          href="/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject"
          transitionTypes={['slide']}
        >
          <Button
            variant="outline"
            size="lg"
            className="h-14 rounded-2xl border-emerald-500/20 bg-emerald-500/10 px-8 text-xs font-black tracking-[0.2em] text-emerald-500 uppercase transition-all hover:bg-emerald-500/20 hover:text-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] active:scale-95"
          >
            <Eye className="mr-3 h-4 w-4" />
            {isHindi ? 'सभी विषय प्रश्न देखें' : 'View All Subject Questions'}
            <ExternalLink className="ml-3 h-4 w-4 opacity-50" />
          </Button>
        </TransitionLink>
      </div>
    </div>
  );
}
