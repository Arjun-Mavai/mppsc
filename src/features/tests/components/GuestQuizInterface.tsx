'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Question } from '@/types/quiz';
import { useQuizLogic } from '@/hooks/useQuizLogic';
import { useSettingsStore } from '@/store/useSettingsStore';
import { createGuestEntry as createGuestUser } from '@/actions/guest-actions';
import { logger } from '@/lib/logger';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { PYQFactsLoader } from '@/components/ui/PYQFactsLoader';
import { toast } from 'sonner';
import { useGuestResultStore } from '../store/guestResultStore';
import { requestFullscreenSafely, exitFullscreenSafely, isFullscreenActive, isFullscreenSupported } from '@/lib/fullscreen-utils';

import { QuizHeader } from './quiz/QuizHeader';
import { QuizQuestion } from './quiz/QuizQuestion';
import { QuizNavigation } from './quiz/QuizNavigation';
import { QuizPaletteMobile, QuizPaletteDesktop } from './quiz/QuizPalette';
import { QuizExitDialog } from './quiz/QuizExitDialog';
import { GuestEntryDialog } from './quiz/GuestEntryDialog';
import { QuizExplanation } from './quiz/QuizExplanation';
import { QuizSubmitDialog } from './quiz/QuizSubmitDialog';
import { recordGuestAttempt } from '@/app/free-quiz/actions';


interface GuestQuizInterfaceProps {
  questions: Question[];
  mode: 'topic' | 'full' | 'pyq';
  timeLimitInMinutes: number;
  testId: string;
  title?: string;
  onExit: () => void;
  disablePalette?: boolean;
  disableInstantMode?: boolean; // Pro feature — free quiz me OFF rahega
  user?: { name: string; email: string; mobile?: string | null } | null;
  /** When true, explanations show on answer (e.g. open PYQ marketing page). */
  initialInstantMode?: boolean;
  /** Skip auto-fullscreen on mount (e.g. public lead-gen pages). */
  skipAutoFullscreen?: boolean;
  /** Whether the test is strictly an instant mode test from DB */
  isInstantMode?: boolean;
}

