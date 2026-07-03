'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { logger } from '@/lib/logger';
import { RotateCcw, Home, Sparkles, ArrowRight } from 'lucide-react';
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
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-gradient-to-b from-slate-900 to-slate-800 p-6 font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur-xl sm:p-10"
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-indigo-500/30 bg-indigo-500/10 shadow-inner">
          <Sparkles className="h-10 w-10 text-indigo-400 animate-pulse" />
        </div>

        <h1 className="mb-3 text-2xl font-black tracking-tight text-white sm:text-3xl">
          Oops! Minor Glitch
        </h1>
        
        <p className="mb-2 text-base font-medium text-slate-300">
          Our systems encountered a temporary hiccup.
        </p>
        <p className="mb-8 text-sm leading-relaxed text-slate-400">
          (कोई बात नहीं! सिस्टम में एक छोटी सी तकनीकी रुकावट आई है, आप पेज रिफ्रेश करके अपनी तैयारी जारी रख सकते हैं।)
        </p>

        {errorWithDigest.digest && (
          <div className="mx-auto mb-8 max-w-fit rounded-lg border border-white/5 bg-black/20 px-4 py-2 backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">
              ID: {errorWithDigest.digest}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={handleRetry}
            className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-500 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh & Resume
          </Button>
          <Button
            variant="outline"
            asChild
            className="flex h-12 w-full flex-1 items-center justify-center gap-2 rounded-xl border-white/10 bg-transparent text-sm font-bold text-slate-300 transition-all hover:bg-white/5 hover:text-white active:scale-95"
          >
            <Link href="/">
              <Home className="h-4 w-4" />
              Go Home
            </Link>
          </Button>
        </div>
        
        <div className="mt-8">
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-500 uppercase transition-colors hover:text-slate-300"
          >
            Contact Support
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
