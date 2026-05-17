import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Question } from '@/types/quiz';
import { logger } from '@/lib/logger';
import { QUIZ_CONSTANTS } from '@/config/quiz';
import { parseQuestionOptions } from '@/features/tests/utils/questionFormatter';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 QUIZ LOGIC HOOK (useQuizLogic)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Bhai, yeh hook hai POORA quiz ka dimaag! 🧠
// Quiz play karne ke liye jo bhi chahiye, sab yahi se milega:
// - Questions navigate karna (Next/Prev/Jump)
// - Answers store karna
// - Timer chalana
// - Time track karna (har question pe kitna laga)
// - Mark for Review
// - Submit karna
//
// Think of it as: Quiz Ka Remote Control 🎮
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface UseQuizLogicProps {
  questions: Question[]; // Saare questions ka array
  mode: 'topic' | 'full' | 'pyq'; // Kis type ka quiz hai
  timeLimitInMinutes: number; // Kitne minute ka test hai
  testId: string; // Test ki unique ID
  userId: string | null; // User ki ID (guest हो to empty/null)
  onRetry?: () => void; // Retry button callback
  isInstantMode?: boolean; // Instant feedback mode (turant correct/wrong dikhana)
  title?: string; // Test Title for notifications
}

export function useQuizLogic({
  questions,
  mode,
  timeLimitInMinutes,
  testId,
  userId,
  onRetry,
  isInstantMode = false,
  title,
}: UseQuizLogicProps) {
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📱 STATE MANAGEMENT (Quiz ka poora state yahan hai)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // Language preference (Hindi/English) from global store
  const { language } = useSettingsStore();

  // ───────────────────────────────────────────────────────────────
  // 🎮 NAVIGATION STATE (Kaunsa question dikhana hai)
  // ───────────────────────────────────────────────────────────────
  // Current question index (0 se start, questions.length-1 tak jayega)
  // Example: 0 means Question 1, 1 means Question 2, etc.
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // ───────────────────────────────────────────────────────────────
  // ✏️ ANSWERS STATE (User ne kya select kiya)
  // ───────────────────────────────────────────────────────────────
  // Structure: { questionId: selectedOptionIndex }
  // Example: { "q-001": 2, "q-002": 0 }
  //          Question 1 me user ne option C (index 2) select kiya
  //          Question 2 me user ne option A (index 0) select kiya
  const [answers, setAnswers] = useState<Record<string, number>>({});

  // ───────────────────────────────────────────────────────────────
  // 🏁 MARKED FOR REVIEW (Baad me dekhne wale questions)
  // ───────────────────────────────────────────────────────────────
  // Array of question IDs that user marked for review
  // Example: ["q-005", "q-012"] → Question 5 aur 12 marked hain
  const [markedforReview, setMarkedForReview] = useState<string[]>([]);

  // ───────────────────────────────────────────────────────────────
  // 🎯 SUBMISSION STATE (Test submit ho gaya ya nahi)
  // ───────────────────────────────────────────────────────────────
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ───────────────────────────────────────────────────────────────
  // 💡 INSTANT MODE (Turant feedback on/off)
  // ───────────────────────────────────────────────────────────────
  const [instantModeEnabled, setInstantModeEnabled] = useState(isInstantMode);

  // ───────────────────────────────────────────────────────────────
  // ⏱️ TIMER STATE (Kitna time bacha hai)
  // ───────────────────────────────────────────────────────────────
  // Time in seconds (timeLimitInMinutes × 60)
  // Example: 20 minutes = 20 × 60 = 1200 seconds
  // Har second -1 hota rahega, 0 pe test auto-submit
  const [timeLeft, setTimeLeft] = useState(timeLimitInMinutes * 60);

  // ───────────────────────────────────────────────────────────────
  // 📊 TIME TRACKING (Har question pe kitna time laga)
  // ───────────────────────────────────────────────────────────────
  // Structure: { questionId: timeInSeconds }
  // Example: { "q-001": 45, "q-002": 30 }
  //          Question 1 pe 45 seconds laga, Question 2 pe 30 seconds
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [activeQuestionTime, setActiveQuestionTime] = useState(0);

  // ───────────────────────────────────────────────────────────────
  // 🕒 TIME REFERENCE (Jab question start hua tha)
  // ───────────────────────────────────────────────────────────────
  // useRef because we don't want re-renders when this changes
  // Stores timestamp when user started viewing current question
  const questionStartTimeRef = useRef<number>(0);

  useEffect(() => {
    questionStartTimeRef.current = Date.now();
  }, []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔧 HELPER FUNCTIONS (Internal utilities)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * saveCurrentQuestionTime
   * ─────────────────────────────────────────────────────────────
   * Bhai, jab bhi question change ho (Next/Prev/Jump), iss function
   * se current question pe kitna time laga wo save kar lete hain.
   *
   * Flow:
   * 1. Current time - Start time = Kitna time laga
   * 2. Existing time + New time = Total time on this question
   * 3. Reset start time for next question
   *
   * Why useCallback?
   * - Performance optimization
   * - Function reference same rahega, unnecessary re-renders nahi
   */
  const saveCurrentQuestionTime = useCallback(() => {
    const now = Date.now();
    const duration = (now - questionStartTimeRef.current) / 1000; // milliseconds → seconds
    const qId = questions[currentQuestionIndex].id;

    setQuestionTimes((prev) => ({
      ...prev,
      [qId]: (prev[qId] || 0) + duration, // Add to existing time
    }));

    // Reset reference for next question
    questionStartTimeRef.current = now;
  }, [questions, currentQuestionIndex]);

  /**
   * getParsedOptions
   * ─────────────────────────────────────────────────────────────
   * Bhai, options kabhi array hote hain, kabhi JSON string.
   * Yeh function safely parse karke array return karta hai.
   *
   * Why needed?
   * - Database se kabhi string aata hai: '[{...}, {...}]'
   * - Component ko array chahiye
   * - Agar invalid ho to empty array return (crash nahi hoga)
   */
  const getParsedOptions = useCallback((opts: unknown) => parseQuestionOptions(opts), []);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🎬 ACTION HANDLERS (User interactions)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  // ───────────────────────────────────────────────────────────────
  // 🏁 FEEDBACK STATE (Does user need to give feedback?)
  // ───────────────────────────────────────────────────────────────
  const [needsFeedback, setNeedsFeedback] = useState(false);

  // 🛡️ REFS for stable handleSubmit (Prevents timer drift)
  const timeLeftRef = useRef(timeLeft);
  const answersRef = useRef(answers);

  useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  /**
   * handleSubmit
   * ─────────────────────────────────────────────────────────────
   * Bhai, sabse important function! Submit button ka logic.
   *
   * Flow:
   * 1. Mark test as submitted (UI updates)
   * 2. Save last question's time
   * 3. CHECK FEEDBACK: Has user given feedback on this device?
   * 4. For logged-in users, call API to save attempt
   * 5. Handle errors gracefully
   */
  const handleSubmit = useCallback(async () => {
    if (isSubmitting || isSubmitted) return;

    setIsSubmitting(true);

    // ───────────────────────────────────────────────────────
    // 🛡️ PRINCIPAL CHECK: Should we show feedback?
    // ───────────────────────────────────────────────────────
    const checkFeedback = async () => {
      try {
        const { safeStorage } = await import('@/lib/utils/persistence');
        const { hasUserSubmittedFeedback } = await import('@/app/actions/feedback');
        
        // 1. Check LocalStorage (Global for device)
        if (safeStorage.getItem('mppsc_feedback_given') === 'true') return false;

        // 2. For logged-in users, check database
        if (userId) {
          const submitted = await hasUserSubmittedFeedback();
          if (submitted) {
            safeStorage.setItem('mppsc_feedback_given', 'true');
            return false;
          }
        }
        return true; // Feedback required
      } catch (e) {
        return true; // Default to showing if error
      }
    };

    const feedbackRequired = await checkFeedback();
    if (feedbackRequired) {
      setNeedsFeedback(true);
    }

    // Guest user? No DB save, just show results
    if (!userId) {
      setIsSubmitted(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const { submitTestAttempt } = await import('@/features/tests/actions/submission');

      // ───────────────────────────────────────────────────────
      // 📝 FORMAT ANSWERS (NUMBER → STRING for database)
      // ───────────────────────────────────────────────────────
      const currentAnswers = answersRef.current;
      const formattedAnswers: Record<string, string> = {};
      Object.entries(currentAnswers).forEach(([qId, optIdx]) => {
        formattedAnswers[qId] = String(optIdx);
      });

      // ───────────────────────────────────────────────────────
      // ⏱️ CALCULATE FINAL TIME (Last question ka time add karo)
      // ───────────────────────────────────────────────────────
      const now = Date.now();
      const duration = (now - questionStartTimeRef.current) / 1000;
      const currentQId = questions[currentQuestionIndex]?.id;

      const finalTimes = { ...questionTimes };
      if (currentQId) {
        finalTimes[currentQId] = (finalTimes[currentQId] || 0) + duration;
      }

      // ───────────────────────────────────────────────────────
      // 💾 SAVE TO DATABASE
      // ───────────────────────────────────────────────────────
      await submitTestAttempt(
        testId,
        userId,
        formattedAnswers,
        timeLimitInMinutes * 60 - timeLeftRef.current, // Total time taken
        finalTimes,
        title
      );
    } catch (error) {
      logger.error('Failed to save test attempt:', error, {
        category: 'ui',
        metadata: { testId, userId, questionsCount: questions.length },
      });
    } finally {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }
  }, [
    questions,
    currentQuestionIndex,
    questionTimes,
    testId,
    userId,
    timeLimitInMinutes,
    isSubmitting,
    isSubmitted,
    title,
  ]);

  /**
   * handleOptionSelect
   * ─────────────────────────────────────────────────────────────
   * Bhai, jab user kisi option pe click kare.
   *
   * Flow:
   * 1. Current question ki ID nikaalo
   * 2. Selected option index save karo
   * 3. Purane answer ko overwrite kar do (answer change allowed)
   *
   * Example:
   * User clicks Option C (index 2) on Question 5
   * answers = { ...prev, "q-005": 2 }
   */
  const handleOptionSelect = useCallback(
    (optionIndex: number) => {
      setAnswers((prev) => ({
        ...prev,
        [questions[currentQuestionIndex].id]: optionIndex,
      }));
    },
    [questions, currentQuestionIndex]
  );

  /**
   * handleNext
   * ─────────────────────────────────────────────────────────────
   * Bhai, "Next" button ka logic.
   *
   * Flow:
   * 1. Current question ka time save karo
   * 2. Agar last question nahi hai, to aage badho
   * 3. Index +1 kar do
   *
   * UI Impact:
   * - Next question display hoga
   * - Progress bar update hoga
   */
  const handleNext = useCallback(() => {
    saveCurrentQuestionTime();
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      const nextQId = questions[nextIndex]?.id;
      // ⚡ Instant Sync: Set time for the next question immediately
      setActiveQuestionTime(Math.round(questionTimes[nextQId] || 0));
      setCurrentQuestionIndex(nextIndex);
    }
  }, [currentQuestionIndex, questions, saveCurrentQuestionTime, questionTimes]);

  /**
   * handlePrev
   * ─────────────────────────────────────────────────────────────
   * Bhai, "Previous" button ka logic.
   *
   * Flow:
   * 1. Current question ka time save karo
   * 2. Agar first question nahi hai, to peeche jao
   * 3. Index -1 kar do
   */
  const handlePrev = useCallback(() => {
    saveCurrentQuestionTime();
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      const prevQId = questions[prevIndex]?.id;
      // ⚡ Instant Sync: Set time for the previous question immediately
      setActiveQuestionTime(Math.round(questionTimes[prevQId] || 0));
      setCurrentQuestionIndex(prevIndex);
    }
  }, [currentQuestionIndex, questions, saveCurrentQuestionTime, questionTimes]);

  /**
   * handleJump
   * ─────────────────────────────────────────────────────────────
   * Bhai, question palette se directly kisi question pe jaana.
   *
   * Flow:
   * 1. Current time save karo
   * 2. Directly us index pe jump karo
   *
   * Example:
   * User clicks Question 15 in palette
   * currentQuestionIndex = 14 (0-indexed)
   */
  const handleJump = useCallback(
    (index: number) => {
      saveCurrentQuestionTime();
      const targetQId = questions[index]?.id;
      // ⚡ Instant Sync: Set time for the target question immediately
      setActiveQuestionTime(Math.round(questionTimes[targetQId] || 0));
      setCurrentQuestionIndex(index);
    },
    [saveCurrentQuestionTime, questions, questionTimes]
  );

  /**
   * toggleMarkForReview
   * ─────────────────────────────────────────────────────────────
   * Bhai, "Mark for Review" checkbox ka toggle.
   *
   * Flow:
   * 1. Current question ki ID nikaalo
   * 2. Agar already marked hai → Unmark karo (remove from array)
   * 3. Agar not marked → Mark karo (add to array)
   *
   * UI Impact:
   * - Palette me color change (yellow/amber)
   * - "Marked for Review" badge
   */
  const toggleMarkForReview = useCallback(() => {
    const currentId = questions[currentQuestionIndex].id;
    setMarkedForReview(
      (prev) =>
        prev.includes(currentId)
          ? prev.filter((id) => id !== currentId) // Remove if exists
          : [...prev, currentId] // Add if doesn't exist
    );
  }, [questions, currentQuestionIndex]);

  /**
   * handleRetry
   * ─────────────────────────────────────────────────────────────
   * Bhai, test dobara dena (fresh start).
   *
   * Flow:
   * 1. Agar parent ne onRetry diya hai → Use that (page reload)
   * 2. Nahi to local reset (state clear kar do)
   *
   * Reset kya kya:
   * - Saare answers
   * - Marked questions
   * - Timer
   * - Current question index
   * - Submission status
   */
  const handleRetry = useCallback(() => {
    if (onRetry) {
      onRetry(); // Parent component handles refresh
    } else {
      // Local reset fallback
      setAnswers({});
      setMarkedForReview([]);
      setTimeLeft(timeLimitInMinutes * 60);
      setCurrentQuestionIndex(0);
      setIsSubmitted(false);
      setQuestionTimes({});
      questionStartTimeRef.current = Date.now();
    }
  }, [onRetry, timeLimitInMinutes]);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // ⚡ SIDE EFFECTS (useEffect hooks)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  /**
   * EFFECT 1: Reset State on Test Change
   * ─────────────────────────────────────────────────────────────
   * Bhai, jab user nayi test start kare, purani state clean karni hai.
   *
   * Why needed?
   * - Purani test ke answers dikhai denge (BUG!)
   * - Timer reset nahi hoga
   * - Wrong results dikhenge
   *
   * When runs?
   * - Component mount pe (first time)
   * - Jab testId change ho (new test selected)
   *
   * What resets?
   * - Answers (empty object)
   * - Marked questions (empty array)
   * - Timer (full time)
   * - Question index (start from 0)
   * - Submission status (false)
   * - Question times (empty)
   */
  useEffect(() => {
    // 🛡️ Optimization: Only reset if not already reset to avoid cascading renders
    if (Object.keys(answers).length > 0) setAnswers({});
    if (markedForReview.length > 0) setMarkedForReview([]);

    // 🛡️ SECURITY FIX: Always use server-defined time limit
    const targetTime = timeLimitInMinutes * 60;
    if (timeLeft !== targetTime) setTimeLeft(targetTime);

    if (currentQuestionIndex !== 0) setCurrentQuestionIndex(0);
    if (isSubmitted) setIsSubmitted(false);
    if (Object.keys(questionTimes).length > 0) setQuestionTimes({});
    
    questionStartTimeRef.current = Date.now();
  }, [testId, timeLimitInMinutes]);

  /**
   * EFFECT 2: Timer Logic
   * ─────────────────────────────────────────────────────────────
   * Bhai, yeh countdown timer hai. Har second -1 hota rahega.
   */
  useEffect(() => {
    // Agar test submit ho gaya, timer band karo
    if (isSubmitted) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Auto-submit when time is UP
          if (!isSubmitted) {
            handleSubmit();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isSubmitted, handleSubmit]);

  /**
   * EFFECT 3: Per-Question Real-time Clock
   * Separate from timer to avoid interval restarts on question change.
   */
  useEffect(() => {
    if (isSubmitted) return;
    const interval = setInterval(() => {
      if (questionStartTimeRef.current) {
        const duration = (Date.now() - questionStartTimeRef.current) / 1000;
        const qId = questions[currentQuestionIndex]?.id;
        const previouslySpent = qId ? (questionTimes[qId] || 0) : 0;
        setActiveQuestionTime(Math.round(previouslySpent + duration));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSubmitted, currentQuestionIndex, questions, questionTimes]);


  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📤 RETURN STATEMENT (Hook ka output)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //
  // Bhai, component ko yeh sab milega is hook se:
  // 1. State values (current data)
  // 2. Action handlers (user interactions)
  // 3. Helper functions (utilities)
  // 4. Derived values (calculated on-the-fly)

  return {
    // ───────────────────────────────────────────────────────────
    // 📊 STATE VALUES
    // ───────────────────────────────────────────────────────────
    currentQuestionIndex, // Which question user is seeing (0-indexed)
    answers, // User's selected answers { questionId: optionIndex }
    markedforReview, // Question IDs marked for review
    isSubmitted, // Has test been submitted?
    isSubmitting, // Is test currently submitting?
    timeLeft, // Seconds remaining
    instantModeEnabled, // Is instant feedback ON?
    language, // Current language (hi/en)
    questionTimes, // ⏱️ Time spent per question { questionId: seconds }
    activeQuestionTime, // 🕒 Real-time display for current question
    needsFeedback, // Feedback requirement
    setNeedsFeedback, // Manual control for feedback modal

    // ───────────────────────────────────────────────────────────
    // 🎮 ACTION HANDLERS
    // ───────────────────────────────────────────────────────────
    setInstantModeEnabled, // Toggle instant mode
    handleOptionSelect, // User clicks an option
    handleNext, // Next button
    handlePrev, // Previous button
    handleJump, // Jump to specific question
    toggleMarkForReview, // Toggle review flag
    handleSubmit, // Submit test
    handleRetry, // Retry/Restart test

    // ───────────────────────────────────────────────────────────
    // 🔧 HELPER FUNCTIONS
    // ───────────────────────────────────────────────────────────
    getParsedOptions, // Parse options safely

    // ───────────────────────────────────────────────────────────
    // 📈 DERIVED VALUES (Calculated, not stored in state)
    // ───────────────────────────────────────────────────────────
    currentQuestion: questions[currentQuestionIndex] || {}, // Current question object
    isAnswered: questions[currentQuestionIndex]
      ? answers[questions[currentQuestionIndex].id] !== undefined
      : false, // Has user answered current question?
    totalQuestions: questions.length, // Total number of questions
  };
}