export function GuestQuizInterface(props: GuestQuizInterfaceProps) {
  const {
    questions,
    mode,
    timeLimitInMinutes,
    title,
    onExit,
    disablePalette = false,
    disableInstantMode = false,
    testId,
    user,
    initialInstantMode = false,
    skipAutoFullscreen = false,
    isInstantMode = false,
  } = props;

  // No user ID props here as this IS for guests only.
  // Note: scroll is locked by the outer div's h-[100dvh] overflow-hidden — no body manipulation needed.

  const router = useRouter();

  const {
    currentQuestionIndex,
    answers,
    markedforReview,
    isSubmitted,
    timeLeft,
    instantModeEnabled,
    language,
    setInstantModeEnabled,
    handleOptionSelect,
    handleNext,
    handlePrev,
    handleJump,
    toggleMarkForReview,
    handleSubmit, // We'll override the action of this, or use it for validation
    getParsedOptions,
    currentQuestion,
    isAnswered,
    totalQuestions,
    questionTimes,
    activeQuestionTime,
  } = useQuizLogic({
    ...props,
    userId: null,
    isInstantMode: initialInstantMode,
  }); // Force userId null

  // Effective instant mode — disableInstantMode true h to force OFF
  const effectiveInstantMode = !disableInstantMode && instantModeEnabled;

  const { setLanguage } = useSettingsStore();
  const { setResult } = useGuestResultStore();

  // UI state
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasAutoFullscreened, setHasAutoFullscreened] = useState(false);

  // Guest state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMobile, setGuestMobile] = useState('');
  const [showGuestEntryDialog, setShowGuestEntryDialog] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Custom Guest Submit State (to trigger storing and redirect)
  const [isProcessingResult, setIsProcessingResult] = useState(false);

  // Translations
  const t = {
    exit: language === 'hi' ? 'बाहर जाएं' : 'Exit',
    instantMode: language === 'hi' ? 'इंस्टेंट मोड' : 'Instant Mode',
    fullTest: language === 'hi' ? 'पूर्ण टेस्ट' : 'Full Length Test',
    topicPractice: language === 'hi' ? 'टॉपिक अभ्यास' : 'Topic Practice',
    questionPalette: language === 'hi' ? 'प्रश्न पैलेट' : 'Question Palette',
    attempted: language === 'hi' ? 'प्रयास किया' : 'Attempted',
    submitTest: language === 'hi' ? 'टेस्ट जमा करें' : 'Submit Test',
    submit: language === 'hi' ? 'जमा करें' : 'Submit',
    next: language === 'hi' ? 'अगला' : 'Next',
    prev: language === 'hi' ? 'पिछा' : 'Prev',
    question: language === 'hi' ? 'प्रश्न' : 'Question',
    markReview: language === 'hi' ? 'समीक्षा के लिए मार्क करें' : 'Mark for Review',
    unmark: language === 'hi' ? 'अनमार्क' : 'Unmark',
    explanation: language === 'hi' ? 'व्याख्या' : 'Explanation',
    quitConfirm: language === 'hi' ? 'क्विज़ छोड़ें?' : 'Quit Quiz?',
    quitDesc:
      language === 'hi'
        ? 'क्या आप निश्चित रूप से बाहर निकलना चाहते हैं? आपकी प्रगति खो जाएगी।'
        : 'Are you sure you want to exit? Your progress will be lost and this session will not be saved.',
    cancel: language === 'hi' ? 'रद्द करें' : 'Cancel',
    yesExit: language === 'hi' ? 'हां, बाहर जाएं' : 'Yes, Exit',
    answered: language === 'hi' ? 'उत्तर दिया' : 'Answered',
    notAnswered: language === 'hi' ? 'उत्तर नहीं दिया' : 'Not Answered',
    review: language === 'hi' ? 'समीक्षा' : 'Review',
    current: language === 'hi' ? 'वर्तमान' : 'Current',
  };

  // ── Fullscreen helpers ──
  const requestFullscreen = useCallback(async () => {
    if (!isFullscreenActive()) {
      const success = await requestFullscreenSafely();
      if (success) {
        setIsFullscreen(true);
        localStorage.setItem('mppsc_quiz_fullscreen', 'true');
      } else {
        // Fullscreen failed or not supported - continue without it
        console.info('Fullscreen not available on this device');
      }
    }
  }, []);

  const handleConfirmedExit = useCallback(async () => {
    if (isFullscreenActive()) {
      const success = await exitFullscreenSafely();
      if (success) {
        setIsFullscreen(false);
        localStorage.removeItem('mppsc_quiz_fullscreen');
      }
    }
    onExit();
  }, [onExit]);

  const showExitModal = useCallback(() => setShowExitConfirm(true), []);

  const handleExitCancel = useCallback(() => {
    setShowExitConfirm(false);
    if (!isFullscreenActive() && !isSubmitted) {
      requestFullscreen();
    }
  }, [isSubmitted, requestFullscreen]);

  // ── Guest entry ──
  useEffect(() => {
    if (user) {
      setGuestName(user.name);
      setGuestEmail(user.email);
      setGuestMobile(user.mobile || '');
      setShowGuestEntryDialog(false);
      return;
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mppsc_guest_name');
      if (saved) setGuestName(saved);
      else setShowGuestEntryDialog(true);
    }
  }, [user]);

  const handleGuestEntrySubmit = () => {
    if (!guestName.trim()) return;
    
    // ⚡ INSTANT START: Save to localStorage and close dialog immediately
    try {
      localStorage.setItem('mppsc_guest_name', guestName.trim());
      useSettingsStore.getState().setGuestLead({ name: guestName.trim(), email: guestEmail.trim(), phone: guestMobile.trim() });
    } catch (error) {
      logger.error('Failed to persist guest name to localStorage', error, {
        category: 'auth',
        metadata: { guestName },
      });
    }
    setShowGuestEntryDialog(false);
    
    // 🔥 FIRE-AND-FORGET: DB write happens in background - no waiting!
    // This is non-blocking - user can start quiz immediately
    createGuestUser({ 
      name: guestName, 
      email: guestEmail, 
      mobile: guestMobile, 
      referrer: document.referrer 
    }).catch((error) => {
        // Silent fail - localStorage backup is already saved
        logger.error('Guest entry creation failed (background)', error, {
          category: 'auth',
          metadata: { guestName, guestEmail },
        });
      });
  };

  // ── Auto-fullscreen on mount ──
  useEffect(() => {
    if (skipAutoFullscreen) return;
    if (!hasAutoFullscreened && !isSubmitted) {
      const timer = setTimeout(() => {
        requestFullscreen();
        setHasAutoFullscreened(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [hasAutoFullscreened, isSubmitted, requestFullscreen, skipAutoFullscreen]);

  // ── Fullscreen change listener ──
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
        setShowExitConfirm(true);
      }
    };
    document.addEventListener('fullscreenchange', handler);
    document.addEventListener('webkitfullscreenchange', handler);
    return () => {
      document.removeEventListener('fullscreenchange', handler);
      document.removeEventListener('webkitfullscreenchange', handler);
    };
  }, [isFullscreen]);

  // ── Browser back button → show exit modal ──
  useEffect(() => {
    if (isSubmitted) return;
    // Push a dummy state so we can intercept popstate
    window.history.pushState({ quizActive: true }, '');

    const handlePopState = () => {
      // Re-push state to prevent actual navigation
      window.history.pushState({ quizActive: true }, '');
      setShowExitConfirm(true);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isSubmitted]);

  // ── Submit handler (GUEST SPECIFIC) ──
  const handleQuizSubmitAction = useCallback(() => {
    setShowSubmitConfirm(true);
  }, []);

  const handleConfirmSubmit = useCallback(() => {
    setShowSubmitConfirm(false);
    handleSubmit();
  }, [handleSubmit]);

  useEffect(() => {
    // Watch for isSubmitted change from useQuizLogic
    // When isSubmitted becomes true, we process and redirect
    if (isSubmitted) {
      // Exit fullscreen first
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }

      setIsProcessingResult(true);

      // Process score
      let earnedScore = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let skippedCount = 0;

      Object.entries(answers).forEach(([qId, ansIdx]) => {
        const q = questions.find((q) => q.id === qId);
        if (q) {
          if (answers[q.id] === undefined) {
            skippedCount++;
          } else if (q.correctAnswer === ansIdx) {
            earnedScore += QUIZ_CONSTANTS.MARKS_PER_QUESTION;
            correctCount++;
          } else {
            earnedScore -= QUIZ_CONSTANTS.NEGATIVE_MARKING;
            wrongCount++;
          }
        }
      });

      // Fix float precision
      earnedScore = parseFloat(earnedScore.toFixed(2));

      // 💾 Save to DB & Send Notification
      const savedGuestName = localStorage.getItem('mppsc_guest_name') || 'Guest User';
      
      recordGuestAttempt({
        testId,
        testTitle: title,
        guestName: savedGuestName,
        score: earnedScore,
        totalQuestions: questions.length,
        correctCount,
        wrongCount,
        timeTaken: timeLimitInMinutes * 60 - timeLeft,
      });

      // Save to store
      setResult({
        score: earnedScore,
        correctCount,
        wrongCount,
        skippedCount,
        totalQuestions: questions.length,
        timeTaken: timeLimitInMinutes * 60 - timeLeft,
        questions, // Store questions for proper result display
        answers,
        questionTimes, // Store per-question timing
        testId, // Pass testId from props
        title, // Pass title from props
      });

      // Prefetch results page for even faster transition
      router.prefetch('/guest-result');
      
      // Navigate instantly
      router.replace('/guest-result');
    }
  }, [isSubmitted, answers, questions, timeLimitInMinutes, timeLeft, router, questionTimes, setResult, testId, title]);

  // No local facts state needed — PYQFactsLoader bundles facts internally


  if (isProcessingResult || (isSubmitted && !isProcessingResult)) {
    return <PYQFactsLoader variant="page" label="Calculating your results..." theme="light" />;
  }

  // ── Palette props ──
  const paletteProps = {
    questions,
    answers,
    markedForReview: markedforReview,
    currentIndex: currentQuestionIndex,
    totalQuestions,
    onJump: handleJump,
    onSubmit: handleQuizSubmitAction,
    translations: {
      questionPalette: t.questionPalette,
      attempted: t.attempted,
      answered: t.answered,
      notAnswered: t.notAnswered,
      review: t.review,
      current: t.current,
      submitTest: t.submitTest,
    },
    timeLeft,
    language,
  };

  return (
    <div className="flex h-[100dvh] flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      {/* Fixed Header */}
      <QuizHeader
        title={title}
        mode={mode}
        timeLeft={timeLeft}
        instantModeEnabled={instantModeEnabled}
        isStrictInstantMode={false} // Removed strict lock
        isSubmitted={isSubmitted}
        language={language}
        onInstantModeToggle={() => {
          if (disableInstantMode) {
            toast('🔒 Pro Feature', {
              description: language === 'hi'
                ? 'Instant Mode सिर्फ Pro users के लिए है। Upgrade करें!'
                : 'Instant Mode is a Pro feature. Upgrade to unlock!',
            });
            return;
          }
          setInstantModeEnabled(!instantModeEnabled);
        }}
        onLanguageToggle={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
        onExit={showExitModal}
        translations={{
          instantMode: t.instantMode,
          fullTest: t.fullTest,
          topicPractice: t.topicPractice,
        }}
        paletteButton={!disablePalette ? <QuizPaletteMobile {...paletteProps} /> : undefined}
      />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <QuizQuestion
              question={currentQuestion}
              questionIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
              selectedAnswer={answers[currentQuestion.id]}
              isAnswered={isAnswered}
              instantModeEnabled={effectiveInstantMode}
              isMarkedForReview={markedforReview.includes(currentQuestion.id)}
              language={language}
              onOptionSelect={handleOptionSelect}
              onToggleReview={toggleMarkForReview}
              getParsedOptions={getParsedOptions}
              translations={{ question: t.question, markReview: t.markReview, unmark: t.unmark }}
              currentTimeSpent={activeQuestionTime}
            />

            {effectiveInstantMode && isAnswered && (
              <div className="mx-auto mt-4 max-w-3xl animate-in fade-in slide-in-from-top-4 duration-500">
                <QuizExplanation
                  question={currentQuestion}
                  language={language}
                  translations={{ explanation: t.explanation }}
                />
              </div>
            )}
          </div>

          <QuizNavigation
            currentIndex={currentQuestionIndex}
            totalQuestions={totalQuestions}
            onPrev={handlePrev}
            onNext={handleNext}
            onSubmit={handleQuizSubmitAction}
            translations={{ prev: t.prev, next: t.next, submit: t.submit }}
          />
        </main>

        {!disablePalette && <QuizPaletteDesktop {...paletteProps} />}
      </div>

      <QuizExitDialog
        open={showExitConfirm}
        onOpenChange={setShowExitConfirm}
        onCancel={handleExitCancel}
        onConfirmExit={handleConfirmedExit}
        translations={{
          quitConfirm: t.quitConfirm,
          quitDesc: t.quitDesc,
          cancel: t.cancel,
          yesExit: t.yesExit,
        }}
      />

      <GuestEntryDialog
        open={showGuestEntryDialog && !showExitConfirm}
        guestName={guestName}
        guestEmail={guestEmail}
        guestMobile={guestMobile}
        isSubmitting={false}
        onNameChange={setGuestName}
        onEmailChange={setGuestEmail}
        onMobileChange={setGuestMobile}
        onSubmit={handleGuestEntrySubmit}
        onExit={showExitModal}
      />

      <QuizSubmitDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        onConfirm={handleConfirmSubmit}
        stats={{
          attempted: Object.keys(answers).length,
          skipped: totalQuestions - Object.keys(answers).length,
          marked: markedforReview.length,
          total: totalQuestions,
        }}
        language={language}
      />
    </div>
  );
}
