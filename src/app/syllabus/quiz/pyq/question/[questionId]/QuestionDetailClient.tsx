'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useSettingsStore } from '@/store/useSettingsStore';
import { StructuredExplanation } from '@/components/StructuredExplanation';
import { cn } from '@/lib/utils';

interface QuestionDetailClientProps {
  question: {
    id: string;
    text: string;
    textEn: string | null;
    options: unknown;
    correctAnswer: string;
    explanation: string | null;
    explanationEn: string | null;
    extendedData?: unknown;
    testId: string;
  };
  year?: number;
}

export default function QuestionDetailClient({
  question,
  year,
}: QuestionDetailClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const rawOptions =
    typeof question.options === 'string' ? JSON.parse(question.options) : question.options;

  // Normalize options to object format if they are strings
  const options = Array.isArray(rawOptions) 
    ? rawOptions.map((opt: any, idx: number) => {
        if (typeof opt === 'string') {
            return { id: opt, text: opt };
        }
        return opt;
    })
    : [];

  const isNumericIndex = (val: string) => /^\d+$/.test(val);

  // Helper to check if an option is the correct answer
  // Helper to check if an option is the correct answer
  const isCorrectOption = (opt: any, idx: number) => {
      // Logic mirrored from QuizPlayPage & QuizQuestion (Instant Mode)
      // 1. Try to parse as numeric index (handles "1", "1.0", 1)
      const numericCorrect = Number(question.correctAnswer);
      if (!isNaN(numericCorrect) && numericCorrect === idx) {
          return true;
      }

      // 2. Fallback: Direct string match (for legacy text-based answers)
      // This handles cases where answer might be "A" or exact text match
      const ansString = question.correctAnswer?.toString().trim();
      if (ansString && (opt.id === ansString || opt.text === ansString)) {
          return true;
      }

      return false;
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20 text-white selection:bg-indigo-500/30">
        {/* Background Effects - Matching Intelligence Page */}
        <div className="fixed inset-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[100px]" />
            <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-20" />
        </div>

      {/* Header */}
      <div className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/60">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="-ml-2 rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded bg-slate-800 text-xs font-mono text-slate-400">
                Q
              </span>
              {isHindi ? 'प्रश्न विश्लेषण' : 'Question Analysis'}
            </h1>
            {year && (
                <Badge variant="outline" className="font-mono text-slate-500 border-slate-700 bg-slate-900/50">
                    {year}
                </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Question Card */}
        <div className="relative">
             <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-slate-700 to-slate-800 opacity-50 blur"></div>
            <Card className="relative overflow-hidden rounded-2xl border-slate-800 bg-slate-900 shadow-2xl">
            <CardContent className="p-6 sm:p-10"> {/* Increased padding for better internal spacing */}
                {/* Question Text - REDESIGNED for Breathing Space */}
                <div className="mb-10 space-y-6">
                    <div className="flex flex-col gap-4">
                        <h2 className="text-xl sm:text-2xl leading-loose font-bold text-white tracking-tight">
                            {question.text}
                        </h2>
                        <div className="h-px w-20 bg-gradient-to-r from-indigo-500 to-transparent my-2"></div>
                    </div>
                
                {question.textEn && (
                    <div className="pl-6 border-l-2 border-slate-700 py-1">
                        <p className="text-lg leading-loose font-medium text-slate-300">
                        {question.textEn}
                        </p>
                    </div>
                )}
                </div>

                {/* Options - More spacing between options */}
                <div className="space-y-4">
                {options && options.map((opt: any, idx: number) => {
                    const isCorrect = isCorrectOption(opt, idx);

                    return (
                    <div
                        key={opt.id || idx}
                        className={cn(
                        "flex items-start gap-4 rounded-xl border p-4 transition-all duration-200",
                        isCorrect 
                            ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                            : "border-slate-800 bg-slate-950/50 hover:bg-slate-800 hover:border-slate-700"
                        )}
                    >
                        <div className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                        isCorrect 
                            ? "border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                            : "border-slate-700 text-slate-500 bg-slate-900"
                        )}>
                        {String.fromCharCode(65 + idx)}
                        </div>
                        <div className="space-y-1">
                        <p className={cn(
                            "text-sm font-medium",
                            isCorrect ? "text-emerald-400" : "text-slate-300"
                        )}>
                            {opt.text}
                        </p>
                        {opt.text_en && (
                            <p className={cn(
                            "text-xs",
                            isCorrect ? "text-emerald-400/70" : "text-slate-500"
                            )}>
                            {opt.text_en}
                            </p>
                        )}
                        </div>
                        {isCorrect && (
                        <CheckCircle2 className="ml-auto h-5 w-5 text-emerald-500" />
                        )}
                    </div>
                    );
                })}
                </div>
            </CardContent>
            </Card>
        </div>

        {/* Premium Explanation */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-black tracking-wider text-slate-500 uppercase">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 ring-1 ring-indigo-500/30">
              💡
            </span>
            {isHindi ? 'विस्तृत व्याख्या' : 'Detailed Explanation'}
          </h3>

          <div className="relative">
             <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur-lg"></div>
             <Card className="relative overflow-hidden rounded-2xl border-slate-800 bg-slate-900 shadow-2xl">
                <div className="border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent px-6 py-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                        Premium Analysis
                    </span>
                    <Badge variant="secondary" className="bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-none">
                    PRO
                    </Badge>
                </div>
                </div>
                <CardContent className="p-6 sm:p-8 text-slate-300">
                <StructuredExplanation
                  extendedData={question.extendedData}
                  plainExplanation={question.explanation || ''}
                  explanationEn={question.explanationEn}
                  explanationHi={question.explanation}
                  language={isHindi ? 'hi' : 'en'}
                />
                </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
