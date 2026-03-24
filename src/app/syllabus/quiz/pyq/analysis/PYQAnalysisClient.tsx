'use client';

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  CalendarDays,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  BookOpenText,
  ShieldAlert,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  MousePointer2,
  Hand,
  Zap,
  ArrowLeft,
  Target,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AnimatePresence } from 'framer-motion';
import { RepeatedQuestion } from '@/actions/pyq-analytics';
import type {
  PyqAnalysisResult,
  PyqInsightsCoverageSummary,
  PyqInsightSubjectItem,
} from '@/features/tests/actions/pyq-insights';
import { useSettingsStore } from '@/store/useSettingsStore';

interface PYQAnalysisClientProps {
  subjects: PyqInsightSubjectItem[];
  selectedSubject: string;
  selectedYears: number;
  analysis: PyqAnalysisResult;
  coverage: PyqInsightsCoverageSummary;
  repeatedQuestions: RepeatedQuestion[];
  isAdmin?: boolean;
}

const YEAR_OPTIONS = [3, 4, 5, 6];

const VARIANTS = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    icon: 'text-blue-400',
    border: 'border-blue-100',
    shadow: 'shadow-blue-200/40',
  },
  pink: {
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    icon: 'text-pink-400',
    border: 'border-pink-100',
    shadow: 'shadow-pink-200/40',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    icon: 'text-emerald-400',
    border: 'border-emerald-100',
    shadow: 'shadow-emerald-200/40',
  },
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    icon: 'text-amber-400',
    border: 'border-amber-100',
    shadow: 'shadow-amber-200/40',
  },
};

