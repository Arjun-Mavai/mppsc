'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BrainCircuit, Trophy, Lightbulb, ShieldAlert, Repeat, Lock, Clock, Target, Plus, Minus,
  TrendingDown, ChevronRight, Zap, Landmark, Map, Compass, PieChart, FlaskConical,
  Languages, Globe, BookOpen, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { calculateMPPSCResult, SmartResultResponse } from '@/features/tests/actions/test-result';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { QuizHeader } from './quiz/QuizHeader';
import { ConnectSocials } from '@/components/ConnectSocials';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface SmartQuizResultProps {
  testId?: string;
  userId?: string;
  title?: string;
  onRetry?: () => void;
  onExit?: () => void;
  initialResult?: SmartResultResponse;
  isGuest?: boolean;
}

const PremiumLock = ({ label, onUnlock }: { label: string; onUnlock: () => void }) => (
  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg border border-slate-100 bg-white/60 backdrop-blur-[2px]">
    <div className="max-w-[200px] rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-xl">
      <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
        <Lock className="h-5 w-5 text-amber-600" />
      </div>
      <p className="mb-2 text-sm font-bold text-slate-800">{label}</p>
      <Button
        size="sm"
        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 font-bold text-white hover:from-amber-600 hover:to-orange-600"
        onClick={onUnlock}
      >
        Unlock Now
      </Button>
    </div>
  </div>
);

