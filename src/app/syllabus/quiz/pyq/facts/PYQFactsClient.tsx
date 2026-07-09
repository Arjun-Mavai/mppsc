'use client';

import { useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  BookOpenText,
  Brain,
  Lightbulb,
  BarChart3,
  Target,
  ArrowLeft,
  Filter,
  Layers,
  Calendar,
  Sparkles,
  Zap,
  ChevronRight,
  ShieldAlert,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  PyqFactItem,
  PyqInsightsCoverageSummary,
  PyqInsightSubjectItem,
  PyqInsightTopicItem,
} from '@/features/tests/actions/pyq-insights';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

interface PYQFactsClientProps {
  subjects: PyqInsightSubjectItem[];
  topics: PyqInsightTopicItem[];
  viewMode: 'subject' | 'year';
  selectedYear?: number;
  selectedSubject: string;
  selectedTopic?: string;
  limit: number;
  facts: PyqFactItem[];
  coverage: PyqInsightsCoverageSummary;
  yearOptions: number[];
}

const LIMIT_OPTIONS = [30, 50, 100, 200];

export default function PYQFactsClient({
  subjects,
  topics,
  selectedYear,
  selectedSubject,
  selectedTopic,
  limit,
  facts,
  coverage,
  yearOptions,
}: PYQFactsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [readFacts, setReadFacts] = useState<Set<string>>(new Set());

  const readCount = readFacts.size;

  const toggleFactRead = (id: string) => {
    setReadFacts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeTopic = useMemo(() => {
    if (selectedTopic && selectedTopic !== 'all') {
      return topics.find((t) => t.topicSlug === selectedTopic);
    }
    return undefined;
  }, [selectedTopic, topics]);

  const deepLearning = activeTopic?.aiContent;

  const searchParams = useSearchParams();
  const applyFilters = (subject: string, topic?: string, year?: number, nextLimit = limit) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete('page');
      if (subject) params.set('subject', subject);
      if (topic && topic !== 'all') params.set('topic', topic);
      else params.delete('topic');
      if (year !== undefined && year !== 0) params.set('year', String(year));
      else params.delete('year');
      params.set('limit', String(nextLimit));
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative min-h-screen bg-[#FAFBFD] pb-32 text-slate-900 selection:bg-rose-100">
      {/* Light Multi-Gradient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-50/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] h-[50%] w-[50%] rounded-full bg-rose-50/60 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[50%] w-[50%] rounded-full bg-amber-50/40 blur-[120px]" />
      </div>

      {/* Floating Progress Tracker (Retention Hook) */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2.5 rounded-full border border-slate-200/60 bg-white/80 px-4 py-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <BookOpenText size={12} />
        </div>
        <span className="text-[9px] font-black tracking-widest text-slate-600 uppercase whitespace-nowrap">
          {isHindi ? `पढ़े गए: ${readCount}/${facts.length}` : `Progress: ${readCount}/${facts.length}`}
        </span>
        <div className="h-1.5 w-14 overflow-hidden rounded-full bg-slate-100 sm:w-20">
          <motion.div 
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(readCount / Math.max(facts.length, 1)) * 100}%` }}
          />
        </div>
      </motion.div>

      <div className={cn(
        "relative z-10 mx-auto max-w-4xl px-3 pt-8 sm:px-6 sm:pt-14 transition-all duration-500",
        isPending && "blur-[1px] opacity-70 pointer-events-none"
      )}>
        {/* Elite Mobile-First Header */}
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-50 hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </button>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles size={11} className="text-rose-500" />
                <span className="text-[9px] font-black tracking-[0.2em] text-rose-500 uppercase">Expert Vault</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {isHindi ? 'फैक्ट लाइब्रेरी' : 'Facts Library'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowStats(!showStats)}
              className={cn(
                "h-11 w-11 rounded-2xl border-slate-200 bg-white p-0 text-slate-600 transition-all hover:bg-slate-55 shadow-sm",
                showStats && "bg-amber-50 text-amber-600 border-amber-200"
              )}
            >
              <Target className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-11 flex-1 rounded-2xl border-slate-200 bg-white px-5 text-[10px] font-black tracking-widest text-slate-600 uppercase transition-all sm:flex-none shadow-sm",
                showFilters && "bg-rose-50 text-rose-600 border-rose-200"
              )}
            >
              <Filter className="mr-2 h-4 w-4" />
              {isHindi ? 'फिल्टर' : 'Filters'}
            </Button>
            {/* NOTE: Temporarily hidden as per user request. Uncomment to re-enable Analysis feature.
            <Button
              variant="outline"
              onClick={() => router.push('/syllabus/quiz/pyq/analysis')}
              className="h-11 hidden sm:flex rounded-2xl border-slate-200 bg-white px-5 text-[10px] font-black tracking-widest text-slate-600 uppercase transition-all hover:bg-slate-55 shadow-sm"
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              {isHindi ? 'एनालिसिस' : 'Analysis'}
            </Button>
            */}
          </div>
        </div>

        {/* Coverage Intelligence Card - Collapsible */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: 'Dataset', val: `${coverage.fromYear}-${coverage.toYear}`, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: 'Total PYQ', val: coverage.pyqQuestionCount, icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: 'Confidence', val: `${coverage.mappingCoveragePercent}%`, icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
                  { label: 'Intelligence', val: topics.length, icon: Brain, color: 'text-rose-600', bg: 'bg-rose-50' },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className={cn("flex h-7 w-7 items-center justify-center rounded-lg mb-1", stat.bg)}>
                      <stat.icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">{stat.label}</span>
                    <span className="text-sm font-black text-slate-900">{stat.val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reverted Animated Filters Tray */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-6 sm:mb-8 overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-4 rounded-3xl border border-slate-200 bg-white/80 p-4 backdrop-blur-xl sm:grid-cols-3 shadow-lg">
                <div className="space-y-1.5">
                  <span className="ml-1 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">Subject</span>
                  <Select value={selectedSubject} onValueChange={(val) => applyFilters(val, undefined, selectedYear)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="w-[320px] max-w-[90vw] rounded-2xl border-slate-200 bg-white text-slate-700 max-h-[280px] overflow-auto no-scrollbar shadow-2xl z-[100]">
                      {subjects.filter((s) => s.factCount > 0).map((s) => (
                        <SelectItem key={s.subject} value={s.subject} className="rounded-xl focus:bg-rose-50 focus:text-rose-600 py-3">
                          {s.subject} ({s.factCount})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <span className="ml-1 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">Topic</span>
                  <Select value={selectedTopic || 'all'} onValueChange={(val) => applyFilters(selectedSubject, val === 'all' ? undefined : val, selectedYear)}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="w-[320px] max-w-[90vw] rounded-2xl border-slate-200 bg-white text-slate-700 max-h-[280px] overflow-auto no-scrollbar shadow-2xl z-[100]">
                      <SelectItem value="all" className="rounded-xl py-3">All Topics</SelectItem>
                      {topics.map((t) => (
                        <SelectItem key={t.topicSlug} value={t.topicSlug} className="rounded-xl focus:bg-rose-50 focus:text-rose-600 py-3">
                          {isHindi ? t.topicTitle : t.topicTitleEn || t.topicTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <span className="ml-1 text-[9px] font-black tracking-[0.2em] text-slate-400 uppercase">Year</span>
                  <Select value={selectedYear ? String(selectedYear) : 'all'} onValueChange={(val) => applyFilters(selectedSubject, selectedTopic, val === 'all' ? 0 : Number(val))}>
                    <SelectTrigger className="h-11 rounded-xl border-slate-100 bg-slate-50 font-bold text-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" sideOffset={5} className="w-[320px] max-w-[90vw] rounded-2xl border-slate-200 bg-white text-slate-700 max-h-[280px] overflow-auto no-scrollbar shadow-2xl z-[100]">
                      <SelectItem value="all" className="rounded-xl py-3">All Years</SelectItem>
                      {yearOptions.map((y) => (
                        <SelectItem key={y} value={String(y)} className="rounded-xl focus:bg-rose-50 focus:text-rose-600">
                          {y} Exam
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Deep Learning Insights - Google Clean Look */}
        {deepLearning && (
          <div className="animate-in fade-in slide-in-from-bottom-4 mb-10 space-y-6 duration-700">
            <div className="flex items-center gap-3 px-1">
              <Sparkles size={13} className="text-indigo-500" />
              <h3 className="text-[9px] font-black tracking-[0.3em] text-slate-400 uppercase">Topic Insight</h3>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <div className="grid gap-4 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] bg-indigo-50 border border-indigo-100 px-6 py-8 transition-all hover:bg-indigo-100/50 sm:p-10 lg:p-12">
                  <h4 className="mb-4 flex items-center gap-2 text-[9px] font-black tracking-widest text-indigo-600 uppercase">
                    <Target className="h-3.5 w-3.5" /> Concept Summary
                  </h4>
                  <div className="space-y-4 text-[16px] leading-[1.7] font-semibold text-slate-800 sm:text-[18px]">
                    {(isHindi ? deepLearning.concept_capsule : deepLearning.concept_capsule_en || deepLearning.concept_capsule)
                      ?.split(/\n+/)
                      .filter(p => p.trim().length > 5)
                      .map((point, i) => (
                        <div key={i} className="flex items-start gap-3.5">
                          <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
                          <p className="[text-wrap:pretty]">{point.trim()}</p>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 lg:col-span-5">
                <div className="rounded-[1.25rem] sm:rounded-[2rem] bg-emerald-50 p-5 sm:p-7">
                  <h4 className="mb-4 flex items-center gap-2 text-[9px] font-black tracking-widest text-emerald-600 uppercase">
                    <Zap className="h-3.5 w-3.5 fill-emerald-600" /> Core Questions
                  </h4>
                  <div className="space-y-2.5">
                    {(isHindi ? deepLearning.practice_prompts : deepLearning.practice_prompts_en || deepLearning.practice_prompts)?.map((prompt, i) => (
                      <div key={i} className="rounded-xl bg-white/60 p-3.5 text-[12px] font-bold text-slate-700 leading-relaxed shadow-sm transition-all hover:bg-white">
                        <span className="mr-1.5 text-emerald-500">Q.</span>
                        {prompt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Facts Feed - Neural Bento Grid */}
        <div className="grid grid-cols-1 gap-6">
          {facts.map((fact, idx) => {
            const years = Array.from(new Set(fact.enrichedRefs?.map(r => r.year) || fact.pyqRefs?.map(r => r.year) || [])).sort((a, b) => (b ?? 0) - (a ?? 0));
            const cardColors = [
              'bg-[#f0fdfa] border-[#ccfbf1] text-[#0f766e]',
              'bg-[#fdf2f8] border-[#fce7f3] text-[#be185d]',
              'bg-[#ecfdf5] border-[#d1fae5] text-[#047857]',
              'bg-[#fffbeb] border-[#fef3c7] text-[#b45309]',
              'bg-[#f5f3ff] border-[#ede9fe] text-[#6d28d9]',
            ];
            const colorIndex = idx % cardColors.length;
            const bgClass = cardColors[colorIndex].split(' ')[0];
            const borderClass = cardColors[colorIndex].split(' ')[1];
            
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                key={fact.id}
                className={cn(
                  "group relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] px-5 py-6 border transition-all hover:shadow-xl sm:p-8 lg:p-10",
                  bgClass,
                  borderClass
                )}
              >
                <div className="relative z-10 space-y-5">
                  {/* Metadata Hierarchy */}
                  <div className="flex wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-full bg-white/95 px-3 py-1.5 text-[8px] font-black tracking-[0.2em] uppercase shadow-sm">
                        {isHindi ? fact.topicTitle : fact.topicTitleEn || fact.topicTitle}
                      </div>
                      {years.map(y => (
                        <div key={y} className="flex items-center gap-1 rounded-full bg-white/70 px-3 py-1.5 text-[8px] font-black shadow-sm opacity-90">
                          <Calendar size={9} className="opacity-40" />
                          {y} Exam
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Core Fact Content - Optimized Rhythm */}
                  <div className="space-y-4">
                    <h3 className="text-[9px] font-black tracking-[0.6em] opacity-25 uppercase text-slate-600">Fact Insight</h3>
                    <p className="text-[18px] leading-[1.6] font-black tracking-tight text-slate-800 sm:text-[22px] lg:text-[24px] [text-wrap:pretty]">
                      {isHindi ? fact.factText : fact.factTextEn || fact.factText}
                    </p>
                  </div>

                  {/* Memory & Trap Panels - Rhythmic Balance */}
                  <div className="grid gap-4 pt-2 sm:grid-cols-2">
                    {fact.memoryTip && (
                      <div className="rounded-2xl bg-white/50 p-5 shadow-sm transition-all hover:bg-white/80">
                        <h5 className="mb-3 flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] uppercase opacity-40">
                          <Lightbulb className="h-4 w-4" /> Learning Key
                        </h5>
                        <p className="text-[13px] leading-[1.6] font-semibold text-slate-600 tracking-tight">
                          {isHindi ? fact.memoryTip : fact.memoryTipEn || fact.memoryTip}
                        </p>
                      </div>
                    )}
                    {fact.scamAlert && (
                      <div className="rounded-2xl bg-rose-50/70 p-5 shadow-sm transition-all hover:bg-rose-50/90">
                        <h5 className="mb-3 flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-rose-600 uppercase">
                          <ShieldAlert className="h-4 w-4" /> Exam Trap
                        </h5>
                        <p className="text-[13px] leading-[1.6] font-semibold text-rose-900 tracking-tight">
                          {isHindi ? fact.scamAlert : fact.scamAlertEn || fact.scamAlert}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Mastered Interaction */}
                  <div className="flex items-center justify-between border-t border-slate-200/50 pt-5">
                     <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastery Focus</span>
                     </div>
                    <button 
                      onClick={() => toggleFactRead(fact.id)}
                      className={cn(
                        "group flex items-center gap-2 rounded-xl px-5 py-3 text-[11px] font-black tracking-widest uppercase transition-all shadow-md",
                        readFacts.has(fact.id)
                          ? "bg-emerald-500 text-white shadow-emerald-100"
                          : "bg-white text-slate-900 hover:bg-slate-900 hover:text-white"
                      )}
                    >
                      {readFacts.has(fact.id) ? (
                        <>Mastered <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check className="h-4 w-4" /></motion.div></>
                      ) : (
                        <>Got it <motion.div animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 2 }}><ChevronRight className="h-4 w-4" /></motion.div></>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