export default function PYQAnalysisClient({
  subjects,
  selectedSubject,
  selectedYears,
  analysis,
  coverage,
  repeatedQuestions = [],
  isAdmin = false,
}: PYQAnalysisClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    distribution: false,
    rising: false,
    timeline: false,
    matrix: false,
  });
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [topicLimit, setTopicLimit] = useState(10);
  const [isPending, startTransition] = useTransition();

  // Smooth toggle preventing scroll jump
  const toggleSection = (section: string) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const totalQuestions = useMemo(
    () => analysis.yearMatrix.reduce((acc, item) => acc + item.questionCount, 0),
    [analysis.yearMatrix]
  );

  const applyFilters = (subject: string, years: number) => {
    startTransition(() => {
      const params = new URLSearchParams();
      params.set('subject', subject);
      params.set('years', String(years));
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafafa] pb-20">
      {/* Premium multi-colored gradient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-20%] h-[1000px] w-[1000px] rounded-full bg-indigo-200/20 blur-[130px]" />
        <div className="absolute right-[-10%] top-[10%] h-[800px] w-[800px] rounded-full bg-emerald-100/30 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[900px] w-[900px] rounded-full bg-rose-100/20 blur-[140px]" />
        <div className="absolute right-[10%] bottom-[20%] h-[700px] w-[700px] rounded-full bg-amber-100/20 blur-[110px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
      </div>

      <div
        className="relative z-10 mx-auto max-w-[1400px] space-y-8 px-4 pt-4 transition-all duration-500 sm:px-6 lg:px-8"
        style={{
          opacity: isPending ? 0.4 : 1,
          filter: isPending ? 'blur(4px)' : 'none',
          pointerEvents: isPending ? 'none' : 'auto',
        }}
      >
        {/* Transition Overlay */}
        <AnimatePresence>
          {isPending && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/20 backdrop-blur-md"
            >
              <div className="relative">
                <div className="h-20 w-20 animate-spin rounded-full border-t-2 border-b-2 border-emerald-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-12 w-12 animate-pulse rounded-full bg-emerald-500/20"></div>
                </div>
              </div>
              <p className="mt-6 animate-pulse text-sm font-black tracking-[0.2em] text-emerald-500 uppercase">
                {isHindi ? 'नया डेटा लोड हो रहा है...' : 'Syncing Analysis...'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Navigation & Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
            className="group rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-black text-slate-600 shadow-sm backdrop-blur-md transition-all hover:bg-white hover:text-black active:scale-95"
          >
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            {isHindi ? 'वापस' : 'Back'}
          </Button>

          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 shadow-sm backdrop-blur-md">
            <div className="h-1 w-1 animate-pulse rounded-full bg-slate-400" />
            <span className="text-[9px] font-black tracking-[0.2em] text-slate-500 uppercase">
              {isHindi ? 'विशेषज्ञ विश्लेषण' : 'Expert Analysis'}
            </span>
          </div>
        </div>

        {/* ✨ Premium Intelligence Header Card with Emerald/Teal Theme */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-500" />
                </button>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-500 uppercase">
                      Expert Analysis
                    </span>
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">
                    {isHindi ? 'PYQ टॉपिक विश्लेषण' : 'PYQ Topic Analysis'}
                  </h1>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowStats(!showStats)}
                  className={cn(
                    'h-12 w-12 rounded-2xl border-slate-200 bg-white p-0 text-slate-600 transition-all hover:bg-slate-50 shadow-sm',
                    showStats && 'bg-amber-50 text-amber-600 border-amber-200'
                  )}
                >
                  <Target className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className={cn(
                    'h-12 flex-1 rounded-2xl border-slate-200 bg-white px-6 text-[11px] font-bold tracking-widest text-slate-600 uppercase transition-all shadow-sm sm:flex-none',
                    showFilters && 'bg-rose-50 text-rose-600 border-rose-200'
                  )}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  {isHindi ? 'फिल्टर' : 'Filters'}
                </Button>
              </div>
            </div>

            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-8 sm:grid-cols-4">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                      <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Dataset
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-900">
                        2020 - 2025
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                      <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Total PYQs
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-900">
                        {coverage.pyqQuestionCount}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                      <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Mapped
                      </p>
                      <p className="mt-1 text-xl font-black text-slate-900">
                        {coverage.mappedQuestionCount}
                      </p>
                    </div>
                    <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6">
                      <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Coverage
                      </p>
                      <p className="mt-1 text-xl font-black text-indigo-600">
                        {coverage.mappingCoveragePercent}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Selects */}
            {/* Selects */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-8 sm:grid-cols-2">
                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                      </div>
                      <Select
                        value={selectedSubject}
                        onValueChange={(val) => applyFilters(val, selectedYears)}
                      >
                        <SelectTrigger className="h-12 w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-10 font-bold text-slate-700 shadow-sm ring-offset-0 transition-all hover:border-indigo-200 hover:bg-white focus:ring-0">
                          <SelectValue placeholder={isHindi ? 'विषय चुनें' : 'Select Subject'} />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={5}
                          className="z-[100] w-[320px] max-w-[90vw] overflow-y-auto rounded-2xl border-slate-100 bg-white text-slate-700 shadow-2xl max-h-[280px] no-scrollbar"
                        >
                          {subjects.map((subject) => (
                            <SelectItem
                              key={subject.subject}
                              value={subject.subject}
                              className="cursor-pointer py-3 font-bold text-slate-600 focus:bg-indigo-50 focus:text-indigo-600"
                            >
                              {subject.subject} ({subject.topicCount}{' '}
                              {isHindi ? 'टॉपिक्स' : 'Topics'})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="relative">
                      <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                      <Select
                        value={selectedYears.toString()}
                        onValueChange={(val) => applyFilters(selectedSubject, Number(val))}
                      >
                        <SelectTrigger className="h-12 w-full rounded-2xl border-slate-100 bg-slate-50/50 pl-10 font-bold text-slate-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-white focus:ring-0">
                          <SelectValue placeholder={isHindi ? 'वर्ष चुनें' : 'Select Years'} />
                        </SelectTrigger>
                        <SelectContent
                          position="popper"
                          sideOffset={5}
                          className="z-[100] w-[320px] max-w-[90vw] overflow-y-auto rounded-2xl border-slate-100 bg-white text-slate-700 shadow-2xl max-h-[280px] no-scrollbar"
                        >
                          {YEAR_OPTIONS.map((years) => (
                            <SelectItem
                              key={years}
                              value={years.toString()}
                              className="cursor-pointer py-3 font-bold text-slate-600 focus:bg-emerald-50 focus:text-emerald-600"
                            >
                              {isHindi ? `पिछले ${years} वर्ष` : `Last ${years} Years`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Subject Selection Stats Banner */}
            {selectedSubject && (
              <div className="flex items-center gap-4 rounded-[2rem] border border-indigo-100 bg-indigo-50/30 p-5 px-8 transition-all hover:bg-indigo-50/50">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    {selectedSubject}
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  </h4>
                  <p className="text-[10px] font-black tracking-widest text-indigo-600/80 uppercase">
                    {totalQuestions} {isHindi ? 'कुल प्रश्न' : 'Total Questions Found'} •{' '}
                    {analysis.topicDistribution.length} {isHindi ? 'विषय' : 'Topics'}
                  </p>
                </div>
              </div>
            )}

        {/* Most Repeated Questions section temporarily hidden for now */}

        {/* Marketing-style Matrix Card (Synced with other sections) */}
        <div className="h-fit overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md transition-all hover:bg-white/90">
          <CardHeader
            className="relative z-10 cursor-pointer border-b border-slate-100 bg-slate-50/30 transition-colors select-none hover:bg-slate-50/50"
            onClick={() => toggleSection('matrix')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 flex items-center gap-2 text-[10px] font-black tracking-[0.3em] text-indigo-600 uppercase">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                  {isHindi ? 'कवरेज चेक' : 'Coverage Check'}
                </p>
                <CardTitle className="flex items-center gap-2 text-xl font-black text-slate-800">
                  {isHindi ? 'वर्ष-वार मैट्रिक्स' : 'Year-wise Matrix'}
                </CardTitle>
              </div>

              {expanded.matrix ? (
                <ChevronUp className="h-6 w-6 text-slate-400" />
              ) : (
                <ChevronDown className="h-6 w-6 text-slate-400" />
              )}
            </div>
          </CardHeader>
          <AnimatePresence>
            {expanded.matrix && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 bg-[#08081a]"
              >
                <CardContent className="space-y-3 p-8 sm:p-12">
                  <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                      Yearly Volume
                    </span>
                    <span className="text-[10px] font-black tracking-[0.3em] text-slate-500 uppercase">
                      Count
                    </span>
                  </div>
                  {analysis.yearMatrix.map((item, idx) => {
                    const gradients = [
                      'from-emerald-600 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
                      'from-amber-600 to-orange-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
                      'from-pink-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.3)]',
                      'from-red-600 to-rose-400 shadow-[0_0_12px_rgba(220,38,38,0.3)]',
                    ];
                    const gradient = gradients[idx % gradients.length];

                    return (
                      <div
                        key={item.year}
                        onClick={() =>
                          router.push(
                            `/syllabus/quiz/pyq/analysis/year/${item.year}?subject=${selectedSubject}`
                          )
                        }
                        className="group flex cursor-pointer flex-col gap-1.5 rounded-xl border-b border-white/[0.02] py-2.5 px-2 transition-all hover:bg-white/[0.02] last:border-0 active:scale-[0.99]"
                      >
                        <div className="flex items-center justify-between px-1">
                          <div className="text-[13px] font-black tracking-tight text-slate-500 transition-colors group-hover:text-white">
                            {item.year}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-[11px] font-black text-slate-500 transition-colors group-hover:text-slate-300">
                              {item.questionCount}
                              <span className="ml-0.5 text-[8px] font-black tracking-widest text-slate-600 uppercase">
                                Qs
                              </span>
                            </div>
                            <ChevronRight
                              className={cn(
                                'h-3.5 w-3.5 text-slate-700 transition-all group-hover:translate-x-0.5 group-hover:text-white',
                                idx === 0 && 'animate-pulse text-emerald-500'
                              )}
                            />
                          </div>
                        </div>

                        <div className="relative px-1">
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-900/40 shadow-inner">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.max(
                                  3,
                                  (item.questionCount /
                                    Math.max(
                                      ...analysis.yearMatrix.map((row) => row.questionCount),
                                      1
                                    )) *
                                    100
                                )}%`,
                              }}
                              transition={{ duration: 1.2, ease: 'easeOut' }}
                              className={cn(
                                'h-full rounded-full bg-gradient-to-r transition-all',
                                gradient
                              )}
                            />
                          </div>

                          {idx === 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: [0.4, 1, 0.4], y: [-2, 0, -2] }}
                              transition={{ repeat: Infinity, duration: 2.5 }}
                              className="absolute top-4 right-1 flex items-center gap-1 text-[7px] font-black tracking-widest text-emerald-400 uppercase"
                            >
                              <Hand className="h-2 w-2" />
                              <span>{isHindi ? 'टैप करें' : 'Click to see'}</span>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md">
          <CardHeader
            className="cursor-pointer border-b border-slate-100 bg-slate-50/30 transition-colors select-none hover:bg-slate-50/50"
            onClick={() => toggleSection('timeline')}
          >
            <CardTitle className="flex items-center justify-between text-lg font-black text-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-sm">
                  <CalendarDays className="h-5 w-5" />
                </div>
                {isHindi
                  ? 'टॉपिक अनुसार विश्लेषण — Recency'
                  : 'Topic-wise Timeline — Recency'}
              </div>
              {expanded.timeline ? (
                <ChevronUp className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              )}
            </CardTitle>
          </CardHeader>

          {expanded.timeline && (
            <div>
              {/* Mobile Card List for Timeline */}
              <div className="block divide-y divide-slate-100 sm:hidden">
                {analysis.topicYearBreakdown.slice(0, 20).map((row) => {
                  const totalForTopic = row.years.reduce((sum, y) => sum + y.questionCount, 0);
                  return (
                    <div key={row.topicId} className="space-y-4 bg-slate-50/30 p-6">
                      <div>
                        <h4 className="leading-tight font-black text-slate-800">
                          {isHindi ? row.topicTitle : row.topicTitleEn || row.topicTitle}
                        </h4>
                        <p className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                          {totalForTopic} {isHindi ? 'कुल प्रश्न' : 'Questions'}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {row.years.map((y, idx) => {
                          return (
                            <div
                              key={`${row.topicId}-${y.year}`}
                              className="flex min-w-[70px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm transition-all hover:border-indigo-200"
                            >
                              <span className="text-[9px] font-black text-slate-400 uppercase">
                                {y.year}
                              </span>
                              <span className="text-sm font-black text-indigo-600">
                                {y.questionCount} {isHindi ? 'प्र' : 'Q'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="hidden overflow-x-auto border-t border-slate-100 sm:block">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-slate-100 hover:bg-transparent">
                      <TableHead className="w-[30%] min-w-[200px] px-8 py-5 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                        {isHindi ? 'टॉपिक' : 'Topic'}
                      </TableHead>
                      <TableHead className="min-w-[400px] px-8 py-5 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                        {isHindi ? 'वर्ष अनुसार विश्लेषण' : 'Yearly Trend'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analysis.topicYearBreakdown.slice(0, 20).map((row) => {
                      const totalForTopic = row.years.reduce((sum, y) => sum + y.questionCount, 0);

                      return (
                        <TableRow
                          key={row.topicId}
                          className="border-slate-100 transition-colors hover:bg-slate-50/30"
                        >
                          <TableCell className="px-8 py-6 align-top">
                            <div className="font-black text-slate-700">
                              {isHindi ? row.topicTitle : row.topicTitleEn || row.topicTitle}
                            </div>
                            <div className="mt-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                              {totalForTopic} {isHindi ? 'कुल प्रश्न' : 'Questions'}
                            </div>
                          </TableCell>
                          <TableCell className="px-8 py-6 align-middle">
                            <div className="flex flex-wrap items-center gap-2.5">
                              {row.years.map((y, idx) => {
                                return (
                                  <div
                                    key={`${row.topicId}-${y.year}`}
                                    className="flex items-center gap-2 rounded-xl border border-slate-100 bg-white px-4 py-2.5 shadow-sm transition-all hover:border-indigo-200"
                                  >
                                    <span className="text-[10px] font-black text-slate-400 uppercase">
                                      {y.year}
                                    </span>
                                    <div className="h-3 w-[1px] bg-slate-100"></div>
                                    <span className="flex items-center gap-0.5 text-xs font-black text-indigo-600">
                                      {y.questionCount} {isHindi ? 'प्र' : 'Q'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-12">
          <div className="h-fit overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md lg:col-span-8">
            <CardHeader
              className="cursor-pointer border-b border-slate-100 bg-slate-50/30 transition-colors select-none hover:bg-slate-50/50"
              onClick={() => toggleSection('distribution')}
            >
              <CardTitle className="flex items-center justify-between text-lg font-black text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 shadow-sm">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  {isHindi ? 'टॉपिक वितरण — हाई वेटेज' : 'Topic Distribution — High Weightage'}
                </div>
                {expanded.distribution ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </CardTitle>
            </CardHeader>
            <AnimatePresence>
              {expanded.distribution && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div>
                    <CardContent className="p-0">
                      {/* Mobile Card List */}
                      <div className="block divide-y divide-slate-100 sm:hidden">
                        {analysis.topicDistribution.length > 0 ? (
                          analysis.topicDistribution.slice(0, topicLimit).map((item, idx) => (
                            <div
                              key={item.topicId}
                              onClick={() =>
                                router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)
                              }
                              className={cn(
                                'group cursor-pointer space-y-4 border-l-4 border-indigo-500/30 bg-white p-6 transition-all hover:bg-slate-50 active:scale-[0.98]'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <h4
                                  className={cn(
                                    'text-[15px] leading-tight font-black text-slate-700 group-hover:text-indigo-600'
                                  )}
                                >
                                  {isHindi ? item.topicTitle : item.topicTitleEn || item.topicTitle}
                                </h4>
                                <div className="flex shrink-0 items-center gap-2">
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      'border-none bg-indigo-50 font-bold text-indigo-600'
                                    )}
                                  >
                                    {item.trendDelta > 0
                                      ? `+${Math.round(item.trendDelta)} Qs`
                                      : `${Math.round(item.trendDelta)} Qs`}
                                  </Badge>
                                  <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase">
                                <span>
                                  {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                                </span>
                                <span>
                                  {item.overallWeightPercent.toFixed(1)}%{' '}
                                  {isHindi ? 'कुल वेटेज' : 'Overall Weight'}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  'h-2 w-full overflow-hidden rounded-full bg-slate-100'
                                )}
                              >
                                <div
                                  className={cn(
                                    'h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700'
                                  )}
                                  style={{ width: `${Math.min(item.overallWeightPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-12 text-center text-slate-400">
                            {isHindi
                              ? 'इस विषय के लिए कोई टॉपिक डेटा नहीं मिला।'
                              : 'No topic distribution data found for this subject.'}
                          </div>
                        )}
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden p-4 sm:block">
                        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white">
                          <Table>
                            <TableHeader className="bg-slate-50/50">
                              <TableRow className="border-slate-100 hover:bg-transparent">
                                <TableHead className="px-8 py-5 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'टॉपिक' : 'Topic'}
                                </TableHead>
                                <TableHead className="px-6 py-5 text-right text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'प्रश्न' : 'Questions'}
                                </TableHead>
                                <TableHead className="px-6 py-5 text-right text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'वेट %' : 'Weight %'}
                                </TableHead>
                                <TableHead className="px-8 py-5 text-right text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                  {isHindi ? 'ट्रेंड' : 'Trend'}
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {analysis.topicDistribution.slice(0, topicLimit).map((item, idx) => {
                                return (
                                  <TableRow
                                    key={item.topicId}
                                    onClick={() =>
                                      router.push(
                                        `/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`
                                      )
                                    }
                                    className={cn(
                                      'group cursor-pointer border-slate-100 transition-colors hover:bg-slate-50/50'
                                    )}
                                  >
                                    <TableCell
                                      className={cn(
                                        'px-8 py-6 font-black text-slate-700 group-hover:text-indigo-600'
                                      )}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span>
                                          {isHindi
                                            ? item.topicTitle
                                            : item.topicTitleEn || item.topicTitle}
                                        </span>
                                        <ChevronRight className="h-3 w-3 text-indigo-400 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-6 text-right font-black text-slate-500 group-hover:text-slate-800">
                                      {item.totalQuestions}
                                    </TableCell>
                                    <TableCell className="px-6 py-6 text-right">
                                      <div className="flex items-center justify-end gap-3">
                                        <span className="w-12 text-sm font-black text-slate-600 group-hover:text-indigo-600">
                                          {item.overallWeightPercent.toFixed(1)}%
                                        </span>
                                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                          <div
                                            className={cn(
                                              'h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 shadow-[0_0_10px_rgba(99,102,241,0.2)] transition-all duration-700'
                                            )}
                                            style={{
                                              width: `${Math.min(item.overallWeightPercent, 100)}%`,
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="px-8 py-6 text-right">
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          'border-none bg-indigo-50 font-black text-indigo-600'
                                        )}
                                      >
                                        {item.trendDelta > 0
                                          ? `+${Math.round(item.trendDelta)} Qs`
                                          : `${Math.round(item.trendDelta)} Qs`}
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    </CardContent>
                    {analysis.topicDistribution.length > 10 && (
                      <div className="flex justify-center border-t border-white/5 bg-white/5 p-4 backdrop-blur-sm">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setTopicLimit((prev) =>
                              prev >= analysis.topicDistribution.length ? 10 : prev + 20
                            )
                          }
                          className="flex items-center gap-1 text-xs font-black tracking-wider text-emerald-500 uppercase transition-all hover:bg-emerald-500/10 hover:text-emerald-400 active:scale-95"
                        >
                          {topicLimit >= analysis.topicDistribution.length
                            ? isHindi
                              ? 'कम दिखाएं'
                              : 'Show Less'
                            : isHindi
                              ? 'और देखें'
                              : 'View More'}
                          <ChevronDown
                            className={cn(
                              'ml-1 h-4 w-4 transition-transform duration-300',
                              topicLimit >= analysis.topicDistribution.length && 'rotate-180'
                            )}
                          />
                        </Button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="h-fit overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/70 shadow-sm backdrop-blur-md lg:col-span-4">
            <CardHeader
              className="cursor-pointer border-b border-slate-100 bg-slate-50/30 transition-colors select-none hover:bg-slate-50/50"
              onClick={() => toggleSection('rising')}
            >
              <CardTitle className="flex items-center justify-between text-lg font-black text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 shadow-sm">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  {isHindi ? 'उभरते टॉपिक — Hot Trends' : 'Rising Topics — Hot Trends'}
                </div>
                {expanded.rising ? (
                  <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
              </CardTitle>
            </CardHeader>
            <AnimatePresence>
              {expanded.rising && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div>
                    <CardContent className="space-y-4 p-8 sm:p-10">
                      {analysis.risingTopics.length > 0 ? (
                        analysis.risingTopics.map((item, idx) => {
                          return (
                            <div
                              key={item.topicId}
                              onClick={() =>
                                router.push(`/syllabus/quiz/pyq/analysis/topic/${item.topicSlug}`)
                              }
                              className={cn(
                                'group relative cursor-pointer space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:border-amber-200 hover:bg-amber-50/30 active:scale-[0.98]'
                              )}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className={cn(
                                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-[11px] font-black text-slate-400 group-hover:bg-amber-100 group-hover:text-amber-600'
                                    )}
                                  >
                                    #{idx + 1}
                                  </div>
                                  <h4 className="text-base leading-tight font-black text-slate-700 transition-colors group-hover:text-amber-600">
                                    {isHindi
                                      ? item.topicTitle
                                      : item.topicTitleEn || item.topicTitle}
                                  </h4>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="shrink-0 rounded-lg border-amber-100 bg-amber-50 px-2 py-0.5 font-black text-amber-600"
                                >
                                  +{Math.round(item.trendDelta)} {isHindi ? 'अधिक' : 'more'}
                                </Badge>
                              </div>

                              <div className="flex items-center justify-between px-1 text-[11px] font-black tracking-widest text-slate-400 uppercase">
                                <span>
                                  {item.totalQuestions} {isHindi ? 'प्रश्न' : 'Questions'}
                                </span>
                                <span className="text-emerald-600 font-bold">
                                  {item.latestWeightPercent.toFixed(1)}%{' '}
                                  {isHindi ? 'लेटेस्ट हिस्सा' : 'Latest Share'}
                                </span>
                              </div>

                              <div className="flex items-center justify-between border-t border-slate-100 pt-4 transition-colors group-hover:border-rose-100">
                                <span className="flex items-center gap-1.5 text-[10px] font-black tracking-widest text-slate-400 uppercase group-hover:text-emerald-600">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  {isHindi ? 'प्रमाण देखें' : 'View Proof'}
                                </span>
                                <ChevronRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
                              </div>

                              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={cn(
                                    'h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 shadow-[0_0_10px_rgba(245,158,11,0.2)] transition-all duration-1000 ease-out'
                                  )}
                                  style={{ width: `${Math.min(item.latestWeightPercent, 100)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="py-20 text-center text-slate-400">
                          {isHindi
                            ? 'कोई उभरते टॉपिक (Rising Trends) नहीं मिले।'
                            : 'No rising trends found for this subject.'}
                        </div>
                      )}
                    </CardContent>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
