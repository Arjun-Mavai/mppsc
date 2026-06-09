'use client';

import { useState, useMemo, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Eye, ExternalLink, Loader2 } from 'lucide-react';
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
  theme?: 'light' | 'dark';
}

export function OverallWeightage({
  simpleSubjectStats,
  subjectQuestionsData,
  isHindi,
  theme = 'dark',
}: OverallWeightageProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
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

  const handleViewAll = () => {
    startTransition(() => {
      router.push('/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-1">
        <div className={cn(
          "h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]",
          theme === 'light' ? "bg-indigo-500" : "bg-emerald-500"
        )} />
        <h2 className={cn("text-xl font-black tracking-tight sm:text-2xl", theme === 'light' ? "text-[#1D1D1F]" : "text-white")}>
          {isHindi ? 'कुल महत्व (2020-2026)' : 'Overall Weightage (2020-2026)'}
        </h2>
      </div>

      {/* Main Overall Weightage Section - Same style as Paper Analysis */}
      <div className="relative">
        <div className={cn(
          "absolute -inset-1 rounded-[2rem] opacity-20 blur-xl",
          theme === 'light' ? "bg-indigo-500/10" : "bg-gradient-to-r from-emerald-600/20 to-teal-500/10"
        )} />

        <Card className={cn(
          "relative z-10 overflow-hidden rounded-[2rem] shadow-2xl transition-all duration-300 border",
          theme === 'light' 
            ? "border-[#fce7f3] bg-[#fdf2f8]/80 backdrop-blur-none" 
            : "border-white/[0.03] bg-[#080510]/80 backdrop-blur-xl"
        )}>
          {/* Main Header - Same style as Paper Analysis year header */}
          <div
            className={cn(
              "flex cursor-pointer items-center justify-between bg-transparent px-6 py-6",
              theme === 'light' ? 'border-b border-[#fce7f3]' : 'border-b border-white/[0.05]'
            )}
            onClick={toggleMainSection}
          >
            <div className="flex flex-col gap-1">
              <div className={cn("mb-1 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] uppercase", theme === 'light' ? "text-[#86868B]" : "text-slate-500")}>
                <div className={cn("h-1.5 w-1.5 rounded-full", theme === 'light' ? "bg-indigo-500" : "bg-emerald-500")} />
                {isHindi ? 'MPPSC प्रिलिम्स' : 'MPPSC Prelims'}
              </div>
              <h3 className={cn("flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl", theme === 'light' ? "text-slate-900" : "text-amber-500")}>
                {isHindi ? 'कुल वेटेज' : 'Overall Weightage'}
                <Badge
                  variant="outline"
                  className={cn(
                    "hidden rounded-full px-3 py-1 text-[10px] font-black sm:inline-flex",
                    theme === 'light' 
                      ? "border-indigo-100 bg-indigo-50 text-indigo-600" 
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
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
                  "h-8 px-3 text-[10px] font-black sm:inline-flex",
                  theme === 'light' 
                    ? "border-[#E5E5EA] bg-[#F5F5F7] text-[#1D1D1F]" 
                    : "border-white/[0.05] bg-white/[0.03] text-slate-400"
                )}
              >
                {subjectsWithCounts.length} {isHindi ? 'विषय' : 'Subjects'}
              </Badge>

              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border transition-all',
                  isMainExpanded
                    ? (theme === 'light' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'border-emerald-400 bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]')
                    : (theme === 'light' ? 'border-[#E5E5EA] bg-white text-[#86868B]' : 'border-white/5 bg-white/5 text-slate-500')
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
                <CardContent className="px-1.5 py-4 sm:p-6">
                  <div className="space-y-4">
                    {/* All Subject Cards Inside */}
                    {subjectsWithCounts.map((sub, idx) => {
                      const variant = SUBJECT_VARIANTS[sub.color];
                      const Icon = sub.icon;
                      const isSubjectExpanded = expandedSubjects.includes(sub.name);

                      const cardColors = [
                        { bg: 'bg-[#f0fdfa]/80', hoverBg: 'hover:bg-[#f0fdfa]', border: 'border-[#ccfbf1]', text: 'text-[#0f766e]', activeBg: 'bg-[#f0fdfa]' },
                        { bg: 'bg-[#fdf2f8]/80', hoverBg: 'hover:bg-[#fdf2f8]', border: 'border-[#fce7f3]', text: 'text-[#be185d]', activeBg: 'bg-[#fdf2f8]' },
                        { bg: 'bg-[#ecfdf5]/80', hoverBg: 'hover:bg-[#ecfdf5]', border: 'border-[#d1fae5]', text: 'text-[#047857]', activeBg: 'bg-[#ecfdf5]' },
                        { bg: 'bg-[#fffbeb]/80', hoverBg: 'hover:bg-[#fffbeb]', border: 'border-[#fef3c7]', text: 'text-[#b45309]', activeBg: 'bg-[#fffbeb]' },
                        { bg: 'bg-[#f5f3ff]/80', hoverBg: 'hover:bg-[#f5f3ff]', border: 'border-[#ede9fe]', text: 'text-[#6d28d9]', activeBg: 'bg-[#f5f3ff]' },
                      ];
                      const colorIndex = idx % cardColors.length;
                      const colorTheme = cardColors[colorIndex];

                      return (
                        <div
                          key={sub.name}
                          className={cn(
                            'rounded-[1.5rem] border transition-all duration-300',
                            theme === 'light'
                              ? (isSubjectExpanded ? `${colorTheme.border} ${colorTheme.activeBg}` : `${colorTheme.border} ${colorTheme.bg} ${colorTheme.hoverBg}`)
                              : (isSubjectExpanded ? 'border-white/10 bg-white/[0.05]' : 'border-white/[0.03] bg-white/[0.02] hover:bg-white/[0.04]')
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
                                <h4 className={cn("truncate text-sm font-black tracking-tight", theme === 'light' ? "text-[#1D1D1F]" : "text-white")}>
                                  {isHindi ? sub.nameHi : sub.name}
                                </h4>
                                <span className={cn("font-mono text-[10px] font-black", theme === 'light' ? "text-indigo-500" : "text-emerald-500/60")}>
                                  {sub.count}
                                </span>
                              </div>
                              <p className={cn("mt-0.5 text-[10px] font-bold tracking-wider uppercase", theme === 'light' ? "text-[#86868B]" : "text-slate-500")}>
                                {sub.percentage}%{' '}
                                {isHindi ? 'कुल प्रश्नों का' : 'of total questions'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <TransitionLink
                                href={`/syllabus/quiz/pyq/intelligence/questions?subject=${encodeURIComponent(sub.name)}&source=subject`}
                                onClick={(e) => e.stopPropagation()}
                                transitionTypes={['slide']}
                                className={cn(
                                  "inline-flex h-8 items-center gap-1.5 rounded-xl px-4 text-[10px] font-black tracking-widest uppercase transition-all active:scale-95",
                                  theme === 'light'
                                    ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                    : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                                )}
                              >
                                {isHindi ? 'देखें' : 'View'}
                                <ExternalLink className="h-3 w-3" />
                              </TransitionLink>

                              <div
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-full transition-all',
                                  isSubjectExpanded
                                    ? (theme === 'light' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-500/20 text-emerald-400')
                                    : (theme === 'light' ? 'text-[#86868B]' : 'text-slate-600')
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
                                <div className={cn("space-y-3 border-t p-0", theme === 'light' ? colorTheme.border : "border-white/[0.05]")}>
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
                                        variant={theme === 'light' ? 'compact' : 'card'}
                                        showYears={true}
                                        theme={theme}
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

      <div className="flex justify-center pt-8">
        <Button
          variant="outline"
          size="lg"
          onClick={handleViewAll}
          disabled={isPending}
          className={cn(
            "h-14 w-full rounded-2xl px-10 text-xs font-black tracking-[0.1em] uppercase transition-all active:scale-95 sm:w-fit sm:min-w-[360px]",
            theme === 'light'
              ? "border-indigo-100 bg-white text-indigo-600 hover:bg-[#F5F5F7] hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)]"
              : "border-emerald-500/20 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]"
          )}
        >
          {isPending ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin" />
          ) : (
            <Eye className="mr-3 h-4 w-4" />
          )}
          {isHindi ? 'सभी विषय प्रश्न देखें' : 'View All Subject Questions'}
          {!isPending && <ExternalLink className="ml-3 h-4 w-4 opacity-50" />}
        </Button>
      </div>
    </div>
  );
}
