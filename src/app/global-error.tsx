'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';
import { RotateCcw, CloudLightning, ArrowDown } from 'lucide-react';
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
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#F5F5F7] p-6 font-sans selection:bg-slate-200">
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/50 bg-white/80 p-8 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-xl sm:p-10"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-slate-100 shadow-sm">
              <CloudLightning className="h-10 w-10 text-slate-700 animate-[pulse_2s_ease-in-out_infinite]" />
            </div>

            <h1 className="mb-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Minor Glitch
            </h1>
            
            <p className="mb-2 text-base font-semibold text-slate-700">
              We encountered a temporary hiccup.
            </p>
            <p className="mb-8 text-sm leading-relaxed text-slate-500">
              (कोई बात नहीं! सिस्टम में एक छोटी सी तकनीकी रुकावट आई है, आप पेज रिफ्रेश करके अपनी तैयारी जारी रख सकते हैं।)
            </p>

            {/* Pointer Arrow */}
            <div className="mb-4 flex flex-col items-center justify-center text-slate-400 animate-bounce">
              <span className="mb-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Click here to refresh
              </span>
              <ArrowDown className="h-4 w-4" />
            </div>

            <button
              onClick={handleRetry}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-sm font-bold text-white transition-all hover:bg-black hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] active:scale-95"
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
