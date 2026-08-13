'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, Sparkles, Zap, ShieldCheck, ArrowRight, ChevronRight, Send } from 'lucide-react';
import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon';

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

      {/* ── Hero Section (Google & Stripe Designer Edition) ── */}
      <section className="relative z-10 flex flex-col items-center justify-center px-4 pt-4 pb-12 text-center md:px-6 md:pt-10 md:pb-16">
        <div className="max-w-5xl animate-fade-in-up">
          {/* Glowing Premium Strategy Pill Badge */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-4"
          >
            <div className="inline-flex items-center gap-2.5 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 px-5 py-2 text-xs font-black text-amber-300 backdrop-blur-md shadow-[0_0_35px_rgba(245,158,11,0.2)] uppercase tracking-widest">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping shadow-[0_0_10px_rgba(245,158,11,1)]" />
              <span>{hi ? '⭐ MPPSC मुख्य परीक्षा ज्ञान कोष' : '⭐ MPPSC Mains Gyan Kosh'}</span>
            </div>
          </motion.div>

          <style>{`
            @keyframes draw-circle {
              0% { stroke-dashoffset: 400; opacity: 0; }
              15% { opacity: 1; }
              100% { stroke-dashoffset: 0; opacity: 1; }
            }
          `}</style>

          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] font-black mb-2 tracking-tight leading-[1.15] py-2 text-white">
            {hi ? (
              <>
                रटना छोड़ें,
                <br />
                <span className="relative inline-block mt-2 px-8 py-2">
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_15px_rgba(220,38,38,0.55)] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(16,185,129,0.35)] relative z-10 px-2">
                    लिखना सीखें
                  </span>
                </span>
              </>
            ) : (
              <span className="inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-1 leading-none py-2 text-[0.9em]">
                <span>Stop Rote Learning,</span>
                <span className="relative inline-block px-8 py-2">
                  <svg
                    className="absolute inset-0 w-full h-full pointer-events-none filter drop-shadow-[0_0_15px_rgba(220,38,38,0.55)] drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
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
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-300 bg-clip-text text-transparent filter drop-shadow-[0_10px_40px_rgba(16,185,129,0.35)] relative z-10 px-2 text-[0.85em]">
                    Master Writing
                  </span>
                </span>
              </span>
            )}
          </h1>

          <p className="mx-auto mb-4 max-w-2xl text-lg font-black text-slate-300 md:text-2xl leading-relaxed">
            {hi ? (
              <>
                सिलेबस की <span className="text-amber-400">असली समझ</span> से <span className="text-emerald-400 font-black bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-sm inline-block">मॉडल उत्तरों तक</span>
              </>
            ) : (
              <>
                <span className="text-amber-400">Syllabus Decoding</span> to <span className="text-emerald-400 font-black bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20 shadow-sm inline-block">Ranker Answers</span>
              </>
            )}
          </p>

          <p className="mx-auto mt-4 max-w-3xl px-4 text-base sm:text-lg md:text-xl font-semibold leading-relaxed text-slate-300">
            {hi ? (
              <>
                सिर्फ नोट्स जमा करने से मेन्स क्लियर नहीं हो जाता। समझिए कि परीक्षक वास्तव में क्या पूछ रहा है।
                <br /><br />
                प्रश्न की मांग पहचानें, उत्तर का सही ढाँचा बनाना सीखें, और हर PYQ के पीछे छिपा पैटर्न समझें।
              </>
            ) : (
              <>
                Just collecting notes won't clear Mains. Understand what the examiner is actually asking.
                <br /><br />
                Identify the question's demand, learn to build the perfect answer structure, and understand the pattern hidden behind every PYQ.
              </>
            )}
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

          {/* Floating Feature Anchor Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-6 border-t border-white/5"
          >
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-xs font-bold text-slate-300">{hi ? '100% सिलेबस डिकोडिंग' : '100% Syllabus Decoded'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-bold text-slate-300">{hi ? '2 स्टाइल मॉडल उत्तर' : '2 Model Variants'}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-4 py-1.5 border border-white/10">
              <Target className="h-3.5 w-3.5 text-blue-400" />
              <span className="text-xs font-bold text-slate-300">{hi ? 'परीक्षक जाल व टिप्स' : 'Examiner Traps Decoded'}</span>
            </div>
          </motion.div>
        </div>
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

        {/* 🚀 NEW: Massive PYQ Library Showcase */}
        <div className="mt-16 w-full">
          <Link
            href="/mains/syllabus/pyq-library"
            className="group relative flex flex-col overflow-hidden rounded-[2.5rem] px-6 py-8 sm:px-10 sm:py-12 shadow-2xl transition-all duration-500 hover:scale-[1.02] bg-gradient-to-br from-sky-950/90 via-slate-900 to-[#060a12] border-2 border-sky-900/50 hover:border-sky-500/50"
          >
            {/* Background glowing blobs */}
            <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            <div className="absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl transition-transform duration-700 group-hover:scale-125" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 md:items-center">
               <div className="flex-1 space-y-5">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-widest text-sky-300 w-fit border border-sky-500/30">
                    <Sparkles className="h-3.5 w-3.5" />
                    {hi ? 'नया स्मार्ट अनुभव ✨' : 'New Smart Experience ✨'}
                  </div>
                  
                  <h3 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-white">
                    {hi ? 'MPPSC मेंस PYQ लाइब्रेरी' : 'MPPSC Mains PYQ Library'}
                  </h3>
                  
                  <p className="text-sm sm:text-lg font-semibold leading-relaxed max-w-2xl text-sky-200/90">
                    {hi 
                      ? 'पूरा सिलेबस और पिछले वर्षों के पेपर्स अब आपकी उंगलियों पर। एक "Bird Eye View" में स्मार्ट फ़िल्टर्स के साथ इमर्सिव रीडिंग का अनुभव लें।' 
                      : 'The entire syllabus and past papers at your fingertips. Practice with smart filters in a seamless bird\'s eye view.'}
                  </p>

                  <div className="flex flex-wrap gap-2.5 pt-3">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-300">
                      🎯 {hi ? 'वर्ष व पेपर' : 'Year & Paper'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-300">
                      📑 {hi ? 'खंड व विषय' : 'Parts & Topics'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-slate-300">
                      ✍️ {hi ? 'मार्क्स फ़िल्टर' : 'Marks Filter'}
                    </span>
                  </div>
               </div>

               <div className="flex md:justify-end">
                 <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-[0_0_30px_rgba(14,165,233,0.3)] border-4 bg-sky-500/20 text-sky-400 border-sky-600/50">
                   <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10" />
                 </div>
               </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 flex justify-center">
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

        {/* 💬 Instant WhatsApp & Support Guidance Banner */}
        <div className="mt-20 max-w-4xl mx-auto rounded-3xl border border-emerald-500/25 bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-[#060a12] p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span>{hi ? 'सहायता टीम उपलब्ध' : 'Support Available'}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {hi ? 'Mains तैयारी में कोई संशय है?' : 'Have Questions About Mains Prep?'}
            </h3>
            <p className="text-sm font-semibold text-slate-300 max-w-lg">
              {hi
                ? 'हमारी विशेषज्ञ टीम से WhatsApp पर तुरंत उत्तर पाएँ।'
                : 'Get instant answers from our expert support team on WhatsApp.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto relative z-10 shrink-0">
            <a
              href="https://wa.me/917489388350?text=Hi,%20I%20need%20help%20with%20MPPSC%20Mains."
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex h-13 w-full sm:w-auto items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-600 px-6 py-3.5 font-black text-white shadow-[0_4px_25px_rgba(16,185,129,0.3)] transition-all hover:scale-105 hover:shadow-[0_4px_35px_rgba(16,185,129,0.5)] active:scale-95"
            >
              <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white shadow-xs group-hover:scale-110 transition-transform">
                <WhatsAppIcon className="h-4 w-4 fill-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400 border border-white"></span>
                </span>
              </div>
              <span className="text-sm font-black tracking-tight">WhatsApp Support</span>
              <span className="rounded-full bg-emerald-950/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-200">
                {hi ? 'ऑनलाइन' : 'Online'}
              </span>
            </a>

            <a
              href="https://t.me/mppsc_conversation_bot?start=mains_landing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-13 w-full sm:w-auto items-center justify-center gap-2 rounded-2xl border border-sky-500/30 bg-sky-500/10 px-5 py-3.5 text-sm font-bold text-sky-300 transition-all hover:bg-sky-500/20 active:scale-95"
            >
              <Send className="h-4 w-4 text-sky-400" />
              <span>Telegram</span>
            </a>
          </div>
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
