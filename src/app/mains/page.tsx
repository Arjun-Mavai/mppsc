'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Sparkles, Zap, ShieldCheck, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 🏛️ MAINS LANDING PAGE (ULTRA-UX EDITION)
 * 
 * Crafted by 20+ years UX design principles:
 * - Pure strategic Amber-Gold visual anchors for supreme focal focus.
 * - Deep contrast glassmorphism structures for readability under any lighting.
 * - Meaningful copy structure shifting attention away from bulk notes to active PYQ mastery.
 */

export default function MainsLandingPage() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (path: string) => {
    startTransition(() => router.push(path));
  };

  const features = [
    {
      icon: BookOpen,
      title: hi ? 'गहन समझ व विश्लेषण' : 'Deep Syllabus Grasp & Analysis',
      desc: hi 
        ? 'सिलेबस के प्रत्येक टॉपिक की व्यावहारिक व सटीक समझ, बिना किसी उबाऊ रटने की विवशता के।' 
        : 'True conceptual clarity of every single syllabus point — no rote-learning templates.'
    },
    {
      icon: Target,
      title: hi ? 'परीक्षक-अनुकूल फॉर्मेट' : 'Examiner-Friendly Formats',
      desc: hi
        ? '2 व 7 अंक — दो-दो उत्कृष्ट वेरिएंट; लंबे उत्तर GS I–III में 10 अंक व GS IV में 11 अंक + केस स्टडी।'
        : 'Two premium variants each for 2m & 7m; long answers 10m (GS I–III) or 11m + case study (GS IV).'
    },
    {
      icon: ShieldCheck,
      title: hi ? 'रणनीतिक मूल्यवर्धन' : 'Strategic Value Addition',
      desc: hi 
        ? 'संवैधानिक अनुच्छेद, लैंडमार्क सुप्रीम कोर्ट निर्णय, सरकारी योजनाएं और MP-विशिष्ट प्रामाणिक डेटा।' 
        : 'Constitutional articles, landmark SC rulings, schemes, and MP-specific authentic facts built-in.'
    },
    {
      icon: Zap,
      title: hi ? 'परीक्षक जाल व टिप्स' : 'Examiner Traps & Guidance',
      desc: hi 
        ? 'उत्तर में क्या अंडरलाइन करें, सामान्य गलतियों से कैसे बचें, और परीक्षक की मानसिकता को कैसे डिकोड करें।' 
        : 'What to underline, critical pitfalls to avoid, and strategic secrets to score higher than peers.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#020408] text-white selection:bg-amber-500/30 font-sans">
      {/* 🎭 BEYOND-PREMIUM ATMOSPHERE */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full bg-amber-600/10 blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[700px] w-[700px] rounded-full bg-orange-600/10 blur-[140px]" />
        
        {/* Cinematic Particles / Grid */}
        <div 
          className="absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#020408_90%)]" />
      </div>

      {/* ── Hero Section (Tightened viewport clearance to bring buttons up) ── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-8 pb-12 text-center md:px-6 md:pt-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl"
        >
          {/* Glowing Premium Strategy Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-black text-amber-300 backdrop-blur-sm shadow-[0_0_30px_rgba(245,158,11,0.15)] uppercase tracking-wider">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {hi ? 'MPPSC मुख्य परीक्षा डिकोडर' : 'MPPSC Mains Strategic Decoder'}
            </div>
          </motion.div>

          {/* 
            💡 MAIN PHILOSOPHY TITLE VARIATIONS FOR SELECTION:
          */}
          <style>{`
            @keyframes draw-circle {
              0% {
                stroke-dashoffset: 400;
                opacity: 0;
              }
              15% {
                opacity: 1;
              }
              100% {
                stroke-dashoffset: 0;
                opacity: 1;
              }
            }
          `}</style>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.2rem] font-black mb-4 tracking-tighter leading-[1.15] py-2 text-white">
            {hi ? (
              <>
                रटना छोड़ें,
                <br />
                <span className="relative inline-block mt-1 px-8 py-2">
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_15px_rgba(220,38,38,0.55)] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* First Loop Stroke - Deep Royal Red */}
                    <path
                      d="M6 48 C10 15, 90 12, 94 48 C98 84, 12 88, 6 52"
                      stroke="#dc2626"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: '400',
                        strokeDashoffset: '400',
                        animation: 'draw-circle 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards'
                      }}
                    />
                    {/* Second Loop Stroke - Rich Gold / Yellow */}
                    <path
                      d="M12 52 C5 18, 95 18, 92 50 C89 82, 3 80, 10 46"
                      stroke="#fbbf24"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-95"
                      style={{
                        strokeDasharray: '400',
                        strokeDashoffset: '400',
                        animation: 'draw-circle 1.8s cubic-bezier(0.25, 1, 0.5, 1) 0.25s forwards'
                      }}
                    />
                  </svg>
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(16,185,129,0.35)] relative z-10">
                    रणनीति चुनें
                  </span>
                </span>
              </>
            ) : (
              <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 leading-none py-2">
                <span>Stop Rote Learning,</span>
                <span className="relative inline-block px-8 py-2">
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_15px_rgba(220,38,38,0.55)] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* First Loop Stroke - Deep Royal Red */}
                    <path
                      d="M6 48 C10 15, 90 12, 94 48 C98 84, 12 88, 6 52"
                      stroke="#dc2626"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        strokeDasharray: '400',
                        strokeDashoffset: '400',
                        animation: 'draw-circle 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards'
                      }}
                    />
                    {/* Second Loop Stroke - Rich Gold / Yellow */}
                    <path
                      d="M12 52 C5 18, 95 18, 92 50 C89 82, 3 80, 10 46"
                      stroke="#fbbf24"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="opacity-95"
                      style={{
                        strokeDasharray: '400',
                        strokeDashoffset: '400',
                        animation: 'draw-circle 1.8s cubic-bezier(0.25, 1, 0.5, 1) 0.25s forwards'
                      }}
                    />
                  </svg>
                  <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(16,185,129,0.35)] relative z-10">
                    Choose Strategy
                  </span>
                </span>
              </span>
            )}
          </h1>

          <p className="mx-auto mb-6 max-w-2xl text-lg font-black text-slate-300 md:text-2xl leading-relaxed">
            {hi ? (
              <>
                सिलेबस की <span className="text-amber-400">असली समझ</span> से <span className="text-emerald-400 font-black bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 shadow-sm inline-block">मॉडल उत्तरों तक</span>
              </>
            ) : (
              <>
                From Deep <span className="text-amber-400">Syllabus Clarity</span> to <span className="text-emerald-400 font-black bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/20 shadow-sm inline-block">Model Answers</span>
              </>
            )}
          </p>

          <p className="mx-auto mt-4 max-w-3xl px-4 text-base sm:text-lg md:text-xl font-bold leading-relaxed text-slate-300">
            {hi 
              ? 'बिना किसी उबाऊ और बोझिल रटने की प्रणाली के — असली सिलेबस डिकोडिंग और प्रत्येक प्रश्न के 2 अलग दृष्टिकोण वाले मॉडल उत्तरों (डबल-स्टाइल वेरिएशन) का एकमात्र विश्वसनीय हब।'
              : 'Direct analytical syllabus decoding with premium Double-Style Answer Variations — zero textbook and rote-learning clutter.'}
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md sm:max-w-2xl md:max-w-3xl mx-auto">
            {/* 📚 Syllabus Deep Understanding Button - Premium Amber Gradient with Glowing Shadow */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleNavigation('/mains/syllabus')}
              className="group relative flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-8 font-black text-white shadow-[0_4px_30px_rgba(245,158,11,0.3)] transition-all hover:scale-[1.03] hover:shadow-[0_4px_45px_rgba(245,158,11,0.55)] active:scale-[0.97]"
            >
              <BookOpen size={20} className="text-white" />
              <span className="text-base tracking-tight">{hi ? '📚 सिलेबस की गहरी संरचनात्मक समझ' : '📚 Deep Structural Syllabus Grasp'}</span>
              <ChevronRight size={20} className="text-white transition-transform group-hover:translate-x-1" />
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer" />
            </button>

            {/* 🔍 Mains PYQ Library Button - Premium Dark Glassmorphism with Glowing Amber Border */}
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleNavigation('/mains/syllabus/pyq-library')}
              className="group flex h-16 w-full items-center justify-center gap-3 rounded-2xl border border-amber-500/35 bg-[#060a12]/85 px-8 font-extrabold text-white backdrop-blur-2xl transition-all hover:bg-[#0c1625]/90 hover:border-amber-500/55 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] active:scale-[0.97]"
            >
              <Zap size={18} className="text-amber-400 transition-transform group-hover:translate-x-0.5" />
              <span className="text-base tracking-tight">{hi ? '🔍 मेंस PYQ लाइब्रेरी' : '🔍 Mains PYQ Library'}</span>
              <ChevronRight size={18} className="text-white/60 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Features Grid (Syllabus Depth Focus) ── */}
      <section className="relative z-10 py-24 px-4 max-w-7xl mx-auto md:px-6 border-t border-slate-900/40">
        <div className="text-center mb-16">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-4 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
            {hi ? 'हमारा दृष्टिकोण' : 'OUR METHODOLOGY'}
          </Badge>
          <h2 className="text-3xl sm:text-5xl font-black mb-4 tracking-tight text-white">
            {hi ? 'नोट्स नहीं, शुद्ध वैचारिक व विश्लेषणात्मक समझ' : 'Not templates. Pure conceptual & analytical mastery.'}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base font-bold leading-relaxed">
            {hi
              ? 'हम रटने के लिए लंबे पीडीएफ नोट्स नहीं देते; हमारा फोकस आपको सिलेबस की ऐसी गहरी समझ और मॉडल उत्तर संरचना प्रदान करना है जो अधिक अंक सुनिश्चित करें।'
              : 'We do not give endless PDF pages to memorize. Our focus is deep core insights and structural blueprints to unlock maximum examiner scores.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-sm hover:border-amber-500/35 hover:shadow-[0_10px_35px_rgba(245,158,11,0.06)] transition-all group"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <f.icon className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-lg font-black mb-3 text-white tracking-tight">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed font-bold">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Six papers — paper-wise precise approach ── */}
      <section className="relative z-10 px-4 py-24 max-w-7xl mx-auto md:px-6 border-t border-slate-900">
        <div className="mb-14 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-3xl">
            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 mb-3 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
              {hi ? 'विषय-वार विशेषज्ञता' : 'PAPER-WISE SPECIALIZATION'}
            </Badge>
            <h2 className="text-3xl sm:text-5xl font-black mb-3 text-white tracking-tight">
              {hi ? 'छहों पेपर — विषय-वार सटीक दृष्टिकोण' : 'All 6 papers — precise paper-wise approach'}
            </h2>
            <p className="text-slate-400 text-sm sm:text-base font-bold leading-relaxed">
              {hi
                ? 'प्रत्येक paper की अपनी स्वतंत्र शैली होती है। इतिहास में ऐतिहासिक स्रोत व MP रियासतें, भूगोल में मानचित्र-चित्रण, राजविज्ञान में केस निर्णय, नीतिशास्त्र में दार्शनिक ढाँचा व केस स्टडीज। हिंदी व अंग्रेजी के उत्तर अलग-अलग लिखे गए हैं, न कि अनुवादित।'
                : 'Every paper demands a unique draft: historical dynastic sources vs geographic mapping vs polity SC cases vs ethics case scenarios vs grammar rules. Written natively in Hindi & English — not translation pairs.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              n: 1,
              hiT: 'इतिहास + भूगोल',
              enT: 'History & Geography',
              hiD: 'कालक्रम शुद्धता, MP की प्रमुख रियासतें व संस्कृति, भौतिक भूगोल प्रक्रिया + मानचित्र चित्रण संकेत।',
              enD: 'Chronology, major MP dynasties & culture, physical geomorphic processes + diagram guidelines.',
            },
            {
              n: 2,
              hiT: 'राजनीति + समाजशास्त्र',
              enT: 'Polity & Sociology',
              hiD: 'संवैधानिक अनुच्छेद, सुप्रीम कोर्ट के लैंडमार्क निर्णय, भारतीय सामाजिक संरचना पर प्रामाणिक MP उदाहरण।',
              enD: 'Articles, landmark SC rulings, social structure dynamics with authentic MP contexts.',
            },
            {
              n: 3,
              hiT: 'अर्थशास्त्र + विज्ञान-तकनीकी',
              enT: 'Economics & Sci–Tech',
              hiD: 'MP आर्थिक संरचना, नीति-वित्तीय ढाँचा, स्वास्थ्य/पर्यावरण विज्ञान का व्यावहारिक व विश्लेषणात्मक विवरण।',
              enD: 'MP economy structures, policy-fiscal drafts, plain-language sci-tech frameworks for health/environment.',
            },
            {
              n: 4,
              hiT: 'दर्शन / मनोविज्ञान / प्रबंधन',
              enT: 'Philosophy, Psych, Pub Ad & Mgmt',
              hiD: 'दार्शनिकों के मूल विचार व मानक संदर्भ, प्रामाणिक नीतिशास्त्र केस स्टडीज, 11 अंक + 18 अंक प्रारूप संरचना।',
              enD: 'Core thinker teachings & references, ethical decision scenarios, and precise 11m + case18 outlines.',
            },
            {
              n: 5,
              hiT: 'सामान्य हिन्दी व व्याकरण',
              enT: 'General Hindi & Grammar',
              hiD: 'सटीक व्याकरण नियम → उदाहरण → सम्भावित गलतियाँ; सामान्य निबंध शैली से पूरी तरह भिन्न।',
              enD: 'Precise grammatical formulas → examples → common pitfalls; treated professionally, not as generic copy.',
            },
            {
              n: 6,
              hiT: 'निबंध व प्रारूप लेखन',
              enT: 'Essay & official drafting',
              hiD: 'निबंध का ठोस खाका, शासकीय पत्र/शासकीय प्रतिवेदन शैली, शब्द सीमा के अनुरूप सटीक नमूने।',
              enD: 'High-scoring essay schematics, official secretariat letters/report drafting models within limits.',
            },
          ].map((p) => (
            <motion.div
              key={p.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-slate-800 bg-[#060a12]/70 p-6 hover:border-amber-500/35 hover:shadow-[0_10px_35px_rgba(245,158,11,0.06)] transition-all hover:bg-slate-900/30 group"
            >
              <Badge className="mb-4 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-black px-2.5 py-0.5 rounded">
                Paper {p.n}
              </Badge>
              <h3 className="text-xl font-black text-white mb-2 group-hover:text-amber-300 transition-colors tracking-tight">{hi ? p.hiT : p.enT}</h3>
              <p className="text-sm text-slate-400 leading-relaxed font-bold">{hi ? p.hiD : p.enD}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-16 flex justify-center">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleNavigation('/mains/syllabus')}
            className="group flex h-14 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 font-black text-white shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <span>{hi ? '📚 सिलेबस खोलें' : '📚 Open Syllabus Tree'}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </section>

      {/* Loading Portal Overlay */}
      <AnimatePresence>
        {isPending && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020408]/90 backdrop-blur-2xl"
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 animate-ping rounded-full bg-amber-500/20" />
                <div className="h-full w-full animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                <Sparkles size={20} className="absolute text-amber-400 animate-pulse" />
              </div>
              <p className="text-xs font-black tracking-[0.3em] text-amber-500 uppercase">{hi ? 'लोड हो रहा है...' : 'Syncing Mains...'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
