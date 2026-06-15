'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🆓 FREE QUIZ PLAY CLIENT — GuestQuizInterface ka wrapper
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Existing GuestQuizInterface ko seedha reuse karo
// Exit pe /free-quiz pe wapas bhejo
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { Question } from '@/types/quiz';
import { QUIZ_CONSTANTS } from '@/config/quiz';

// Dynamic import — same as existing QuizPlayClient
const GuestQuizInterface = dynamic(
  () =>
    import('@/features/tests/components/GuestQuizInterface').then(
      (mod) => mod.GuestQuizInterface
    ),
  {
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-slate-700" />
          <p className="font-medium text-slate-500">Loading Quiz...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

interface FreeQuizPlayClientProps {
  questions: Question[];
  testId: string;
  title: string;
  disableInstantMode?: boolean; // Tags se control — Pro feature lock
  isInstantMode?: boolean;
  user?: { name: string; email: string; mobile?: string | null } | null;
}

export function FreeQuizPlayClient({
  questions,
  testId,
  title,
  disableInstantMode,
  isInstantMode,
  user,
}: FreeQuizPlayClientProps) {
  const router = useRouter();

  return (
    <GuestQuizInterface
      questions={questions}
      mode="topic"
      testId={testId}
      title={title}
      timeLimitInMinutes={Math.ceil(
        questions.length * QUIZ_CONSTANTS.TIME_PER_QUESTION_MINUTES
      )}
      disableInstantMode={disableInstantMode}
      isInstantMode={isInstantMode}
      user={user}
      onExit={() => router.push('/free-quiz')}
    />
  );
}
