'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConnectSocials } from '@/components/ConnectSocials';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Quote,
  Filter,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Lightbulb,
  AlertTriangle,
  Zap,
  BookOpen,
  ArrowRight,
  Target,
  Trophy,
  Lock,
  Clock,
  ChevronRight,
  ShieldAlert,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/quiz';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import { SCORING_CONFIG } from '@/lib/quiz-scoring';
import { getTestLeaderboard } from '@/actions/leaderboard-actions';
import { revalidateAnalyticsAction } from '@/features/analytics/actions';
import { LoadingQuotes } from '@/components/ui/LoadingQuotes';
import { getRandomFeedback } from '../constants/feedback';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  FormattedQuestionText,
  RenderTableQuestion,
  cleanMatchingQuestionText,
} from '@/features/tests/utils/questionFormatter';
import { logger } from '@/lib/logger';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  getPYQIntelligenceForWrongQuestions,
  type PYQWrongTopicInsight,
} from '@/actions/pyq-intelligence';
import { QuizHeader } from './quiz/QuizHeader';
import { calculateMPPSCResult, getHighYieldFactsForQuestions } from '@/features/tests/actions/test-result';
import { submitTestFeedback, hasUserSubmittedFeedback } from '@/app/actions/feedback';
import { TestSeriesFeedbackModal } from '@/components/test-series-feedback-modal';
import type { FeedbackFormType, FeedbackResponse } from '@/lib/schemas/feedback';

interface LeaderboardEntry {
  id: string;
  testId: string;
  userId: string | null;
  displayName: string;
  score: number;
  percentage: number | null;
  timeTakenSeconds: number | null;
  rank: number | null;
  isFake?: number | null;
  createdAt?: Date | null;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  userRank: number | null;
  userEntry: LeaderboardEntry | null;
  totalParticipants: number;
}

interface QuizResultProps {
  questions: Question[];
  answers: Record<string, number>;
  mode: 'topic' | 'full' | 'pyq';
  timeTaken: number; // in seconds
  onRetry?: () => void;
  onExit?: () => void;
  title?: string;
  testId?: string;
  userId?: string;
  disableRetry?: boolean;
  isGuest?: boolean;
  showFeedbackModal?: boolean;
  questionTimes?: Record<string, number>;
  userName?: string;
}

interface PyqFactCard {
  id: string;
  subject?: string | null;
  importanceScore?: number | null;
  factText?: string | null;
  factTextEn?: string | null;
  memoryTip?: string | null;
  memoryTipEn?: string | null;
  scamAlert?: string | null;
  scamAlertEn?: string | null;
}

const PremiumLock = ({
  label,
  className,
  onUnlock,
}: {
  label: string;
  className?: string;
  onUnlock: () => void;
}) => (
  <div
    className={cn(
      'pointer-events-auto absolute inset-0 z-30 flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-slate-900/10 backdrop-blur-[6px]',
      className
    )}
    onClick={() => {
      toast('🔒 Pro Feature Requested', {
        description: `This feature is locked for guest users. Unlock to access!`,
        action: {
          label: 'Unlock',
          onClick: onUnlock,
        },
      });
    }}
  >
    <div
      className="animate-in fade-in zoom-in pointer-events-auto relative w-[85%] max-w-[280px] cursor-default overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] duration-500"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute top-0 left-0 h-1.5 w-full bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400"></div>
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-slate-100 bg-slate-50 shadow-inner">
        <Lock className="h-6 w-6 text-slate-900" />
      </div>
      <h3 className="mb-2 text-xl leading-tight font-black tracking-tight text-slate-900">
        {label}
      </h3>
      <p className="mb-6 px-2 text-xs leading-relaxed font-semibold text-pretty text-slate-500 opacity-80">
        {label.includes('Strategy')
          ? 'Upgrade to Pro to unlock advanced attempt intelligence and optimal simulators.'
          : 'Get Expert PYQ Insights to see repeated patterns and high-yield topics.'}
      </p>
      <Button
        className="h-12 w-full rounded-2xl bg-slate-950 text-sm font-black tracking-wide text-white shadow-xl transition-all hover:bg-slate-900 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          onUnlock();
        }}
      >
        Unlock Pro Access 🚀
      </Button>
    </div>
  </div>
);

