'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
  unstable_retry?: () => void;
}

export default function GlobalError({ error, reset, unstable_retry }: GlobalErrorProps) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  const handleRetry = () => {
     if (unstable_retry) {
       unstable_retry();
     } else {
       reset();
     }
   };

  return (
    <html lang="en">
      <body>
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

            <button
              onClick={handleRetry}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] active:scale-95"
            >
              <RotateCcw className="h-4 w-4" />
              Refresh & Resume
            </button>
          </motion.div>
        </div>
      </body>
    </html>
  );
}
