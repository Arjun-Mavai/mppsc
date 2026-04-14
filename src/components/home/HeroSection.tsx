'use client';

import { useTransition } from 'react';
import { Sparkles, Zap, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';

export function HeroSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { language, user: globalUser } = useSettingsStore();

  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#02040a] px-4 py-20 selection:bg-amber-500/30 md:px-6">
      
      {/* 🔮 3D PERSPECTIVE ARCHITECTURE (Pure CSS - 100% Performance) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {/* The "Infinite Floor" Grid */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{
            backgroundImage: `linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)`,
            backgroundSize: '4rem 4rem',
            maskImage: 'radial-gradient(circle at 50% 50%, black, transparent 90%)',
            transform: 'perspective(1000px) rotateX(60deg) translateY(-100px) translateZ(-200px)',
            transformOrigin: 'top',
          }}
        />

        {/* Dynamic Light Orbs */}
        <div className="absolute top-1/4 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px]" />
        <div className="absolute top-0 left-1/2 h-[1px] w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent shadow-[0_0_50px_rgba(245,158,11,0.2)]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 flex w-full max-w-6xl flex-col items-center space-y-8 text-center"
      >
        {/* Status Badge - Floating Layer */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 text-[10px] font-black tracking-[0.2em] text-amber-500 uppercase backdrop-blur-md shadow-2xl transition-all hover:border-amber-500/30">
          <Sparkles size={12} className="animate-pulse" />
          {language === 'hi' ? 'MPPSC 2026 : फ्यूचर रेडी' : 'MPPSC 2026 : Future Ready'}
        </div>

        {/* Typography - The "Monolith" Headline */}
        <div className="space-y-4">
          <h1 className="font-display flex flex-col items-center gap-1 text-5xl font-black tracking-tighter text-white sm:text-7xl md:text-[9rem] md:leading-[0.85]">
            <span className="opacity-80">
               {language === 'hi' ? 'आपकी MPPSC' : 'YOUR MPPSC'}
            </span>
            <span className="bg-gradient-to-b from-amber-400 to-orange-600 bg-clip-text text-transparent filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {language === 'hi' ? 'टेस्ट सीरीज़।' : 'TEST SERIES.'}
            </span>
          </h1>
          
          <p className="mx-auto max-w-2xl px-4 text-sm font-bold tracking-tight text-slate-400 md:text-xl">
            {language === 'hi' 
              ? 'बिना भारी-भरकम नोट्स के, स्मार्ट तरीके से तैयारी करें।' 
              : 'Ditch the heavy notes. Master the pattern with smart analysis.'}
          </p>
        </div>

        {/* 🚀 THE 3D ACTION PORTAL (Main CTA) */}
        <div className="relative w-full max-w-[440px] px-4 pt-4">
          {!globalUser ? (
            <button
              onClick={() => {
                trackFbCustomEvent('hero_free_test_clicked', { location: 'home_page_hero_section' });
                startTransition(() => router.push('/free-quiz'));
              }}
              className="group relative w-full overflow-hidden rounded-2xl p-[1px] transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {/* The "Living" Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-50 group-hover:animate-shimmer" />
              
              <div className="relative flex h-16 w-full items-center justify-between rounded-2xl bg-[#0a0f1d] px-8 shadow-2xl transition-colors group-hover:bg-[#111827] md:h-24">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-transform group-hover:rotate-12 md:h-14 md:w-14">
                    {isPending ? (
                      <Loader2 size={24} className="animate-spin text-black md:size-32" />
                    ) : (
                      <Zap size={24} className="fill-black text-black md:size-32" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500/80">Launch</p>
                    <p className="text-sm font-black text-white md:text-2xl">
                       {language === 'hi' ? 'फ्री मॉक टेस्ट' : 'Start Free Mock'}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-6 w-6 text-amber-500 transition-transform group-hover:translate-x-2 md:h-10 md:w-10" strokeWidth={3} />
              </div>
            </button>
          ) : (
            <Link href="/dashboard" className="group relative block w-full">
              <div className="relative flex h-16 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 md:h-24">
                <span className="text-sm font-black tracking-[0.3em] text-white uppercase md:text-2xl">
                  {language === 'hi' ? 'डैशबोर्ड' : 'Dashboard'}
                </span>
                <ArrowLeft className="ml-4 h-6 w-6 rotate-180 text-amber-500 transition-transform group-hover:translate-x-2 md:h-10 md:w-10" />
              </div>
            </Link>
          )}
        </div>

        {/* Sub-Context - Visual Polish */}
        <div className="flex flex-col items-center gap-6 pt-8">
           <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
           <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <span className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-500" /> Topic Tests</span>
              <span className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-orange-500" /> PYQ Analysis</span>
              <span className="flex items-center gap-2"><div className="h-1 w-1 rounded-full bg-amber-600" /> Mnemonics</span>
           </div>
        </div>
      </motion.div>

      {/* Subtle Perspective Lines to Lead Eye Up */}
      <div className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-[#02040a] to-transparent" />
    </section>
  );
}
