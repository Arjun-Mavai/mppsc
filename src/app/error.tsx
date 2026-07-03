'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { RotateCcw, Home, CloudLightning, ArrowDown, BookOpen, PenTool, LifeBuoy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}

export default function Error({ error, reset, unstable_retry }: AppErrorProps) {
  const errorWithDigest = error;

  useEffect(() => {
    logger.error('App Error:', error);
  }, [error]);

  const handleRetry = () => {
    if (unstable_retry) {
      unstable_retry();
    } else {
      reset();
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5F5F7] p-4 font-sans selection:bg-slate-200 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-[28rem] overflow-hidden rounded-[2rem] border border-white/50 bg-white/80 p-6 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10"
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 shadow-sm sm:h-20 sm:w-20 sm:rounded-[1.5rem]">
          <CloudLightning className="h-8 w-8 text-slate-700 animate-[pulse_2s_ease-in-out_infinite] sm:h-10 sm:w-10" />
        </div>

        <h1 className="mb-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          Minor Glitch
        </h1>
        
        <p className="mb-6 text-sm font-semibold text-slate-600 sm:text-base">
          Our systems encountered a temporary hiccup.
        </p>

        {/* Motivational Quote - Brand Consistency */}
        <div className="mx-auto mb-8 max-w-xs rounded-2xl border border-slate-100 bg-slate-50/80 p-4 italic text-slate-500 shadow-inner">
          <p className="text-sm font-medium leading-relaxed">
            "Every setback is a setup for a stronger comeback. Let's get back to your preparation!"
          </p>
        </div>

        {errorWithDigest.digest && (
          <div className="mx-auto mb-6 max-w-fit rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5">
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400">
              ID: {errorWithDigest.digest}
            </p>
          </div>
        )}

        {/* Pointer Arrow */}
        <div className="mb-4 flex flex-col items-center justify-center text-slate-400 animate-bounce">
          <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
            Click here to refresh
          </span>
          <ArrowDown className="h-4 w-4" />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleRetry}
            className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh & Resume
          </Button>
          <Button
            variant="outline"
            asChild
            className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border-slate-200 bg-white text-sm font-bold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-slate-100" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
            Helpful Links
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>
        
        {/* Self-Service Options (Reduced Support Load & 85% Retention) */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/syllabus"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
          >
            <BookOpen className="h-3.5 w-3.5 text-slate-400" />
            Syllabus Hub
          </Link>
          <Link
            href="/mains"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900"
          >
            <PenTool className="h-3.5 w-3.5 text-slate-400" />
            Mains Gyankosh
          </Link>
          <Link
            href="/contact"
            className="col-span-1 flex items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-600 transition-colors hover:border-slate-200 hover:bg-slate-100 hover:text-slate-900 sm:col-span-2"
          >
            <LifeBuoy className="h-3.5 w-3.5 text-slate-400" />
            Raise Support Ticket
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