export function SmartQuizResult({
  testId,
  userId,
  title,
  onRetry,
  onExit,
  initialResult,
  isGuest = false,
}: SmartQuizResultProps) {
  const router = useRouter();
  const [result, setResult] = useState<SmartResultResponse | null>(initialResult || null);
  const [loading, setLoading] = useState(!initialResult);
  const { language, setLanguage } = useSettingsStore();
  const isHi = language === 'hi';

  useEffect(() => {
    async function fetchResult() {
      if (!testId || initialResult) return;
      try {
        const res = await calculateMPPSCResult(testId);
        if ('error' in res) {
          console.error(res.error);
        } else {
          setResult(res as SmartResultResponse);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchResult();
  }, [testId, initialResult]);

  const handleUnlock = () => {
    router.push('/pricing');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <h2 className="text-xl font-semibold text-slate-800">Analyzing Performance...</h2>
          <p className="text-slate-500">Calculating negative marking impact & topic trends</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return <div className="p-8 text-center">Failed to load results. Please try again.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      <div className="pt-6">
        <div className="mx-auto max-w-3xl px-4">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100 shadow-sm">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-black tracking-tight text-slate-900 leading-tight">
                  {title || (isHi ? 'क्विज़ रिजल्ट' : 'Quiz Result')}
                </h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Performance Intelligence Analysis
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
                <ConnectSocials minimal className="flex-1 sm:flex-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-3xl space-y-6 p-4">
        {/* Score Card */}
        <Card className="relative overflow-hidden border-none bg-white shadow-md">
          <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
          <CardContent className="p-6">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                <Target className="h-3 w-3 text-amber-500" />
                Expert Verified Result
              </div>
              <div className="text-[10px] font-black tracking-widest text-slate-500 uppercase">
                ({result.total_questions || result.detailed_analysis?.length || 0} Qns)
              </div>
            </div>

            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-slate-500">Net Score (Official Pattern)</p>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{result.net_score}</h2>
                  <span className="text-xl font-bold text-slate-400">/ {result.max_score}</span>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                   <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-black tracking-widest text-emerald-600 uppercase border border-emerald-500/10">
                      <Plus className="h-2 w-2" /> 3 Correct
                   </div>
                   <div className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[9px] font-black tracking-widest text-rose-600 uppercase border border-rose-500/10">
                      <Minus className="h-2 w-2" /> 1 Penalty
                   </div>
                </div>

                {result.qualification && (
                   <div className={cn(
                     "mt-4 inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-black shadow-sm border",
                     result.net_score >= (result.max_score * 0.78)
                       ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                       : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                   )}>
                     {result.net_score >= (result.max_score * 0.78) ? (
                       <><Trophy className="mr-1.5 h-3.5 w-3.5" /> QUALIFIED</>
                     ) : (
                       <><TrendingDown className="mr-1.5 h-3.5 w-3.5" /> NEEDS PUSH</>
                     )}
                     <span className="ml-2 opacity-60 font-medium">Target: {Math.round(result.max_score * 0.78)}</span>
                   </div>
                )}
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center sm:items-end">
                    <div className={`text-2xl font-black ${getGradeColor(result.attempt_intelligence.strategy_grade)}`}>
                      Grade {result.attempt_intelligence.strategy_grade}
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Strategic Audit</p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-100 hidden sm:block" />
                  <div className="flex flex-col items-center sm:items-end">
                    <div className="text-2xl font-black text-amber-500">
                      {result.detailed_analysis?.reduce((acc: number, curr: any) => acc + (curr.timeTakenSeconds || 0), 0) > 0 
                        ? `${Math.floor(result.detailed_analysis.reduce((acc: number, curr: any) => acc + (curr.timeTakenSeconds || 0), 0) / 60)}m ${result.detailed_analysis.reduce((acc: number, curr: any) => acc + (curr.timeTakenSeconds || 0), 0) % 60}s`
                        : '0m 0s'}
                    </div>
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Total Time</p>
                  </div>
                </div>
              </div>
            </div>

            {/* EXPERT CUTOFF VISUALIZATION */}
            <div className="mb-6">
              <div className="flex justify-between text-[10px] font-black tracking-widest text-slate-400 uppercase mb-2">
                <span>Score Scale</span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                   <div className="flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-indigo-400 uppercase border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                      <Zap className="h-3 w-3 fill-indigo-400" /> Elite: {Math.round(result.max_score * 0.76)}-{Math.round(result.max_score * 0.80)}
                   </div>
                   <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-[10px] font-black tracking-widest text-amber-400 uppercase border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                      <Target className="h-3 w-3" /> Breakeven: {Math.round(result.max_score * 0.78)}
                   </div>
                </div>
              </div>
              
              <div className="relative flex h-3 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                {/* Elite Zone Shading */}
                <div 
                  className="absolute top-0 bottom-0 z-0 bg-indigo-500/10 border-x border-indigo-200/20"
                  style={{ 
                    left: `${76}%`, 
                    width: `${4}%` 
                  }}
                />
                
                {/* Score Fill */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((result.net_score / result.max_score) * 100, 100)}%` }}
                  className="relative z-10 h-full bg-emerald-500"
                />
                
                {/* Cutoff Tick */}
                <div
                  className="absolute top-0 bottom-0 z-20 w-1 bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                  style={{ left: `${78}%` }}
                />
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-center transition-all hover:bg-emerald-50">
                <div className="text-2xl font-black text-emerald-700">{result.correct}</div>
                <div className="text-[10px] font-black tracking-widest text-emerald-600 uppercase">Correct (+3)</div>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-center transition-all hover:bg-rose-50">
                <div className="text-2xl font-black text-rose-700">{result.wrong}</div>
                <div className="text-[10px] font-black tracking-widest text-rose-600 uppercase">Penalty (-1)</div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-center transition-all hover:bg-slate-50">
                <div className="text-2xl font-black text-slate-700">{result.skipped}</div>
                <div className="text-[10px] font-black tracking-widest text-slate-600 uppercase">Skipped</div>
              </div>
            </div>

            {/* Attempt Intelligence */}
            <div className="relative overflow-hidden rounded-lg border border-amber-100 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <BrainCircuit className="mt-1 h-5 w-5 flex-shrink-0 text-amber-600" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">Smart Strategic Audit</h3>
                  <p className="mt-1 text-xs leading-relaxed text-amber-800">
                    Your "Smart Intelligence" score shows a loss of{' '}
                    <span className="font-bold">
                      {result.attempt_intelligence.wasted_points} marks
                    </span>{' '}
                    due to negative marking. If those had been skipped, your net score
                    would have reached{' '}
                    <span className="font-bold">
                      {result.attempt_intelligence.could_have_scored}
                    </span>
                    .
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for detailed view */}
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="mb-4 grid w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
            <TabsTrigger value="insights" className="rounded-lg text-[10px] font-black tracking-widest uppercase transition-all data-[state=active]:bg-indigo-500 data-[state=active]:text-white text-slate-500">{isHi ? 'स्मार्ट ऑडिट' : 'Smart Audit'}</TabsTrigger>
            <TabsTrigger value="review" className="rounded-lg text-[10px] font-black tracking-widest uppercase transition-all data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-500">{isHi ? 'समीक्षा' : 'Review'}</TabsTrigger>
            <TabsTrigger value="facts" className="rounded-lg text-[10px] font-black tracking-widest uppercase transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-white text-slate-500">{isHi ? 'फ्लैशकार्ड' : 'Flashcards'}</TabsTrigger>
          </TabsList>

          {/* ANALYSIS TAB */}
          <TabsContent value="insights" className="relative space-y-4">
            {isGuest && <PremiumLock label="Detailed Analysis Locked" onUnlock={handleUnlock} />}
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
                {isHi ? 'विषयवार प्रदर्शन' : 'Strategic Subject Audit'}
              </h3>
              <Badge variant="outline" className="text-[10px] font-bold border-slate-200 text-slate-400">
                PRO INSIGHTS ACTIVE
              </Badge>
            </div>

            <Card className="overflow-hidden border-slate-200 shadow-sm">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-10 text-[10px] font-black tracking-widest text-slate-400 uppercase">{isHi ? 'विषय' : 'Topic'}</TableHead>
                    <TableHead className="h-10 text-center text-[10px] font-black tracking-widest text-slate-400 uppercase">{isHi ? 'प्रयास' : 'Stats'}</TableHead>
                    <TableHead className="h-10 text-right text-[10px] font-black tracking-widest text-slate-400 uppercase">{isHi ? 'अंक (Net)' : 'Net Marks'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.subject_breakdown.map((sub) => (
                    <TableRow key={sub.subject} className="group transition-colors hover:bg-slate-50/50">
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-xl border bg-white shadow-sm transition-transform group-hover:scale-110",
                            getSubjectColor(sub.subject)
                          )}>
                            {getSubjectIcon(sub.subject)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{sub.subject}</div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                                <div 
                                  className="h-full bg-indigo-500 transition-all duration-1000" 
                                  style={{ width: `${(sub.correct / sub.total) * 100}%` }} 
                                />
                              </div>
                              <span className="text-[10px] font-black text-slate-400">
                                {Math.round((sub.correct / sub.total) * 100)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-xs font-bold text-emerald-600">+{sub.correct}</span>
                          <span className="text-[10px] text-slate-300">/</span>
                          <span className="text-xs font-bold text-rose-500">-{sub.wrong}</span>
                        </div>
                        <div className="text-[9px] font-medium text-slate-400 mt-0.5">
                          {sub.total} Total
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className={cn(
                          "text-base font-black tracking-tight",
                          sub.score > 0 ? "text-slate-900" : "text-rose-600"
                        )}>
                          {sub.score > 0 ? `+${sub.score}` : sub.score}
                        </div>
                        <Badge variant="secondary" className="mt-1 h-5 rounded-md px-1.5 text-[9px] font-bold">
                          {sub.correct / sub.total > 0.7 ? (isHi ? 'मजबूत' : 'High') : (isHi ? 'सुधारें' : 'Check')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50/30 p-4">
               <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                  </div>
                  <p className="text-xs leading-relaxed text-indigo-900 font-medium">
                    {isHi 
                      ? "यह Smart Audit आपके प्रयासों का सटीक डेटा है। लाल रंग के अंक नेगेटिव मार्किंग के प्रभाव को दर्शाते हैं।"
                      : "This strategic audit identifies precisely where you lost marks to negative marking. High accuracy in certain topics indicates strong core concepts."
                    }
                  </p>
               </div>
            </div>
          </TabsContent>

          {/* REVIEW TAB (All Questions) */}
          <TabsContent value="review" className="relative min-h-[200px] space-y-4">
            {result.detailed_analysis?.map((q: any, idx: number) => {
              const isLocked = isGuest && q.status !== 'correct';
              return (
                <Card
                  key={idx}
                  className={`border-l-4 shadow-sm ${
                    q.status === 'correct'
                      ? 'border-l-green-500'
                      : q.status === 'wrong'
                        ? 'border-l-red-500'
                        : 'border-l-slate-300'
                  } relative overflow-hidden`}
                >
                  {/* Lock Overlay for Guest on Wrong/Skipped */}
                  {isLocked && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/10 backdrop-blur-[4px]">
                      <div className="rounded-xl border border-slate-100 bg-white p-3 text-center shadow-lg">
                        <div className="mx-auto mb-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-50">
                          <Lock className="h-4 w-4 text-amber-600" />
                        </div>
                        <p className="mb-1 text-xs font-bold text-slate-800">Unlock Solution</p>
                        <Button
                          size="sm"
                          className="h-7 bg-amber-500 text-xs text-white hover:bg-amber-600"
                          onClick={handleUnlock}
                        >
                          Upgrade
                        </Button>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <Badge variant="outline" className="text-xs">
                        {q.subject || 'General'}
                      </Badge>
                      <Badge
                        variant={
                          q.status === 'correct'
                            ? 'default'
                            : q.status === 'wrong'
                              ? 'destructive'
                              : 'secondary'
                        }
                        className="text-[10px] uppercase"
                      >
                        {q.status}
                      </Badge>
                    </div>

                    <p className="mb-3 text-sm font-medium text-slate-800">
                      <span className="mr-2 text-slate-400">Q{idx + 1}.</span>
                      {q.questionText || q.question || 'Question Text'}
                      {q.timeTakenSeconds !== undefined && q.timeTakenSeconds !== null && (
                        <span className="ml-2 inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/50 px-2 py-0.5 text-[10px] font-black tracking-tight text-indigo-600 shadow-sm ring-1 ring-indigo-100/50">
                          <Clock className="h-2.5 w-2.5" />
                          {q.timeTakenSeconds}s
                        </span>
                      )}
                    </p>

                    <div className="space-y-1 rounded bg-slate-50 p-3 text-xs text-slate-600">
                      <p className={q.status === 'correct' ? 'font-bold text-green-700' : ''}>
                        <span className="font-semibold text-slate-500">Your Answer:</span>{' '}
                        {q.userAnswer ?? 'Skipped'}
                      </p>
                      {!isLocked && (
                        <p>
                          <span className="font-semibold text-slate-500">Correct Answer:</span>{' '}
                          {q.correctAnswer}
                        </p>
                      )}
                    </div>

                    {!isLocked && (
                      <div className="mt-4">
                        <StructuredExplanation
                          extendedData={q.extendedData}
                          plainExplanation={q.explanation}
                          explanationEn={q.explanationEn}
                          explanationHi={q.explanation_hi}
                          language={language as 'hi' | 'en'}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="facts" className="relative min-h-[200px] space-y-4">
            {isGuest && <PremiumLock label="Flashcards Locked" onUnlock={handleUnlock} />}
            {result.pyq_facts.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
                  <Lightbulb size={32} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                   {isHi ? 'कोई फ्लैशकार्ड नहीं मिला' : 'No Flashcards Found'}
                </h3>
                <p className="text-sm text-slate-500">
                  {isHi 
                    ? 'अपनी गलतियों को सुधारने के लिए और अधिक अभ्यास करें।' 
                    : 'Practice more and analyze mistakes to unlock high-yield facts.'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {result.pyq_facts.map((fact: any) => (
                  <div
                    key={fact.id}
                    className="group relative overflow-hidden rounded-[2rem] border-b-4 border-amber-500/20 bg-white p-6 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
                  >
                    <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 opacity-20" />
                    
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                         <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                            <Zap className="h-4 w-4 fill-amber-600" />
                         </div>
                         <span className="text-[10px] font-black tracking-widest text-amber-600 uppercase">
                           {fact.subject}
                         </span>
                      </div>
                      {fact.importanceScore > 8 && (
                        <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[9px] font-black tracking-widest text-rose-600 uppercase border border-rose-100 shadow-sm animate-pulse">
                          <Trophy className="h-3 w-3" /> High Yield
                        </div>
                      )}
                    </div>

                    <p className="mb-6 text-sm leading-relaxed font-bold text-slate-800 md:text-base">
                      {isHi && fact.factText ? fact.factText : fact.factTextEn || fact.factText}
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                       {(fact.memoryTip || fact.memoryTipEn) && (
                         <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 transition-colors hover:bg-blue-50">
                            <div className="mb-2 flex items-center gap-2 text-blue-800">
                              <Lightbulb className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Memory Tip</span>
                            </div>
                            <p className="text-xs font-medium leading-relaxed text-blue-700">
                              {isHi && fact.memoryTip
                                ? fact.memoryTip
                                : fact.memoryTipEn || fact.memoryTip}
                            </p>
                         </div>
                       )}

                       {(fact.scamAlert || fact.scamAlertEn) && (
                         <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 transition-colors hover:bg-rose-50">
                            <div className="mb-2 flex items-center gap-2 text-rose-800">
                              <ShieldAlert className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase tracking-widest">Scam Alert</span>
                            </div>
                            <p className="text-xs font-medium leading-relaxed text-rose-700">
                              {isHi && fact.scamAlert
                                ? fact.scamAlert
                                : fact.scamAlertEn || fact.scamAlert}
                            </p>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 z-20 flex w-full gap-3 border-t bg-white p-4 shadow-lg">
        <Button variant="outline" className="flex-1" onClick={onRetry}>
          <Repeat className="mr-2 h-4 w-4" /> Retry
        </Button>
        <Button className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={onExit}>
          Finish Analysis
        </Button>
      </div>
    </div>
  );
}

function getGradeColor(grade: string) {
  switch (grade) {
    case 'A':
      return 'text-green-600';
    case 'B':
      return 'text-blue-600';
    case 'C':
      return 'text-amber-600';
    default:
      return 'text-red-600';
  }
}

function getSubjectIcon(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes('history') || s.includes('itihar')) return <Landmark className="h-4 w-4" />;
  if (s.includes('geography') || s.includes('bhugol')) return <Map className="h-4 w-4" />;
  if (s.includes('polity') || s.includes('rajniti')) return <Compass className="h-4 w-4" />;
  if (s.includes('economy') || s.includes('arthshastra')) return <PieChart className="h-4 w-4" />;
  if (s.includes('science') || s.includes('vigyan')) return <FlaskConical className="h-4 w-4" />;
  if (s.includes('hindi') || s.includes('english')) return <Languages className="h-4 w-4" />;
  if (s.includes('mp') || s.includes('madhya')) return <Globe className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
}

function getSubjectColor(subject: string) {
  const s = subject.toLowerCase();
  if (s.includes('history')) return 'border-amber-100 text-amber-600';
  if (s.includes('geography')) return 'border-emerald-100 text-emerald-600';
  if (s.includes('polity')) return 'border-blue-100 text-blue-600';
  if (s.includes('economy')) return 'border-indigo-100 text-indigo-600';
  return 'border-slate-100 text-slate-600';
}