export function QuizResult({
  questions,
  answers,
  mode,
  timeTaken,
  onRetry,
  onExit,
  title,
  testId,
  userId,
  userName,
  disableRetry = false,
  isGuest = false,
  showFeedbackModal = true,
  questionTimes = {},
}: QuizResultProps) {
  const router = useRouter();
  const { language, setLanguage } = useSettingsStore();
  const isHindi = language === 'hi';

  const isGuestLocked = isGuest && !userId;

  const [leaderboard, setLeaderboard] = useState<LeaderboardData | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [pyqInsights, setPyqInsights] = useState<PYQWrongTopicInsight[]>([]);
  const [pyqFacts, setPyqFacts] = useState<PyqFactCard[]>([]);
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [showSimulatorLogic, setShowSimulatorLogic] = useState(false);
  const [isNavigatingToIntelligence, setIsNavigatingToIntelligence] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);

  // Ensure ?completed=true is in the URL whenever the result screen is shown.
  // This means a hard refresh will hit the server with completed=true and redirect
  // to /syllabus/quiz/pyq instead of reloading the test from scratch.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('completed') !== 'true') {
      url.searchParams.set('completed', 'true');
      window.history.replaceState(window.history.state, '', url.toString());
    }
  }, []);

  useEffect(() => {
    if (!showFeedbackModal) return;

    const checkFeedbackStatus = async () => {
      // 1. Check LocalStorage (Global for both guests and logged-in users)
      const hasFeedbackStorage =
        typeof window !== 'undefined' ? localStorage.getItem('mppsc_feedback_given') : null;
      if (hasFeedbackStorage) {
        setShowFeedback(false);
        return;
      }

      // 3. For logged-in users, check database
      if (userId) {
        const submitted = await hasUserSubmittedFeedback();
        if (submitted) {
          setShowFeedback(false);
          // Sync with localStorage
          if (typeof window !== 'undefined') localStorage.setItem('mppsc_feedback_given', 'true');
          return;
        }
      }

      // If no feedback found anywhere, show it
      setShowFeedback(true);
    };

    checkFeedbackStatus();
  }, [testId, userId, showFeedbackModal]);

  const handleFeedbackSubmit = async (data: FeedbackFormType): Promise<FeedbackResponse> => {
    logger.info('QuizResult Feedback submitted', { category: 'ui', metadata: { data } });

    try {
      // Get guest name from localStorage if active
      const guestName =
        typeof window !== 'undefined' ? localStorage.getItem('mppsc_guest_name') : null;

      const currentTestId = testId || 'guest-test-result';
      const testType = mode === 'pyq' ? 'pyq' : mode === 'full' ? 'premium' : 'free';

      const response = await submitTestFeedback({
        testId: currentTestId,
        testName: title,
        testType,
        data,
        userName: userName || guestName,
      });

      if (response.success) {
        // Sync with localStorage on success
        if (typeof window !== 'undefined') localStorage.setItem('mppsc_feedback_given', 'true');
      } else {
        logger.error('Failed to submit feedback', new Error(response.error), { category: 'ui' });
      }

      setShowFeedback(false);
      return response; // Return result for the modal's toast logic
    } catch (error) {
      logger.error('Error submitting feedback', error, { category: 'ui' });
      setShowFeedback(false);
      throw error; // Let the modal's toast handler catch the error
    }
  };

  // Score Calculations
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  let totalScore = 0;
  let maxMarks = 0;

  questions.forEach((q) => {
    const qMarks = SCORING_CONFIG.MARKS_PER_QUESTION;
    const qNegative = SCORING_CONFIG.NEGATIVE_MARKING;

    maxMarks += qMarks;

    if (answers[q.id] === undefined) {
      skippedCount++;
    } else if (answers[q.id] === q.correctAnswer) {
      correctCount++;
      totalScore += qMarks;
    } else {
      wrongCount++;
      totalScore -= qNegative;
    }
  });

  totalScore = parseFloat(totalScore.toFixed(2));
  const scorePercentage = maxMarks > 0 ? Math.round((totalScore / maxMarks) * 100) : 0;
  const attemptedCount = correctCount + wrongCount;
  const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const totalQuestions = questions.length;

  useEffect(() => {
    const refreshData = async () => {
      try {
        setIsLoadingStats(true);

        // 🔧 PERF FIX: Parallelize independent operations (saves 200-400ms)
        // revalidateAnalyticsAction and getTestLeaderboard don't depend on each other
        const [, leaderboardData] = await Promise.all([
          revalidateAnalyticsAction(),
          testId ? getTestLeaderboard(testId, userId) : Promise.resolve(null),
        ]);

        if (leaderboardData) {
          setLeaderboard(leaderboardData);
        }

        // router.refresh() should run after cache invalidation is done
        router.refresh();
      } catch (error) {
        logger.error('Failed to refresh quiz result stats', error, {
          category: 'ui',
          metadata: { testId, userId },
        });
      } finally {
        setTimeout(() => setIsLoadingStats(false), 1000);
      }
    };
    refreshData();
  }, [router, testId, userId]);

  useEffect(() => {
    // 🔧 UNIVERSAL FLASHCARDS FIX: Removed 'pyq' mode guard to allow Topic & Full tests
    const wrongQIds = questions
      .filter((q) => answers[q.id] !== undefined && answers[q.id] !== q.correctAnswer)
      .map((q) => q.id);

    if (wrongQIds.length === 0 && !testId) {
      if (pyqInsights.length > 0) setPyqInsights([]);
      if (pyqFacts.length > 0) setPyqFacts([]);
      return;
    }

    setIsFetchingInsights(true);
    Promise.all([
      typeof getPYQIntelligenceForWrongQuestions === 'function' 
        ? getPYQIntelligenceForWrongQuestions(wrongQIds)
        : Promise.resolve([]),
      typeof getHighYieldFactsForQuestions === 'function'
        ? getHighYieldFactsForQuestions(wrongQIds, testId)
        : Promise.resolve([]),
    ])
      .then(([insights, facts]) => {
        setPyqInsights(insights || []);
        setPyqFacts((facts || []) as PyqFactCard[]);
      })
      .catch((err) => {
        console.error('Failed to fetch universal facts:', err);
      })
      .finally(() => setIsFetchingInsights(false));
  }, [questions, answers, mode, testId]);

  const feedbackMessage = React.useMemo(
    () => getRandomFeedback(scorePercentage, language),
    [scorePercentage, language]
  );

  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);
  const [activeQuestionTab, setActiveQuestionTab] = useState<
    'all' | 'correct' | 'wrong' | 'skipped'
  >('all');

  const filteredQuestionsCount = React.useMemo(() => {
    return questions.filter((q) => {
      if (activeQuestionTab === 'all') return true;
      const userAnswer = answers[q.id];
      const isSkipped = userAnswer === undefined;
      const isCorrect = userAnswer === q.correctAnswer;
      if (activeQuestionTab === 'skipped') return isSkipped;
      if (activeQuestionTab === 'correct') return isCorrect;
      if (activeQuestionTab === 'wrong') return !isSkipped && !isCorrect;
      return true;
    }).length;
  }, [questions, answers, activeQuestionTab]);

  const CUTOFF_PASS_PERCENTAGE = 0.78; // 78% is the official breakeven
  const ELITE_ZONE_START = 0.76;
  const ELITE_ZONE_END = 0.80;

  const CUTOFF_ESTIMATE = Math.round(maxMarks * CUTOFF_PASS_PERCENTAGE);
  const ELITE_START_EST = Math.round(maxMarks * ELITE_ZONE_START);
  const ELITE_END_EST = Math.round(maxMarks * ELITE_ZONE_END);
  
  const isCutoffCleared = totalScore >= CUTOFF_ESTIMATE;

  // Render the detailed question analysis list
  const renderQuestionList = () => {
    const filteredQuestions = questions
      .map((q, i) => ({ ...q, originalIndex: i }))
      .filter((q) => {
        if (activeQuestionTab === 'all') return true;
        const userAnswer = answers[q.id];
        const isSkipped = userAnswer === undefined;
        const isCorrect = userAnswer === q.correctAnswer;

        if (activeQuestionTab === 'skipped') return isSkipped;
        if (activeQuestionTab === 'correct') return isCorrect;
        if (activeQuestionTab === 'wrong') return !isSkipped && !isCorrect;
        return true;
      });

    if (filteredQuestions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <Filter className="mb-4 h-12 w-12 text-slate-300" />
          <h3 className="text-lg font-bold text-slate-900">No {activeQuestionTab} questions</h3>
          <p className="mt-1 text-sm text-slate-500">
            You didn&apos;t have any {activeQuestionTab} answers in this quiz.
          </p>
        </div>
      );
    }

    return filteredQuestions.map((q) => {
      const idx = q.originalIndex;
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      const isSkipped = userAnswer === undefined;
      const isExpanded = expandedQuestion === q.id;
      const isLocked = isGuestLocked && (isCorrect || isSkipped);

      return (
        <Card
          key={q.id}
          className={cn(
            'relative mb-4 overflow-hidden border-l-8 shadow-sm transition-shadow hover:shadow-md md:mb-6',
            isCorrect
              ? 'border-l-emerald-500'
              : isSkipped
                ? 'border-l-slate-200'
                : 'border-l-rose-500'
          )}
        >
          <div
            onClick={() => {
              if (isLocked) {
                toast('🔒 Pro Feature Only', {
                  description: 'Solutions & analysis are available for premium members.',
                  action: {
                    label: 'Unlock',
                    onClick: () => router.push('/pricing'),
                  },
                });
                return;
              }
              setExpandedQuestion(isExpanded ? null : q.id);
            }}
            className={cn(
              'cursor-pointer p-4 transition-colors hover:bg-slate-50 md:p-6',
              isLocked && 'cursor-not-allowed'
            )}
          >
            <div className="flex flex-col gap-3">
              {/* Top Status Bar */}
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2">
                    <span className="inline-flex h-6 w-10 items-center justify-center rounded bg-slate-100 text-[10px] font-black tracking-tight text-slate-500">
                      Q{idx + 1}
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-black text-emerald-600 ring-1 ring-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" /> {isHindi ? 'सही उत्तर' : 'Correct'}
                      </span>
                    ) : isSkipped ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-black text-slate-500 ring-1 ring-slate-500/20">
                        <AlertCircle className="h-3 w-3" /> {isHindi ? 'छोड़ा गया' : 'Skipped'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-black text-rose-600 ring-1 ring-rose-500/20">
                        <XCircle className="h-3 w-3" /> {isHindi ? 'गलत उत्तर' : 'Incorrect'}
                      </span>
                    )}
                 </div>
                 <div className="text-slate-400">
                    {isLocked ? (
                      <Lock className="h-4 w-4 text-amber-500" />
                    ) : isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                 </div>
              </div>

              {/* Question Text - Full Width */}
              <div className="flex-1">
                <div className="text-base leading-relaxed font-bold text-slate-900 md:text-lg lg:text-xl">
                  <FormattedQuestionText
                    text={cleanMatchingQuestionText(q.question, q)}
                    questionId={q.id}
                    className="block"
                  />

                  {/* Time Taken Per Question */}
                  {questionTimes[q.id] !== undefined && (
                    <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50/50 px-2 py-0.5 text-[10px] font-black tracking-tight text-indigo-600 shadow-sm ring-1 ring-indigo-100/50">
                      <Clock className="h-2.5 w-2.5" />
                      {Math.round(questionTimes[q.id])}s
                    </div>
                  )}

                  {q.type === 'matching' && (
                    <RenderTableQuestion
                      text={q.question}
                      matchPairs={q.matchPairs}
                      language="hi"
                      className="mt-3 w-full"
                    />
                  )}
                </div>

                {q.questionEn && (
                  <div className="mt-2 text-sm text-slate-500 md:text-base">
                    <FormattedQuestionText 
                      text={cleanMatchingQuestionText(q.questionEn, q)} 
                      questionId={q.id}
                    />

                    {q.type === 'matching' && (
                      <RenderTableQuestion
                        text={q.questionEn}
                        matchPairs={q.matchPairs}
                        language="en"
                        className="mt-3 border-slate-300 w-full"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="space-y-6 border-t border-slate-100 bg-slate-50/30 p-2 md:p-8"
            >
              {q.type === 'matching' && (
                <div className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                  Select the correct code:
                </div>
              )}
              <div className="grid gap-3">
                {q.options.map((opt, optIdx) => {
                  const isSelected = userAnswer === optIdx;
                  const isCorrectOpt = q.correctAnswer === optIdx;

                  let styleClass = 'border-slate-200 bg-white text-slate-600 shadow-sm';
                  if (isCorrectOpt)
                    styleClass = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500/10';
                  else if (isSelected && !isCorrectOpt)
                    styleClass =
                      'border-rose-500 bg-rose-50 text-rose-900 line-through decoration-rose-500/50 ring-1 ring-rose-500/10';

                  let optionText: string;
                  if (typeof opt === 'string') {
                    optionText = opt;
                  } else {
                    optionText =
                      language === 'hi'
                        ? opt.text || opt.textEn || opt.text_en || JSON.stringify(opt)
                        : opt.textEn || opt.text_en || opt.text || JSON.stringify(opt);
                  }

                  return (
                    <div
                      key={optIdx}
                      className={cn(
                        'flex items-center justify-between rounded-xl border p-4 text-sm md:text-base lg:text-lg transition-all',
                        styleClass
                      )}
                    >
                      <div className="flex items-center gap-3">
                         <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-inherit text-[10px] font-bold">
                            {String.fromCharCode(65 + optIdx)}
                         </span>
                         <span>{optionText}</span>
                      </div>
                      {isCorrectOpt && <CheckCircle2 className="h-5 w-5 text-emerald-600" />}
                      {isSelected && !isCorrectOpt && <XCircle className="h-5 w-5 text-rose-600" />}
                    </div>
                  );
                })}
              </div>

              <div
                className={cn(
                  'flex items-center gap-3 rounded-xl p-4 text-sm font-bold md:text-base',
                  isCorrect
                    ? 'bg-emerald-100/50 text-emerald-800 border border-emerald-200'
                    : isSkipped
                      ? 'bg-slate-100/50 text-slate-600 border border-slate-200'
                      : 'bg-rose-100/50 text-rose-800 border border-rose-200'
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                ) : isSkipped ? (
                  <AlertCircle className="h-6 w-6 text-slate-400" />
                ) : (
                  <XCircle className="h-6 w-6 text-rose-600" />
                )}

                <span>
                  {isCorrect
                    ? (isHindi ? 'आपका उत्तर सही है!' : 'You answered correctly!')
                    : isSkipped
                      ? (isHindi ? 'आपने यह प्रश्न छोड़ दिया था।' : 'You skipped this question.')
                      : (isHindi ? 'आपका उत्तर गलत है।' : 'You answered incorrectly.')}
                </span>
              </div>

              <div className="pt-2">
                <div className="mb-4 flex items-center gap-2 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                  <AlertCircle className="h-4 w-4" /> Comprehensive Explanation
                </div>

                <div className="px-1">
                  <StructuredExplanation
                    extendedData={q.extendedData}
                    plainExplanation={q.explanation || 'No explanation available.'}
                    explanationEn={q.explanationEn}
                    explanationHi={q.explanation_hi}
                    language={language}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </Card>
      );
    });
  };

  // Content for Result Tab
  const renderResultContent = () => {
    // Math for progress bar segments to prevent overflow and visual glitches
    const progressPositive = Math.max(0, totalScore);
    const progressNegative = Math.max(0, wrongCount * SCORING_CONFIG.NEGATIVE_MARKING);
    // Green = Score, Space = Skipped/Margin, Red = Penalty

    return (
      <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 space-y-6 pt-1 pb-12 duration-500">
        {/* Score Card Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-slate-700/20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl"></div>

          <div className="relative z-10">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-bold text-slate-400 capitalize flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-500" />
                {title || 'Test Result'}
              </div>

              {isGuest && (
                <Link
                  href="/"
                  className="group relative flex items-center gap-2 overflow-hidden rounded-full border border-amber-400/30 bg-slate-950 px-4 py-1.5 text-[10px] font-black tracking-wider text-white uppercase shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all hover:scale-105 hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] active:scale-95"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-rose-500/20 to-amber-500/20 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute inset-0 animate-[shimmer_3s_infinite] bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%)] bg-[length:250%_250%]" />
                  <span className="relative flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3 animate-pulse text-amber-400" />
                    <span>Explore MPPSC 2026 Pro Platform 🚀</span>
                    <ArrowRight className="h-3 w-3 text-amber-400 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              )}
            </div>

            <div className="mt-4 mb-8 flex flex-col items-center justify-between gap-6 sm:flex-row">
              <div>
                <div className="font-display flex items-baseline justify-center gap-1 text-6xl font-black sm:justify-start">
                  {totalScore}
                  <span className="text-2xl font-bold text-slate-400">/{maxMarks}</span>
                  <span className="ml-2 text-lg font-black text-slate-500 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5 tracking-tighter">({totalQuestions} Qn)</span>
                </div>
                <div className="mt-2 flex items-center justify-center gap-3 sm:justify-start">
                   <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-emerald-400 uppercase border border-emerald-500/10">
                      <Plus className="h-3 w-3" /> {SCORING_CONFIG.MARKS_PER_QUESTION} Correct
                   </div>
                   <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-black tracking-widest text-rose-400 uppercase border border-rose-500/10">
                      <Minus className="h-3 w-3" /> {SCORING_CONFIG.NEGATIVE_MARKING} Penalty
                   </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end">
                {isCutoffCleared ? (
                  <div className="mt-3 inline-flex items-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm font-black text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                    <Trophy className="mr-2 h-4 w-4 animate-bounce" /> {isHindi ? 'चयन निश्चित' : 'QUALIFIED'} (~{CUTOFF_ESTIMATE})
                  </div>
                ) : (
                  <div className="mt-3 inline-flex items-center rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-black text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <TrendingDown className="mr-2 h-4 w-4" /> {isHindi ? 'मेहनत चाहिए' : 'NEEDS PUSH'} (~{CUTOFF_ESTIMATE})
                  </div>
                )}
              </div>
            </div>

            {/* CUTOFF PROGRESS BAR - Restored Premium Style */}
            <div className="mb-8 w-full space-y-2.5">
              <div className="flex justify-between text-[11px] font-black tracking-wider text-slate-500 uppercase">
                <span>0 Marks</span>
                <div className="flex flex-wrap items-center justify-center gap-3">
                   <div className="flex min-w-[200px] items-center justify-center gap-1.5 rounded-full bg-indigo-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest text-indigo-400 uppercase border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)] transition-all hover:bg-indigo-500/15">
                      <Zap className="h-3 w-3 fill-indigo-400" /> 
                      {isHindi ? 'टॉपर्स:' : 'Toppers:'} {ELITE_START_EST}-{ELITE_END_EST} 
                      <span className="ml-1 opacity-60">({Math.round(ELITE_START_EST / SCORING_CONFIG.MARKS_PER_QUESTION)}-{Math.round(ELITE_END_EST / SCORING_CONFIG.MARKS_PER_QUESTION)}Q)</span>
                   </div>
                   <div className="flex min-w-[200px] items-center justify-center gap-1.5 rounded-full bg-amber-500/10 px-4 py-1.5 text-[10px] font-black tracking-widest text-amber-400 uppercase border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)] transition-all hover:bg-amber-500/15">
                      <Target className="h-3 w-3" /> 
                      {isHindi ? 'सुरक्षित:' : 'Safe:'} {CUTOFF_ESTIMATE} 
                      <span className="ml-1 opacity-60">({Math.round(CUTOFF_ESTIMATE / SCORING_CONFIG.MARKS_PER_QUESTION)}Q)</span>
                   </div>
                </div>
                <span>{maxMarks} Max</span>
              </div>

              <div className="relative flex h-5 w-full overflow-hidden rounded-full border-2 border-slate-700/30 bg-slate-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]">
                 {/* Elite Zone */}
                 <div 
                   className="absolute top-0 bottom-0 z-0 bg-indigo-500/20 border-x border-white/5"
                   style={{ 
                     left: `${(ELITE_START_EST / maxMarks) * 100}%`,
                     width: `${((ELITE_END_EST - ELITE_START_EST) / maxMarks) * 100}%`
                   }}
                 />
                 {/* Score Progress */}
                 <motion.div
                   initial={{ width: 0 }}
                   animate={{ width: `${Math.min((progressPositive / maxMarks) * 100, 100)}%` }}
                   className="relative z-10 h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                 />
                 {/* Cutoff Marker */}
                 <div
                   className="absolute top-0 bottom-0 z-20 w-1.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)]"
                   style={{ left: `${(CUTOFF_ESTIMATE / maxMarks) * 100}%` }}
                 />
              </div>

              <div className="mt-2 flex justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-emerald-500">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" /> {isHindi ? 'कुल प्राप्त अंक' : 'Your Marks'} ({totalScore})
                </span>
                <span className="flex items-center gap-1.5 text-slate-500">
                  <div className="h-2 w-2 rounded-full bg-slate-500 opacity-50" /> {isHindi ? 'चयन कट-ऑफ' : 'Target Cutoff'} ({CUTOFF_ESTIMATE})
                </span>
                <span className="flex items-center gap-1.5 text-rose-400">
                  <div className="h-2 w-2 rounded-full bg-rose-500" /> Penalty (-{progressNegative})
                </span>
              </div>
            </div>

            {/* Quick Stats Grid - Restored Original Structure but Cleaned */}
            <div className="grid grid-cols-4 gap-2 border-t border-slate-700/50 pt-5">
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400">{correctCount}</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Correct</div>
              </div>
              <div className="border-l border-slate-700/50 text-center">
                <div className="text-2xl font-black text-rose-500">{wrongCount}</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Wrong</div>
              </div>
              <div className="border-l border-slate-700/50 text-center">
                <div className="text-2xl font-black text-slate-400">{skippedCount}</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Skipped</div>
              </div>
              <div className="border-l border-slate-700/50 text-center">
                <div className="text-2xl font-black text-white">{totalScore}</div>
                <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Score</div>
              </div>
            </div>
            
            {/* Minimal Socials Subtle Footer */}
            <div className="mt-4 flex justify-center pt-2 border-t border-slate-800/10">
               <ConnectSocials minimal />
            </div>
          </div>
        </div>

        {/* RESTORED: LEADERBOARD TABLE */}
        {leaderboard && (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
              <h3 className="flex items-center gap-2 font-bold text-slate-800">
                <Trophy className="h-5 w-5 text-amber-500" /> Top Performers
              </h3>
              <div className="text-xs font-medium text-slate-500">Only Top 10 shown</div>
            </div>
            <div className="divide-y divide-slate-100">
              {leaderboard.leaderboard.map((entry: LeaderboardEntry, index: number) => {
                const isCurrentUser = entry.userId === userId;
                return (
                  <div
                    key={entry.id}
                    className={cn(
                      'flex items-center justify-between p-3 transition-colors',
                      isCurrentUser ? 'bg-amber-50' : 'hover:bg-slate-50'
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold',
                          index === 0
                            ? 'bg-amber-100 text-amber-700'
                            : index === 1
                              ? 'bg-slate-200 text-slate-700'
                              : index === 2
                                ? 'bg-orange-100 text-orange-700'
                                : 'text-slate-400'
                        )}
                      >
                        {index === 0 && '👑'}
                        {index === 1 && '🥈'}
                        {index === 2 && '🥉'}
                        {index > 2 && index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          {isCurrentUser ? 'YOU' : entry.displayName}
                          {isCurrentUser && (
                            <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
                              ME
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {Math.floor((entry.timeTakenSeconds || 0) / 60)}m {(entry.timeTakenSeconds || 0) % 60}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">{entry.score}</div>
                      <div className="text-[10px] text-slate-400">Score</div>
                    </div>
                  </div>
                );
              })}

              {/* Current user at bottom if out of top 10 */}
              {(leaderboard.userRank ?? 0) > 10 && leaderboard.userEntry && (
                <>
                  <div className="border-y border-slate-100 bg-slate-50 p-2 text-center text-xs text-slate-400">
                    ...
                  </div>
                  <div className="flex items-center justify-between border-l-4 border-amber-400 bg-amber-50 p-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-slate-500">
                        {leaderboard.userRank || '-'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                          YOU
                          <span className="rounded bg-slate-900 px-1.5 py-0.5 text-[10px] text-white">
                            ME
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {Math.floor((leaderboard.userEntry.timeTakenSeconds || 0) / 60)}m{' '}
                          {(leaderboard.userEntry.timeTakenSeconds || 0) % 60}s
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">{leaderboard.userEntry.score}</div>
                      <div className="text-[10px] text-slate-400">Score</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        </div>
    );
  };

  // Content for Review Tab
  const renderReviewContent = () => {
    return (
      <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 pt-1 pb-20 duration-500">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            {isHindi ? 'प्रश्न समीक्षा' : 'Question Review'}
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-500">
            {isHindi
              ? 'प्रत्येक प्रश्न का विस्तृत विश्लेषण और सही उत्तर देखें।'
              : 'Detailed analysis and correct solutions for every question.'}
          </p>
        </div>

        {/* Question Details Controller */}
        <div className="sticky top-[116px] z-30 mb-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl backdrop-blur-md sm:top-[128px]">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-3">
             <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Filter Questions</span>
             <span className="text-[10px] font-bold text-slate-400">{filteredQuestionsCount} / {questions.length} Shown</span>
          </div>
          <div className="flex items-center gap-1 p-2 overflow-x-auto no-scrollbar">
            <Button
              variant={activeQuestionTab === 'all' ? 'default' : 'ghost'}
              onClick={() => setActiveQuestionTab('all')}
              className={cn(
                'flex-1 rounded-xl px-4 py-6 text-xs font-black tracking-widest uppercase transition-all',
                activeQuestionTab === 'all'
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              All ({questions.length})
            </Button>
            <Button
              variant={activeQuestionTab === 'correct' ? 'default' : 'ghost'}
              onClick={() => setActiveQuestionTab('correct')}
              className={cn(
                'flex-1 rounded-xl px-4 py-6 text-xs font-black tracking-widest uppercase transition-all',
                activeQuestionTab === 'correct'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-emerald-50 hover:text-emerald-600'
              )}
            >
              Correct ({correctCount})
            </Button>
            <Button
              variant={activeQuestionTab === 'wrong' ? 'default' : 'ghost'}
              onClick={() => setActiveQuestionTab('wrong')}
              className={cn(
                'flex-1 rounded-xl px-4 py-6 text-xs font-black tracking-widest uppercase transition-all',
                activeQuestionTab === 'wrong'
                  ? 'bg-rose-500 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-rose-50 hover:text-rose-600'
              )}
            >
              Wrong ({wrongCount})
            </Button>
            <Button
              variant={activeQuestionTab === 'skipped' ? 'default' : 'ghost'}
              onClick={() => setActiveQuestionTab('skipped')}
              className={cn(
                'flex-1 rounded-xl px-4 py-6 text-xs font-black tracking-widest uppercase transition-all',
                activeQuestionTab === 'skipped'
                  ? 'bg-slate-500 text-white shadow-lg'
                  : 'text-slate-500 hover:bg-slate-100'
              )}
            >
              Skipped ({skippedCount})
            </Button>
          </div>
        </div>

        <div className="space-y-6">{renderQuestionList()}</div>
      </div>
    );
  };
  // Content for Strategy Tab
  const renderStrategyContent = () => {
    // 🛡️ GUEST LOCK FOR AUDIT TAB
    if (isGuestLocked) {
      return (
        <div className="relative min-h-[400px] pt-10">
          <PremiumLock
            label={isHindi ? 'स्मार्ट ऑडिट लॉक है' : 'Smart Audit Locked'}
            onUnlock={() => router.push('/pricing')}
          />
          <div className="flex flex-col gap-6 opacity-5">
            <div className="h-20 rounded-3xl bg-slate-200 animate-pulse" />
            <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
            <div className="h-40 rounded-3xl bg-slate-200 animate-pulse" />
          </div>
        </div>
      );
    }

    // Smart Strategic Intelligence logic
    const isOverAttempting = wrongCount > totalQuestions * 0.15; // >15% wrong is dangerous
    const isUnderAttempting = attemptedCount < totalQuestions * 0.75; // <75% attempt is low

    // Accurate Simulator Math
    const calculateSimulatedScore = (attemptRate: number, accRate: number) => {
      const simAttempts = Math.round(totalQuestions * attemptRate);
      const simCorrect = Math.round(simAttempts * accRate);
      const simWrong = simAttempts - simCorrect;

      const posMarks = simCorrect * SCORING_CONFIG.MARKS_PER_QUESTION;
      const negMarks = simWrong * SCORING_CONFIG.NEGATIVE_MARKING;
      return parseFloat((posMarks - negMarks).toFixed(2));
    };

    const sim85score = calculateSimulatedScore(0.85, 0.82); // Attempt 85%, 82% precision
    const sim75score = calculateSimulatedScore(0.75, 0.9); // Attempt 75%, 90% precision

    return (
      <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 space-y-6 pt-1 pb-12 duration-500">
        <div>
          <h2 className="mb-1 text-2xl font-black tracking-tight text-slate-900">
            {isHindi ? 'प्रयास विश्लेषण' : 'Attempt Intelligence'}
          </h2>
          <p className="text-sm font-medium tracking-wide text-slate-500">
            {isHindi ? (
              <>
                {SCORING_CONFIG.MARKS_PER_QUESTION} अंक सही{' '}
                <span className="mx-1 font-bold text-rose-500">|</span> -
                {SCORING_CONFIG.NEGATIVE_MARKING} नकारात्मक अंकन
              </>
            ) : (
              <>
                {SCORING_CONFIG.MARKS_PER_QUESTION} marks correct{' '}
                <span className="mx-1 font-bold text-rose-500">|</span> -
                {SCORING_CONFIG.NEGATIVE_MARKING} negative marking
              </>
            )}
          </p>
        </div>

        <Card className="overflow-hidden border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 p-4">
            <h3 className="text-sm font-bold tracking-wide text-slate-800 uppercase">
              {isHindi ? 'आपका स्कोर गणित' : 'Your Attempt Math'}
            </h3>
            <span className="rounded-full bg-slate-200/50 px-2 py-1 text-xs text-[10px] font-bold text-slate-500">
              {isHindi ? 'इस मॉक का विश्लेषण' : 'This mock analysis'}
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>{' '}
                {isHindi ? 'कुल प्रयास' : 'Attempted'}
              </span>
              <span className="font-bold text-slate-900">
                {attemptedCount}{' '}
                <span className="font-medium text-slate-400">/ {totalQuestions}</span>
              </span>
            </div>
            <div className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
              <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>{' '}
                {isHindi ? 'सही प्रयास' : 'Correct attempts'}
              </span>
              <span className="font-bold text-emerald-600">
                {correctCount}{' '}
                <span className="mx-1 text-xs font-medium text-slate-400">
                  × {SCORING_CONFIG.MARKS_PER_QUESTION} =
                </span>{' '}
                +{correctCount * SCORING_CONFIG.MARKS_PER_QUESTION}
              </span>
            </div>
            <div className="flex items-center justify-between bg-rose-50/30 p-4 transition-colors hover:bg-slate-50/50">
              <span className="flex items-center gap-2 text-sm font-bold text-rose-700">
                <div className="h-1.5 w-1.5 rounded-full bg-rose-500"></div>{' '}
                {isHindi ? 'गलत प्रयास' : 'Wrong attempts'}
              </span>
              <span className="font-bold text-rose-600">
                {wrongCount}{' '}
                <span className="mx-1 text-xs font-medium text-slate-400">
                  × {SCORING_CONFIG.NEGATIVE_MARKING} =
                </span>{' '}
                -{wrongCount * SCORING_CONFIG.NEGATIVE_MARKING}
              </span>
            </div>
            <div className="flex items-center justify-between border-t-2 border-slate-200 bg-slate-50/80 p-4">
              <span className="pl-3.5 text-sm font-black tracking-widest text-slate-800 uppercase">
                {isHindi ? 'शुद्ध स्कोर' : 'Net Score'}
              </span>
              <span className="text-xl font-black text-slate-900">
                {totalScore}{' '}
                <span className="ml-0.5 text-sm font-bold text-slate-500">
                  {isHindi ? 'अंक' : 'pts'}
                </span>
              </span>
            </div>
            <div className="flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50">
              <span className="pl-3.5 text-sm font-bold text-slate-600">
                {isHindi ? 'सटीकता दर' : 'Accuracy Rate'}
              </span>
              <span
                className={cn(
                  'flex items-center gap-2 font-bold',
                  accuracy >= 78 ? 'text-emerald-500' : accuracy >= 75 ? 'text-amber-500' : 'text-rose-500'
                )}
              >
                {accuracy.toFixed(1)}%{' '}
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 opacity-70">
                  ({isHindi ? 'लक्ष्य' : 'Expert Target'}: ≥78%)
                </span>
              </span>
            </div>
            <div
              className={cn(
                'flex items-center justify-between p-4 transition-colors hover:bg-slate-50/50',
                skippedCount > totalQuestions * 0.2 ? 'bg-amber-50/50' : ''
              )}
            >
              <span className="pl-3.5 text-sm font-bold text-slate-600">
                {isHindi ? 'छोड़े गए (सुरक्षित क्षेत्र)' : 'Skipped (Safe Zone)'}
              </span>
              <span className="font-bold text-emerald-600">
                {skippedCount}{' '}
                <span className="ml-1 text-xs font-medium text-slate-400">
                  {isHindi
                    ? `बचाए ~${skippedCount * SCORING_CONFIG.NEGATIVE_MARKING} नकारात्मक अंक`
                    : `saved ~${skippedCount * SCORING_CONFIG.NEGATIVE_MARKING} negative points`}
                </span>
              </span>
            </div>
          </div>
        </Card>

        {/* Smart Strategy Gaps Box */}
        {(isOverAttempting || isUnderAttempting || accuracy < 78) && (
          <Card className="overflow-hidden border border-amber-500/30 bg-amber-50/60 shadow-sm">
            <div className="flex items-start gap-3 p-4">
              <div className="shrink-0 rounded-full bg-amber-100 p-2">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="mb-3 text-sm font-bold tracking-wide text-amber-900 uppercase">
                  {isHindi ? 'स्मार्ट इंटेलिजेंस ऑडिट' : 'Smart Intelligence Audit'}
                </h3>
                <ul className="list-disc space-y-3 pl-2 text-sm font-medium text-amber-800 marker:text-amber-400">
                  {isOverAttempting && (
                    <li className="pl-1">
                      {isHindi ? (
                        <>
                          आपने <span className="font-bold">{wrongCount} गलत उत्तर</span> दिए। यह{' '}
                          {wrongCount * SCORING_CONFIG.NEGATIVE_MARKING} अंकों का नुकसान है। यदि
                          आत्मविश्वास नहीं है, तो छोड़ना बेहतर है।
                        </>
                      ) : (
                        <>
                          You got <span className="font-bold">{wrongCount} wrong answers</span>.
                          That&apos;s {wrongCount * SCORING_CONFIG.NEGATIVE_MARKING} points lost to
                          negative marking. If not confident, it&apos;s better to skip.
                        </>
                      )}
                    </li>
                  )}
                  {accuracy < 78 && (
                    <li className="pl-1">
                      {isHindi ? (
                        <>
                          आपकी सटीकता <span className="font-bold">{accuracy.toFixed(2)}%</span> है।{' '}
                          {accuracy >= 75 
                            ? "आप बिल्कुल सीमा पर हैं! बस थोड़ा सा सुधार आपको सुरक्षित श्रेणी (Elite Zone) में डाल देगा।"
                            : `${CUTOFF_ESTIMATE}+ स्कोर के लिए अपनी सटीकता को 78% से ऊपर ले जाने का लक्ष्य रखें।`}
                        </>
                      ) : (
                        <>
                          Your accuracy is <span className="font-bold">{accuracy.toFixed(2)}%</span>.
                          {accuracy >= 75
                            ? " You are on the critical boundary! A marginal improvement puts you in the Elite Zone."
                            : ` Aim to push accuracy above 78% for a safe ${CUTOFF_ESTIMATE}+ score.`}
                        </>
                      )}
                    </li>
                  )}
                  {isUnderAttempting && (
                    <li className="pl-1">
                      {isHindi ? (
                        <>
                          आपने केवल <span className="font-bold">{attemptedCount}</span> प्रश्न हल
                          किए। कटौती के साथ अच्छा स्कोर करने के लिए, कम से कम{' '}
                          {Math.round(totalQuestions * 0.8)} प्रश्नों का प्रयास करें।
                        </>
                      ) : (
                        <>
                          You attempted only <span className="font-bold">{attemptedCount}</span>{' '}
                          questions. To score well with deductions, try safely attempting at least{' '}
                          {Math.round(totalQuestions * 0.8)} questions.
                        </>
                      )}
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </Card>
        )}

        {/* Connect Socials for guests - prominent display */}
        {isGuest && (
          <div className="mx-auto max-w-md">
            <ConnectSocials variant="light" />
          </div>
        )}

        <Card className="overflow-hidden border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-800 bg-slate-900 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-white uppercase">
              <Target className="h-4 w-4 text-emerald-400" />{' '}
              {isHindi ? 'स्मार्ट स्कोर प्रोजेक्टर' : 'Smart Score Projector'}
            </h3>
          </div>
          <div className="border-b border-slate-100 bg-slate-50 p-4 text-xs font-bold tracking-widest text-slate-500 uppercase">
            {isHindi
              ? 'स्कोर अनुमान (सख्त नकारात्मक अंकन)'
              : 'Score Projections (Strict Negative Marking)'}
          </div>
          <div className="divide-y divide-slate-100 bg-white">
            <div className="flex items-center justify-between p-4 font-bold text-slate-700 transition-colors hover:bg-slate-50">
              <div className="flex flex-col">
                <span>
                  {isHindi ? 'प्रयास 85%' : 'Attempt 85%'}{' '}
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    ({isHindi ? 'छोड़ें 15%' : 'Skip 15%'})
                  </span>
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {isHindi ? 'मानता है 82% सटीकता' : 'Assumes 82% precision'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-lg text-emerald-600">~{sim85score}</span>
                <span className="text-[10px] text-slate-400">
                  {isHindi ? 'अनुमानित अंक' : 'Projected Marks'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-l-4 border-l-transparent p-4 font-bold text-slate-700 transition-colors hover:bg-slate-50">
              <div className="flex flex-col">
                <span>
                  {isHindi ? 'प्रयास 75%' : 'Attempt 75%'}{' '}
                  <span className="ml-1 text-xs font-medium text-slate-400">
                    ({isHindi ? 'छोड़ें 25%' : 'Skip 25%'})
                  </span>
                </span>
                <span className="text-[10px] font-medium text-slate-400">
                  {isHindi ? 'मानता है 90% सटीकता' : 'Assumes 90% precision'}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-lg text-emerald-500">~{sim75score}</span>
                <span className="text-[10px] text-slate-400">
                  {isHindi ? 'अनुमानित अंक' : 'Projected Marks'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between border-l-4 border-l-amber-400 bg-amber-50/30 p-4 font-bold text-amber-700">
              <div className="flex flex-col">
                <span>{isHindi ? 'आपकी वर्तमान स्थिति' : 'Your Current State'}</span>
                <span className="text-[10px] font-medium text-amber-600/70">
                  {isHindi
                    ? `प्रयास ${attemptedCount} (${accuracy.toFixed(0)}% सटीकता)`
                    : `Attempted ${attemptedCount} (${accuracy.toFixed(0)}% precision)`}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-lg">{totalScore}</span>
                <span className="text-[10px] opacity-70">
                  {isHindi ? 'वास्तविक अंक' : 'Actual Marks'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2 bg-emerald-50 p-3 text-center text-xs font-bold text-emerald-800">
            <div className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 fill-emerald-500" />
              {isHindi
                ? 'संतुलित प्रयास दर + उच्च सटीकता = अधिकतम शुद्ध स्कोर'
                : 'Balanced Attempt Rate + High Accuracy = Maximum Net Score'}
            </div>
            <button
              onClick={() => setShowSimulatorLogic(!showSimulatorLogic)}
              className="mt-1 flex items-center gap-1 text-[10px] text-emerald-600 underline decoration-emerald-300 underline-offset-2 hover:text-emerald-700"
            >
              {isHindi ? 'यह गणना कैसे की जाती है?' : 'How is this calculated?'}
              {showSimulatorLogic ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </button>

            {showSimulatorLogic && (
              <div className="animate-in slide-in-from-top-2 fade-in mt-2 w-full rounded-lg border border-emerald-100 bg-white/60 p-3 text-left text-[10px] leading-relaxed font-medium text-emerald-800 duration-200">
                <div className="mb-2">
                  <span className="mb-0.5 block font-bold text-emerald-900">
                    {isHindi
                      ? 'परिदृश्य 1: आक्रामक (85% प्रयास)'
                      : 'Scenario 1: Aggressive (85% Attempt)'}
                  </span>
                  85 Qs × 82% Accuracy ≈{' '}
                  <span className="font-bold text-emerald-700">70 Correct</span>, 15 Wrong
                  <br />
                  Score = (70 × 3) - (15 × 1) ={' '}
                  <span className="font-bold text-emerald-900">195 Marks</span>
                </div>
                <div>
                  <span className="mb-0.5 block font-bold text-emerald-900">
                    {isHindi
                      ? 'परिदृश्य 2: सटीक (75% प्रयास)'
                      : 'Scenario 2: Precision (75% Attempt)'}
                  </span>
                  75 Qs × 90% Accuracy ≈{' '}
                  <span className="font-bold text-emerald-700">68 Correct</span>, 7 Wrong
                  <br />
                  Score = (68 × 3) - (7 × 1) ={' '}
                  <span className="font-bold text-emerald-900">197 Marks</span>
                </div>
                <div className="mt-2 border-t border-emerald-200/50 pt-2 text-center text-emerald-600 italic">
                  {isHindi
                    ? 'निष्कर्ष: कम प्रयास लेकिन उच्च सटीकता अक्सर बेहतर स्कोर देती है।'
                    : 'Conclusion: Lower attempts with higher accuracy often yields a better score.'}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    );
  };

  // Content for Flashcards Tab
  const renderPYQAnalysisContent = () => {
    if (isGuestLocked) {
      return (
        <div className="relative min-h-[300px]">
          <PremiumLock
            label={isHindi ? 'फ्लैशकार्ड लॉक है' : 'Flashcards Locked'}
            onUnlock={() => router.push('/pricing')}
          />
          <div className="flex flex-col gap-4 opacity-10">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      );
    }

    if (pyqFacts.length === 0) {
      return (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <Lightbulb size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
             {isHindi ? 'कोई फ्लैशकार्ड नहीं मिला' : 'No Flashcards Found'}
          </h3>
          <p className="text-sm text-slate-500">
            {isHindi 
              ? 'अपनी गलतियों को सुधारने के लिए और अधिक अभ्यास करें।' 
              : 'Practice more and analyze mistakes to unlock high-yield facts.'}
          </p>
        </div>
      );
    }

    return (
      <div className="grid gap-6">
        {pyqFacts.map((fact) => (
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
                   {fact.subject || (isHindi ? 'विषय' : 'Subject')}
                 </span>
              </div>
              {(fact.importanceScore || 0) > 8 && (
                <div className="flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[9px] font-black tracking-widest text-rose-600 uppercase border border-rose-100 shadow-sm animate-pulse">
                  <Trophy className="h-3 w-3" /> High Yield
                </div>
              )}
            </div>

            <p className="mb-6 text-sm leading-relaxed font-bold text-slate-800 md:text-base">
              {isHindi && fact.factText ? fact.factText : fact.factTextEn || fact.factText}
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
               {(fact.memoryTip || fact.memoryTipEn) && (
                 <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 transition-colors hover:bg-blue-50">
                    <div className="mb-2 flex items-center gap-2 text-blue-800">
                      <Lightbulb className="h-4 w-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Memory Tip</span>
                    </div>
                    <p className="text-xs font-medium leading-relaxed text-blue-700">
                      {isHindi && fact.memoryTip
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
                      {isHindi && fact.scamAlert
                        ? fact.scamAlert
                        : fact.scamAlertEn || fact.scamAlert}
                    </p>
                 </div>
               )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 🚀 PREMIUM STICKY HEADER (Responsive & Clean) */}
      <div className="sticky top-14 z-40 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6">
          <div className="flex items-center justify-between">
            {/* Breadcrumbs & Title */}
            <div className="flex items-center gap-3">
              {/* Mobile Back Button */}
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 text-slate-500 md:hidden"
                onClick={() => router.back()}
              >
                <ArrowLeft size={20} />
              </Button>

              <div className="flex flex-col">
                {/* Desktop Breadcrumbs */}
                <div className="hidden items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase md:flex">
                  <Link href="/dashboard" className="hover:text-slate-900">Dashboard</Link>
                  <ChevronRight size={10} />
                  <Link href="/syllabus/quiz/pyq" className="hover:text-slate-900">Test Series</Link>
                  <ChevronRight size={10} />
                  <span className="text-slate-600">Performance Intelligence</span>
                </div>
                
                <h1 className="mt-1 flex items-center gap-2 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                   <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 border border-amber-100 sm:h-9 sm:w-9">
                     <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
                   </div>
                   {isHindi ? 'परफॉरमेंस इंटेलिजेंस' : 'Performance Intelligence'}
                </h1>
              </div>
            </div>

            {/* Subtle Close/More (Optional) */}
            <div className="flex items-center gap-2">
                 {/* Place minimal social icons here for desktop if desired, but user wants them smaller and discrete */}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-2 pt-4 pb-20 md:px-0">

      <Tabs defaultValue="result" className="w-full">
        <div className="sticky top-[56px] sm:top-[64px] z-40 border-b border-slate-200/60 bg-white/95 backdrop-blur-sm py-3">
          <TabsList className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 rounded-2xl bg-slate-100 p-1.5 shadow-sm sm:gap-4">
            <TabsTrigger value="result" className="flex-1 rounded-xl py-2.5 text-xs font-black tracking-widest uppercase transition-all data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-md">
              {isHindi ? 'रिजल्ट' : 'Result'}
            </TabsTrigger>
            <TabsTrigger value="audit" className="flex-1 rounded-xl py-2.5 text-xs font-black tracking-widest uppercase transition-all data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md">
              {isHindi ? 'स्मार्ट ऑडिट' : 'Audit'}
            </TabsTrigger>
            <TabsTrigger value="review" className="flex-1 rounded-xl py-2.5 text-xs font-black tracking-widest uppercase transition-all data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-md">
              {isHindi ? 'रिव्यू' : 'Review'}
            </TabsTrigger>
            <TabsTrigger value="pyq" className="flex-1 rounded-xl py-2.5 text-xs font-black tracking-widest uppercase transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-white data-[state=active]:shadow-md">
              {isHindi ? 'फ्लैशकार्ड' : 'Flashcards'}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="result" className="mt-0 text-slate-100">
          <div className="mx-auto max-w-7xl px-2 md:px-0">
            {renderResultContent()}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="mt-0">
          <div className="mx-auto max-w-7xl px-2 md:px-0">
            {renderStrategyContent()}
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-0">
          <div className="mx-auto max-w-7xl px-2 md:px-0">
            {renderReviewContent()}
          </div>
        </TabsContent>

        <TabsContent value="pyq" className="mt-0">
          <div className="mx-auto max-w-7xl px-2 md:px-0">
            {renderPYQAnalysisContent()}
          </div>
        </TabsContent>
      </Tabs>

      <TestSeriesFeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        onSubmit={handleFeedbackSubmit}
        testSeriesId={testId}
      />
      </div>
    </div>
  );
}
