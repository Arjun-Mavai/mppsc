'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Star, CheckCircle2, ThumbsUp, ThumbsDown, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  feedbackFormSchema,
  feedbackQuestions,
  type FeedbackFormType,
} from '@/lib/schemas/feedback';

interface TestSeriesFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (data: FeedbackFormType) => Promise<void>;
  testSeriesId?: string;
}

export function TestSeriesFeedbackModal({
  isOpen,
  onClose,
  onSubmit,
}: TestSeriesFeedbackModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm<FeedbackFormType>({
    resolver: zodResolver(feedbackFormSchema),
    mode: 'onChange',
    defaultValues: {
      overallRating: 0,
    }
  });

  const formData = watch();

  // Auto-submit logic: When all required fields are filled, submit automatically
  useEffect(() => {
    const isReady = formData.overallRating > 0 && 
                  formData.difficultyLevel && 
                  formData.wouldRecommend && 
                  !isSubmitting && 
                  !isCompleted;

    if (isReady) {
      const timer = setTimeout(() => {
        handleSubmit(handleFormSubmit)();
      }, 600); // 600ms delay to give user time to react if they misclicked
      return () => clearTimeout(timer);
    }
  }, [formData.overallRating, formData.difficultyLevel, formData.wouldRecommend, isSubmitting, isCompleted, handleSubmit]);

  const handleFormSubmit = async (data: FeedbackFormType) => {
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      setIsCompleted(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md transition-all duration-500">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-[380px] overflow-hidden rounded-[2.5rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-2xl"
      >
        {/* Glow Effects */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-amber-500/10 blur-3xl" />

        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
                  <Zap className="h-6 w-6 fill-emerald-500" />
                </div>
                <h2 className="text-xl font-black tracking-tight text-white">
                  Quick Feedback
                </h2>
                <p className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                  Helps us improve in 2 clicks
                </p>
              </div>

              <form className="space-y-8">
                {feedbackQuestions.map((question) => (
                  <div key={question.id} className="space-y-4">
                    <label className="block text-center text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                      {question.label}
                    </label>

                    {/* STARS */}
                    {question.type === 'stars' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => field.onChange(star)}
                                className="group relative transition-all duration-300 hover:scale-125 active:scale-95"
                              >
                                {star <= field.value && (
                                  <motion.div
                                    layoutId="star-glow"
                                    className="absolute inset-0 bg-amber-400/20 blur-md rounded-full"
                                  />
                                )}
                                <Star
                                  size={32}
                                  className={cn(
                                    "transition-all duration-300",
                                    star <= field.value
                                      ? "fill-amber-400 text-amber-400 scale-110"
                                      : "text-slate-700 group-hover:text-slate-500"
                                  )}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    )}

                    {/* RADIO CHIPS */}
                    {question.type === 'radio' && (
                      <Controller
                        name={question.name}
                        control={control}
                        render={({ field }) => (
                          <div className="flex flex-wrap justify-center gap-2">
                            {question.options?.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => field.onChange(option.value)}
                                className={cn(
                                  "relative flex h-11 items-center justify-center rounded-2xl border px-4 text-xs font-black transition-all duration-300 active:scale-95",
                                  field.value === option.value
                                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                                    : "border-white/5 bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                                )}
                              >
                                {option.label}
                                {field.value === option.value && (
                                  <motion.div
                                    layoutId={`${question.id}-active`}
                                    className="absolute inset-0 rounded-2xl border-2 border-emerald-500/50"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                  />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      />
                    )}
                  </div>
                ))}

                {isSubmitting && (
                  <div className="flex justify-center pt-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="h-6 w-6 rounded-full border-2 border-emerald-500 border-t-transparent"
                    />
                  </div>
                )}
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center"
            >
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[2.5rem] bg-emerald-500/20 text-emerald-500">
                <CheckCircle2 size={48} className="fill-emerald-500/20" />
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white">
                Awesome!
              </h3>
              <p className="mt-2 text-sm font-bold tracking-widest text-emerald-500/60 uppercase">
                Feedback Captured
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/**
 * HOW TO USE IN YOUR COMPONENT:
 *
 * const [feedbackOpen, setFeedbackOpen] = useState(false)
 *
 * <TestSeriesFeedbackModal
 *   isOpen={feedbackOpen}
 *   onClose={() => setFeedbackOpen(false)}
 *   onSubmit={async (data) => {
 *     const response = await fetch('/api/feedback', {
 *       method: 'POST',
 *       headers: { 'Content-Type': 'application/json' },
 *       body: JSON.stringify(data)
 *     })
 *     if (!response.ok) throw new Error('Failed to submit')
 *   }}
 * />
 */
