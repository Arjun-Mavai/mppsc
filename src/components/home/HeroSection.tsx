'use client';

import { useTransition } from 'react';
import { BookOpen, Sparkles, Zap, ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';

export function HeroSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { language, user } = useSettingsStore();

  const handleNavigation = (path: string, eventName: string) => {
    trackFbCustomEvent(eventName, { location: 'home_page_hero_section' });
    startTransition(() => router.push(path));
  };

  const content = {
    en: {
      badge: 'MPPSC 2026 : Elite Selection',
      welcome: 'Welcome back,',
      ready: 'Ready for today\'s challenge?',
      title1: 'Master Both',
      title2: 'Prelims & Mains.',
      subtitle: 'Pure PYQ-focused strategic analysis, deep conceptual clarity, and expert-guided syllabus analytics. Learn from the ultimate hub of rankers — built for complete conceptual mastery with zero textbook clutter.',
      primaryBtn: 'Practice Free Test',
      pyqBtn: 'Practice PYQs',
      /** Kept for when we re-enable the `/free-quiz` hero CTA (currently commented below). */
      secondaryBtn: 'Free Mock Test',
      openPrelimsHeroBtn: '2026 Prelims paper',
      stats: ['100+ Topic Tests', 'Smart PYQ Analytics', 'Retention Mnemonics']
    },
    hi: {
      badge: 'MPPSC 2026 : एलीट सिलेक्शन',
      welcome: 'स्वागत है,',
      ready: 'क्या आप आज की चुनौती के लिए तैयार हैं?',
      title1: 'प्रारंभिक और मुख्य परीक्षा दोनों में',
      title2: 'महारत हासिल करें।',
      subtitle: 'शुद्ध PYQ-केंद्रित रणनीतिक विश्लेषण, गहरी वैचारिक स्पष्टता, और विषय-विशेषज्ञों के सिलेबस एनालिटिक्स। बिना किसी उबाऊ रटने के तरीक़े के — असली और सटीक तैयारी का एकमात्र हब।',
      primaryBtn: 'फ्री टेस्ट प्रैक्टिस करें',
      pyqBtn: 'PYQs प्रैक्टिस करें',
      secondaryBtn: 'फ्री मॉक टेस्ट',
      openPrelimsHeroBtn: '2026 प्रारंभिक पेपर',
      stats: ['100+ टॉपिक टेस्ट', 'स्मार्ट PYQ एनालिसिस', 'स्मार्ट मेमोनिक्स']
    }
  };

  const t = content[language === 'hi' ? 'hi' : 'en'];

  return (
    <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#020408] px-4 pt-16 pb-28 selection:bg-amber-500/30 md:px-6 md:pb-20">
      
      {/* 🎭 BEYOND-PREMIUM ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Animated Aurora Glows */}
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-600/15 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-amber-600/10 blur-[140px]" />
        
        {/* Cinematic Particles / Grid */}
        <div 
          className="absolute inset-0 opacity-[0.08]" 
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Center Spotlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020408_90%)]" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-center text-center -translate-y-4 md:-translate-y-6">
        
        {/* 👤 PERSONALIZED HUB - Standardized Position */}
        <AnimatePresence mode="wait">
          {user?.name && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 flex flex-col items-center gap-1.5"
            >
              <div className="flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 backdrop-blur-sm">
                 <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                 <span className="text-[11px] font-black tracking-[0.2em] text-amber-500 uppercase">
                    {t.welcome} {user.name.split(' ')[0]}
                 </span>
              </div>
              <span className="text-[10px] font-medium tracking-tight text-slate-500">
                {t.ready}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Status Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-5 py-2 backdrop-blur-xl transition-colors hover:border-white/10"
        >
          <Sparkles size={14} className="text-amber-500 animate-pulse" />
          <span className="text-[11px] font-black tracking-[0.25em] text-slate-200 uppercase">
            {t.badge}
          </span>
        </motion.div>

        {/* Headline - High Impact Typography */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-4"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter text-white leading-[1.1] md:leading-[1.05]">
            <span className="block opacity-80 mix-blend-overlay">{t.title1}</span>
            <span className="block bg-gradient-to-b from-amber-200 via-amber-400 to-orange-600 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(245,158,11,0.25)]">
              {t.title2}
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mx-auto mt-8 max-w-2xl px-6 text-base font-bold leading-relaxed text-slate-400 md:text-xl"
          >
            {t.subtitle}
          </motion.p>
        </motion.div>

        {/* Action Buttons — 2026 open prelims first (hero priority), then PYQs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-14 flex w-full flex-col items-center justify-center gap-5 sm:flex-row"
        >
          {/* Primary CTA: open 2026 MPPSC prelims paper (lead gate on that route) */}
          <button
            type="button"
            onClick={() => handleNavigation('/open/2026-mppsc-prelims', 'hero_open_2026_prelims_clicked')}
            disabled={isPending}
            className="group relative flex h-16 w-full items-center justify-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-200 via-white to-amber-100 px-10 font-black text-black shadow-[0_0_30px_rgba(251,191,36,0.1)] transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(251,191,36,0.25)] active:scale-[0.97] sm:w-auto"
          >
            <BookOpen size={22} className="text-amber-600" />
            <span className="text-lg tracking-tighter">{t.openPrelimsHeroBtn}</span>
            <ChevronRight size={22} className="transition-transform group-hover:translate-x-1.5" />
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent group-hover:animate-shimmer" />
          </button>

          {/* Secondary CTA: PYQs */}
          <button
            type="button"
            onClick={() => handleNavigation(user ? '/syllabus/quiz/pyq' : '/free-quiz', user ? 'hero_pyq_clicked' : 'hero_free_test_clicked')}
            disabled={isPending}
            className="group flex h-16 w-full items-center justify-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 px-10 font-bold text-white backdrop-blur-2xl transition-all hover:bg-amber-500/10 hover:border-amber-500/40 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] active:scale-[0.97] sm:w-auto"
          >
            <Zap size={20} className="text-amber-500 transition-transform group-hover:translate-x-0.5" />
            <span className="text-lg tracking-tighter">{user ? t.pyqBtn : t.primaryBtn}</span>
            <ChevronRight size={20} className="text-white/80 transition-transform group-hover:translate-x-1" />
          </button>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-20 flex flex-wrap justify-center gap-10 opacity-50 transition-opacity hover:opacity-100"
        >
          {t.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-amber-500" />
              <span className="text-[12px] font-black tracking-[0.2em] text-slate-400 uppercase">
                {stat}
              </span>
            </div>
          ))}
        </motion.div>

      </div>

      {/* Subtle Perspective Bottom Fade */}
      <div className="absolute bottom-0 h-40 w-full bg-gradient-to-t from-[#020408] to-transparent" />

      {/* Loading Portal Overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/90 backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center gap-8">
              <div className="relative flex h-20 w-20 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
                <div className="h-full w-full animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <Star size={24} className="absolute text-amber-500 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-[11px] font-black tracking-[0.5em] text-amber-500 uppercase">Syncing Data</p>
                <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5">
                  <motion.div 
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="h-full w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
