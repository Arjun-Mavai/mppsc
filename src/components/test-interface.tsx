'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { submitTestAttempt } from '@/features/tests/actions/submission';
import { Clock, ChevronLeft, ChevronRight, Menu, X, Flag } from 'lucide-react';

// Types (simplified import or redefine)
type Question = {
  id: string;
  questionText: string;
  options: any; // JSON
  marks: number;
};

type Test = {
  id: string;
  title: string;
  durationMinutes: number;
  slug: string;
};

export default function TestInterface({ test, questions }: { test: Test; questions: Question[] }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentInfo, setCurrentInfo] = useState(true); // Show instructions first
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [userReview, setUserReview] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(test.durationMinutes * 60);
  const [submitting, setSubmitting] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false); // Mobile sidebar

  const handleSubmit = async () => {
    if (submitting) return;
    const confirm = window.confirm('Are you sure you want to submit the test?');
    if (!confirm && timeLeft > 0) return;

    setSubmitting(true);
    const timeTaken = test.durationMinutes * 60 - timeLeft;

    // TODO: get user ID from session context if available, else 'anonymous'
    const res = await submitTestAttempt(test.id, 'user-123', answers, timeTaken, {});

    if (res.success) {
      toast.success('Test Submitted Successfully!');
      // Redirect to analysis
      // We assume /tests/[slug]/analysis?attemptId=...
      // Or just store attemptId in local storage and fetch latest
      router.push(`/tests/${test.slug}/analysis?attemptId=${res.attemptId}`);
    } else {
      toast.error('Submission Failed: ' + res.error);
      setSubmitting(false);
    }
  };

  const handleStart = () => {
    setCurrentInfo(false);
    setStarted(true);
    toast.success('Test Started! Good Luck.');
  };

  const handleAnswer = (option: string) => {
    const qId = questions[currentQuestionIndex].id;
    setAnswers((prev) => ({ ...prev, [qId]: option }));
  };

  const handleClear = () => {
    const qId = questions[currentQuestionIndex].id;
    const newAns = { ...answers };
    delete newAns[qId];
    setAnswers(newAns);
  };

  const toggleReview = () => {
    const qId = questions[currentQuestionIndex].id;
    setUserReview((prev) => {
      const next = new Set(prev);
      if (next.has(qId)) next.delete(qId);
      else next.add(qId);
      return next;
    });
  };

  // Timer
  useEffect(() => {
    if (!started || submitting) return;
    if (timeLeft <= 0) {
      handleSubmit(); // Auto submit
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [started, timeLeft, submitting, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (currentInfo) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-6 dark:bg-neutral-950">
        <div className="w-full max-w-2xl space-y-8 text-center">
          <h1 className="text-3xl font-bold">{test.title}</h1>
          <div className="space-y-4 rounded-2xl bg-neutral-50 p-8 text-left dark:bg-neutral-900">
            <h3 className="text-lg font-semibold">Instructions:</h3>
            <ul className="list-inside list-disc space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Total Duration: {test.durationMinutes} Minutes</li>
              <li>Total Questions: {questions.length}</li>
              <li>Each question carries marks. Negative marking applies.</li>
              <li>Don't refresh the page.</li>
            </ul>
          </div>
          <Button size="lg" onClick={handleStart} className="w-full">
            Start Test Now
          </Button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];
  const qId = currentQ.id;
  const isAnswered = !!answers[qId];
  const isReviewed = userReview.has(qId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-neutral-50 dark:bg-neutral-950">
      {/* Header */}
      <header className="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 shadow-sm lg:px-8 dark:border-neutral-800 dark:bg-neutral-900">
        <h2 className="max-w-xs truncate font-bold">{test.title}</h2>

        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-mono font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}
          >
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="destructive" size="sm" onClick={handleSubmit}>
            Submit Test
          </Button>
          <button className="lg:hidden" onClick={() => setIsPaletteOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="mx-auto max-w-3xl space-y-6">
            <div className="flex items-center justify-between text-sm text-neutral-500">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span>Marks: {currentQ.marks}</span>
            </div>

            <div className="flex min-h-[300px] flex-col justify-center rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm lg:p-10 dark:border-neutral-800 dark:bg-neutral-900">
              <p className="mb-8 text-lg leading-relaxed font-medium lg:text-xl">
                {currentQ.questionText}
              </p>

              <div className="w-full space-y-3">
                {(currentQ.options as string[]).map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(opt)}
                    className={`w-full rounded-xl border p-4 text-left transition-all ${
                      answers[qId] === opt
                        ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                        : 'border-transparent bg-neutral-50 hover:bg-neutral-100 dark:bg-neutral-800 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <span className="mr-2 inline-block w-6 font-bold opacity-70">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pb-10">
              <Button
                variant="secondary"
                onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Previous
              </Button>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={handleClear} disabled={!isAnswered}>
                  Clear
                </Button>
                <Button
                  variant={isReviewed ? 'default' : 'outline'}
                  onClick={toggleReview}
                  className="gap-2"
                >
                  <Flag className="h-4 w-4" /> {isReviewed ? 'Unmark' : 'Review'}
                </Button>
              </div>

              <Button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1))
                }
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </main>

        {/* Question Palette Sidebar */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-80 transform border-l border-neutral-200 bg-white transition-transform duration-300 dark:border-neutral-800 dark:bg-neutral-900 ${isPaletteOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col lg:relative lg:w-72 lg:translate-x-0`}
        >
          <div className="flex items-center justify-between border-b bg-gray-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <h3 className="font-bold">Question Palette</h3>
            <button className="lg:hidden" onClick={() => setIsPaletteOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid flex-1 auto-rows-[40px] grid-cols-5 content-start gap-2 overflow-y-auto p-4">
            {questions.map((q, idx) => {
              const ans = !!answers[q.id];
              const rev = userReview.has(q.id);
              let colorClass =
                'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'; // default not visited/answered
              if (idx === currentQuestionIndex) {
                // Highlight current
                colorClass =
                  'ring-2 ring-blue-500 ring-offset-2 z-10 font-bold bg-white dark:bg-neutral-700';
              } else {
                if (ans) colorClass = 'bg-green-100 text-green-700 border border-green-300';
                if (rev) colorClass = 'bg-purple-100 text-purple-700 border border-purple-300';
                if (ans && rev)
                  colorClass = 'bg-purple-100 text-purple-700 border-purple-500 border-2 relative';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentQuestionIndex(idx);
                    setIsPaletteOpen(false);
                  }}
                  className={`flex h-9 w-full items-center justify-center rounded-md text-sm font-medium transition-all ${colorClass}`}
                >
                  {idx + 1}
                  {ans && rev && (
                    <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="space-y-2 border-t bg-gray-50 p-4 text-xs dark:border-neutral-800 dark:bg-neutral-950">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-green-300 bg-green-100"></div> Answered
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded border border-purple-300 bg-purple-100"></div> Review
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-neutral-100"></div> Not Answered
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
