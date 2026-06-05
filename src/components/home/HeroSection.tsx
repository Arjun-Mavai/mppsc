'use client';

import { useTransition } from 'react';
import { BookOpen, Sparkles, Zap, ChevronRight, Star, ShieldCheck, Trophy, Crown } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { trackFbCustomEvent } from '@/lib/analytics/facebook-pixel';
import { hasPreAccess, hasMainsAccess } from '@/lib/access-grants';

export function HeroSection() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { language, user } = useSettingsStore();

  const preAccess = hasPreAccess(user);
  const mainsAccess = hasMainsAccess(user);

  const handleNavigation = (path: string, eventName: string) => {
    trackFbCustomEvent(eventName, { location: 'home_page_hero_section' });
    startTransition(() => router.push(path));
  };

  const content = {
    en: {
      badge: 'MPPSC : Elite Selection',
      welcome: 'Welcome back,',
      ready: 'Ready for today\'s challenge?',
      title1: 'MPPSC Prelims +',
      title2: 'Mains',
      subtitle: 'Understand what to study, what to skip, what the question demands, and how to apply what you have learned in the exam.',
      primaryBtn: 'Practice Free Test',
      pyqBtn: 'Practice PYQs',
      mainsBtn: 'Go to Mains Vault',
      /** Kept for when we re-enable the `/free-quiz` hero CTA (currently commented below). */
      secondaryBtn: 'Free Mock Test',
      openPrelimsHeroBtn: 'Prelims Paper',
      stats: ['100+ Topic Tests', 'Smart PYQ Analytics', 'Retention Mnemonics']
    },
    hi: {
      badge: 'MPPSC : एलीट सिलेक्शन',
      welcome: 'स्वागत है,',
      ready: 'क्या आप आज की चुनौती के लिए तैयार हैं?',
      title1: 'MPPSC Prelims +',
      title2: 'Mains',
      subtitle: 'समझिए क्या पढ़ना है, क्या छोड़ना है, प्रश्न की मांग क्या है, और परीक्षा में पढ़ी हुई चीज़ों को कैसे उपयोग करना है।',
      primaryBtn: 'फ्री टेस्ट प्रैक्टिस करें',
      pyqBtn: 'PYQs प्रैक्टिस करें',
      mainsBtn: 'मेंस रिपॉजिटरी पर जाएं',
      secondaryBtn: 'फ्री मॉक टेस्ट',
      openPrelimsHeroBtn: 'प्रारंभिक परीक्षा पेपर',
      stats: ['100+ टॉपिक टेस्ट', 'स्मार्ट PYQ एनालिसिस', 'स्मार्ट मेमोनिक्स']
    }
  };

  const t = content[language === 'hi' ? 'hi' : 'en'];

  return (
    <section className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden bg-[#020408] px-4 pt-16 pb-28 selection:bg-amber-500/30 md:px-6 md:pb-20">
      <style>{`
        @keyframes curved-arrow-down-anim {
          0%, 100% {
            transform: rotate(-15deg) scale(1);
          }
          50% {
            transform: rotate(-11deg) scale(1.08);
          }
        }

        .premium-curved-arrow-down {
          animation: curved-arrow-down-anim 2s infinite ease-in-out;
          transform-origin: 27px 4px;
        }

        @keyframes curved-arrow-up-anim {
          0%, 100% {
            transform: rotate(15deg) scale(1);
          }
          50% {
            transform: rotate(11deg) scale(1.08);
          }
        }

        .premium-curved-arrow-up {
          animation: curved-arrow-up-anim 2s infinite ease-in-out;
          transform-origin: 27px 50px;
        }

        @keyframes crystal-shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .shimmer-bg {
          background: linear-gradient(
            120deg,
            rgba(239, 68, 68, 0) 30%,
            rgba(239, 68, 68, 0.12) 40%,
            rgba(255, 255, 255, 0.22) 50%,
            rgba(239, 68, 68, 0.12) 60%,
            rgba(239, 68, 68, 0) 70%
          );
          background-size: 200% 100%;
          animation: crystal-shimmer 5s infinite linear;
        }
      `}</style>

      {/* 🎭 BEYOND-PREMIUM ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Animated Aurora Glows */}
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-indigo-600/15 opacity-60 md:opacity-100 blur-[60px] md:blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-amber-600/10 opacity-60 md:opacity-100 blur-[60px] md:blur-[140px]" />

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

        {/* Status Badge */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-5 py-2 backdrop-blur-sm md:backdrop-blur-xl transition-colors hover:border-white/10">
          <Trophy size={15} className="text-amber-400 animate-bounce" />
          <span className="text-[11px] font-black tracking-[0.25em] text-slate-200 uppercase">
            {t.badge}
          </span>
        </div>

        {/* Headline - High Impact Typography */}
        <div className="space-y-4 animate-fade-in-up">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter text-white leading-[1.3] md:leading-[1.15]">
            <span className="block opacity-95">
              MPPSC Prelims +{' '}
              <span className="inline-block relative align-middle my-1">
                {/* Clean direct arrow placed at bottom-left pointing up-right towards the button */}
                <div className="absolute -bottom-6 left-2 z-20 pointer-events-none filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)] animate-bounce">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 19L19 5M19 5H9M19 5V15"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <button
                  type="button"
                  onClick={() => handleNavigation('/mains', 'hero_mains_badge_clicked')}
                  disabled={isPending}
                  className="relative inline-flex items-center gap-2 rounded-2xl border border-red-500/50 bg-red-950/30 px-6 py-2 sm:px-8 sm:py-3.5 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white shadow-[0_0_25px_rgba(239,68,68,0.25)] transition-all hover:scale-[1.05] hover:border-red-400 hover:bg-red-950/50 hover:shadow-[0_0_40px_rgba(239,68,68,0.45)] active:scale-95 cursor-pointer select-none mx-3 group overflow-hidden"
                >
                  {/* Shimmer background */}
                  <div className="absolute inset-0 shimmer-bg" />

                  {/* Micro-sparkles inside the box */}
                  <Sparkles size={16} className="absolute -top-2 -right-2 text-amber-400 animate-pulse z-10" />

                  <span className="relative z-10 text-white font-black filter drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)]">
                    Mains
                  </span>
                </button>
              </span>
            </span>

            {language === 'hi' ? (
              <span className="block bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(245,158,11,0.25)] mt-4 text-3xl sm:text-5xl md:text-6xl font-black">
                सिर्फ पढ़ाई नहीं, सही दिशा में तैयारी।
              </span>
            ) : (
              <span className="block bg-gradient-to-b from-amber-200 via-amber-400 to-orange-500 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(245,158,11,0.25)] mt-4 text-3xl sm:text-5xl md:text-6xl font-black">
                Don't just study, prepare with direction.
              </span>
            )}
          </h1>

          <p className="mx-auto mt-8 max-w-2xl px-6 text-base font-bold leading-relaxed text-slate-400 md:text-xl">
            {t.subtitle}
          </p>
        </div>

        {/* Action Buttons — 2026 open prelims first (hero priority), then PYQs */}
        <div className="animate-fade-in-up mt-14 flex w-full flex-col items-center justify-center gap-5 sm:flex-row" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
          {/* Primary CTA: Based on access */}
          {mainsAccess && !preAccess ? (
            <button
              type="button"
              onClick={() => handleNavigation('/mains', 'hero_mains_vault_clicked')}
              disabled={isPending}
              className="group relative flex h-16 w-full items-center justify-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-200 via-white to-amber-100 px-10 font-black text-black shadow-[0_0_30px_rgba(251,191,36,0.1)] transition-all hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(251,191,36,0.25)] active:scale-[0.97] sm:w-auto"
            >
              <Crown size={22} className="text-amber-600" />
              <span className="text-lg tracking-tighter">{t.mainsBtn}</span>
              <ChevronRight size={22} className="transition-transform group-hover:translate-x-1.5" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-black/5 to-transparent group-hover:animate-shimmer" />
            </button>
          ) : (
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
          )}

          {/* Secondary CTA: PYQs (only if Pre access or Logged Out) */}
          {(preAccess || !user) && (
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
          )}
        </div>

        {/* Feature Highlights */}
        <div className="animate-fade-in-up mt-20 flex flex-wrap justify-center gap-10 opacity-50 transition-opacity hover:opacity-100" style={{ animationDelay: '0.7s', animationFillMode: 'both' }}>
          {t.stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-amber-500" />
              <span className="text-[12px] font-black tracking-[0.2em] text-slate-400 uppercase">
                {stat}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Subtle Perspective Bottom Fade */}
      <div className="absolute bottom-0 h-40 w-full bg-gradient-to-t from-[#020408] to-transparent" />

      {/* Loading Portal Overlay */}
      {isPending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/90 backdrop-blur-md md:backdrop-blur-2xl animate-fade-in-up transition-opacity duration-300">
          <div className="flex flex-col items-center gap-8">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
              <div className="h-full w-full animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              <Star size={24} className="absolute text-amber-500 animate-pulse" />
            </div>
            <div className="flex flex-col items-center gap-2">
              <p className="text-[11px] font-black tracking-[0.5em] text-amber-500 uppercase">Syncing Data</p>
              <div className="h-1 w-32 overflow-hidden rounded-full bg-white/5 relative">
                <div 
                  className="absolute top-0 bottom-0 left-0 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent"
                  style={{ animation: 'marquee-scroll 1.5s linear infinite', width: '200%' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
