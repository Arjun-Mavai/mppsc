'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSettingsStore } from '@/store/useSettingsStore';
import { DashboardHeader } from './DashboardHeader';
import { SyllabusProgressWidget } from '@/features/analytics/components/SyllabusProgressWidget';
import { SubjectMasteryWidget } from '@/features/analytics/components/SubjectMasteryWidget';
import { DashboardActionCard } from './DashboardActionCard';
import AnalyticsDashboardWrapper from '@/app/syllabus/analytics/AnalyticsDashboardWrapper';
import { hasPreAccess, hasMainsAccess } from '@/lib/access-grants';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { 
  BookOpen, 
  GraduationCap, 
  Crown, 
  Library, 
  Sparkles, 
  History, 
  Zap, 
  Lock, 
  Compass, 
  BarChart2, 
  User, 
  ArrowRight,
  Bookmark
} from 'lucide-react';

interface DashboardClientProps {
  user: {
    name: string | null;
    planTier: string | null;
    isSubscribed?: boolean | null;
    accessGrants?: string[] | null;
  };
  analyticsData: any;
  syllabusProgress: any;
  totalTopics: number;
}

const STUDY_QUOTES = [
  {
    en: "The secret of getting ahead is getting started. Focus on your goal today.",
    hi: "आगे बढ़ने का रहस्य शुरुआत करना है। आज अपने लक्ष्य पर ध्यान केंद्रित करें।"
  },
  {
    en: "Success is the sum of small efforts, repeated day in and day out.",
    hi: "सफलता छोटे-छोटे प्रयासों का योग है, जिन्हें दिन-रात दोहराया जाता है।"
  },
  {
    en: "Your determination defines your rank. Every topic mastered is a step closer to SDM.",
    hi: "आपकी दृढ़ता आपकी रैंक तय करती है। हर विषय पर पकड़ आपको SDM पद के करीब लाती है।"
  },
  {
    en: "Arise, awake, and stop not until the goal is reached.",
    hi: "उठो, जागो और तब तक मत रुको जब तक लक्ष्य प्राप्त न हो जाए।"
  },
  {
    en: "Consistency beats talent. Keep practicing, keep improving, keep moving forward.",
    hi: "निरंतरता प्रतिभा को मात देती है। अभ्यास करते रहें, सुधार करते रहें, आगे बढ़ते रहें।"
  },
  {
    en: "The best way to predict the future is to create it. Crack MPPSC with strategy.",
    hi: "भविष्य का अनुमान लगाने का सबसे अच्छा तरीका इसे बनाना है। रणनीति के साथ MPPSC क्रैक करें।"
  }
];

export function DashboardClient({ user, analyticsData, syllabusProgress, totalTopics }: DashboardClientProps) {
  const router = useRouter();
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  
  const [activeTab, setActiveTab] = React.useState<'study' | 'analytics'>('study');
  const [quote, setQuote] = React.useState(STUDY_QUOTES[0]);

  React.useEffect(() => {
    const day = new Date().getDate();
    setQuote(STUDY_QUOTES[day % STUDY_QUOTES.length]);
  }, []);

  const hasPre = hasPreAccess(user);
  const hasMains = hasMainsAccess(user);
  const isCombo = hasPre && hasMains;
  
  // Rules for showing lock screens (lock if they don't have that specific product access)
  const showPreLock = !hasPre;
  const showMainsLock = !hasMains; 
  const showPyqLock = !hasPre;

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#FAFBFD] pb-24 font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* Light Multi-Gradient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] h-[60%] w-[60%] rounded-full bg-indigo-50/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[60%] rounded-full bg-emerald-50/60 blur-[120px]" />
        <div className="absolute top-[20%] right-[-5%] h-[50%] w-[50%] rounded-full bg-rose-50/60 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[-5%] h-[50%] w-[50%] rounded-full bg-amber-50/40 blur-[120px]" />
      </div>

      {/* 🏷️ BILINGUAL HEADER */}
      <DashboardHeader user={user} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        
        {/* PREMIUM WELCOME CARD */}
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-[#131926] p-6 md:p-8 text-white shadow-xl border border-slate-800/80">
          <div className="absolute top-[-50%] left-[-20%] h-[200px] w-[200px] rounded-full bg-indigo-500/10 blur-[60px]" />
          <div className="absolute bottom-[-50%] right-[-10%] h-[250px] w-[250px] rounded-full bg-violet-600/10 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {isCombo ? (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                    <Crown size={12} className="text-amber-400 fill-amber-400/20 shrink-0" />
                    <span>PREMIUM COMBO MEMBER</span>
                  </div>
                ) : hasMains ? (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
                    <Crown size={12} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                    <span>PREMIUM MAINS ACCESS</span>
                  </div>
                ) : hasPre ? (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    <Sparkles size={12} className="text-amber-400 fill-amber-400/20 shrink-0" />
                    <span>PREMIUM PRELIMS ACCESS</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400">
                    <User size={12} className="text-slate-500 shrink-0" />
                    <span>FREE LEARNER ACCOUNT</span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                  {isHindi ? `नमस्ते, ${user.name?.split(' ')[0]}!` : `Namaste, ${user.name?.split(' ')[0]}!`}
                </h2>
                <p className="text-[10px] font-black tracking-[0.2em] text-indigo-300/85 uppercase">
                  {isHindi ? 'अधिकारी बनने का सफ़र' : 'The Officer Pathway'}
                </p>
              </div>

              {/* Daily Mantra Quote Card */}
              <div className="relative max-w-xl bg-[#0a0d16] border border-slate-800/50 rounded-[2rem] p-5 mt-4 shadow-md">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={14} className="text-[#ff9500] fill-[#ff9500]/20" />
                  <span className="font-extrabold text-[10px] tracking-wider text-[#ff9500] uppercase">
                    Daily Mantra
                  </span>
                </div>
                <p className="text-white text-xs md:text-[13px] leading-relaxed font-bold">
                  {isHindi ? quote.hi : quote.en}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* PREMIUM SEGMENTED TABS */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-full bg-white p-1 shadow-sm border border-slate-200/60">
            <button
              onClick={() => setActiveTab('study')}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                activeTab === 'study' 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <Compass size={12} />
              <span>Study Hub</span>
            </button>
            
            <button
              onClick={() => setActiveTab('analytics')}
              className={cn(
                "flex items-center gap-2 rounded-full px-5 py-2.5 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                activeTab === 'analytics' 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "text-slate-500 hover:text-slate-900"
              )}
            >
              <BarChart2 size={12} />
              <span>My Progress</span>
            </button>
          </div>
        </div>

        {/* TAB 1: STUDY HUB (LAUNCHPAD PORTAL) */}
        {activeTab === 'study' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* 1. PRELIMS PREP HUB */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-blue-50/60 border border-blue-200/80 px-3.5 py-6 sm:p-6 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-blue-500/5 blur-2xl pointer-events-none" />
                
                {/* Lock Overlay if no access */}
                {showPreLock && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[2px] p-6 text-center animate-in fade-in duration-300">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                      <Lock size={18} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{isHindi ? 'प्रारंभिक परीक्षा प्रीमियम' : 'Prelims Premium'}</h4>
                    <p className="mt-1.5 text-[11px] text-slate-500 max-w-[220px] leading-relaxed">
                      {isHindi ? 'यूनिट/टॉपिक टेस्ट और प्रीलिम्स सिलेबस अनलॉक करें।' : 'Unlock Prelims units practice, mocks, and micro syllabus tracking.'}
                    </p>
                    <button 
                      onClick={() => router.push('/upgrade')}
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-700 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles size={11} className="fill-current text-white" />
                      <span>{isHindi ? 'प्रीमियम अनलॉक करें' : 'Unlock Now'}</span>
                    </button>
                  </div>
                )}

                <div>
                  {/* Centered top icon & header layout mirroring /syllabus design */}
                  <div className="flex flex-col items-center text-center mb-5 mt-1">
                    <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100/80 border border-blue-200 text-blue-600 shadow-md">
                      <div className="absolute inset-0 rounded-full blur-md bg-blue-400/20 opacity-60" />
                      <GraduationCap className="h-7 w-7 relative z-10" />
                    </div>
                    <span className="rounded-full bg-blue-100 border border-blue-200/80 px-3 py-1 text-[9px] font-black tracking-widest text-blue-600 uppercase mb-2">
                      {isHindi ? 'प्रारंभिक परीक्षा' : 'Prelims Guide'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-blue-900 mb-1 tracking-tight">{isHindi ? 'प्रिलिम्स विजय पथ' : 'Prelims Victory Pathway'}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-[280px]">
                      {isHindi ? 'सही दिशा, नियमित अभ्यास और प्रभावी रिविजन के साथ प्रिलिम्स की तैयारी।' : 'Master Prelims with the right direction, regular practice, and active revision.'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <Link 
                      href="/syllabus"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-blue-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {isHindi ? 'सिलेबस डीप-डाइव और Active Recall' : 'Syllabus Deep-Dive & Active Recall'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'सिलेबस टॉपिक्स की गहरी समझ, सक्रिय याद करने की पद्धति और एक्सपर्ट एक्सप्लेनेशन।' : 'Deep understanding of syllabus topics with active recall questions and expert explanations.'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>

                    <Link 
                      href="/syllabus/quiz/pyq"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-blue-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                          <Bookmark size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {isHindi ? 'परीक्षा स्तर टेस्ट प्रैक्टिस (Test Series)' : 'Exam-Level Test Practice (Test Series)'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'मॉक टेस्ट, यूनिट टेस्ट और परीक्षा-स्तर प्रश्नों के साथ संपूर्ण अभ्यास करें।' : 'Target weaknesses with unit-wise mocks and topic practice.'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>

                    <Link 
                      href="/free-quiz"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-blue-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 border border-blue-100 text-blue-600">
                          <Zap size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                            {isHindi ? 'डेली फ्री क्विज़ (मेमरी बूस्टर)' : 'Daily Free Quiz (Memory Booster)'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'दैनिक प्रश्नों के साथ कठिन तथ्यों का रिवीजन करें' : 'Boost retention scores with daily revision micro-tests'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* 2. MAINS PREP HUB */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-emerald-50/60 border border-emerald-200/80 px-3.5 py-6 sm:p-6 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl pointer-events-none" />
                
                {/* Lock Overlay if no access */}
                {showMainsLock && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[2px] p-6 text-center animate-in fade-in duration-300">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                      <Lock size={18} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{isHindi ? 'मुख्य परीक्षा प्रीमियम' : 'Mains Premium'}</h4>
                    <p className="mt-1.5 text-[11px] text-slate-500 max-w-[220px] leading-relaxed">
                      {isHindi ? 'डबल-स्टाइल मॉडल उत्तर और मेंस PYQ लाइब्रेरी खोलें।' : 'Unlock expert double-style model answers mapped to your syllabus.'}
                    </p>
                    <button 
                      onClick={() => router.push('/mains')}
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-emerald-700 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles size={11} className="fill-current text-white" />
                      <span>{isHindi ? 'मेंस अनलॉक करें' : 'Unlock Mains'}</span>
                    </button>
                  </div>
                )}

                <div>
                  {/* Centered top icon & header layout mirroring /syllabus design */}
                  <div className="flex flex-col items-center text-center mb-5 mt-1">
                    <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-600 shadow-md">
                      <div className="absolute inset-0 rounded-full blur-md bg-emerald-400/20 opacity-60" />
                      <Crown className="h-7 w-7 relative z-10" />
                    </div>
                    <span className="rounded-full bg-emerald-100 border border-emerald-200/80 px-3 py-1 text-[9px] font-black tracking-widest text-emerald-600 uppercase mb-2">
                      {isHindi ? 'मुख्य परीक्षा' : 'Mains Guide'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-900 mb-1 tracking-tight">{isHindi ? 'मेंस उत्तर लेखन स्टूडियो' : 'Mains Answer Writing Studio'}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-[280px]">
                      {isHindi ? 'ज्ञान को संरचित, विश्लेषणात्मक और अंक प्राप्त करने वाले उत्तरों में बदलें।' : 'Transform knowledge into structured, analytical, and score-worthy answers.'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <Link 
                      href="/mains"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-emerald-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                          <Crown size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                            {isHindi ? 'मॉडल उत्तर एवं विषय विश्लेषण' : 'Model Answers & Topic Insights'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'हर विषय को परीक्षा की मांग और उत्तर लेखन दृष्टिकोण से समझें।' : 'Understand every topic through the lens of exam expectations and answer writing.'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>

                    <Link 
                      href="/mains/syllabus/pyq-library"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-emerald-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                          <Library size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-emerald-600 transition-colors">
                            {isHindi ? 'PYQ इनसाइट लाइब्रेरी' : 'PYQ Insight Library'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'पिछले प्रश्नों में छिपी परीक्षा की सोच और प्रवृत्ति को समझें।' : 'Discover the patterns and expectations hidden within previous year questions.'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* 3. PYQ INTELLIGENCE ENGINE */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-amber-50/60 border border-amber-200/80 px-3.5 py-6 sm:p-6 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-amber-500/5 blur-2xl pointer-events-none" />
                
                {/* Lock Overlay if no access */}
                {showPyqLock && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[2px] p-6 text-center animate-in fade-in duration-300">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 border border-amber-100 text-amber-600">
                      <Lock size={18} />
                    </div>
                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">{isHindi ? 'PYQ इंटेलिजेंस' : 'PYQ Intelligence'}</h4>
                    <p className="mt-1.5 text-[11px] text-slate-500 max-w-[220px] leading-relaxed">
                      {isHindi ? 'विषय-वार और वर्ष-वार इंटेलिजेंस विश्लेषण अनलॉक करें।' : 'Analyze repeating trends, and access bilingual mnemonics for PYQs.'}
                    </p>
                    <button 
                      onClick={() => router.push('/upgrade')}
                      className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white hover:bg-amber-700 transition-all cursor-pointer shadow-md"
                    >
                      <Sparkles size={11} className="fill-current text-white" />
                      <span>{isHindi ? 'इंजन अनलॉक करें' : 'Unlock Engine'}</span>
                    </button>
                  </div>
                )}

                <div>
                  {/* Centered top icon & header layout mirroring /syllabus design */}
                  <div className="flex flex-col items-center text-center mb-5 mt-1">
                    <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100/80 border border-amber-200 text-amber-600 shadow-md">
                      <div className="absolute inset-0 rounded-full blur-md bg-amber-400/20 opacity-60" />
                      <Sparkles className="h-7 w-7 relative z-10 text-amber-650" />
                    </div>
                    <span className="rounded-full bg-amber-100 border border-amber-200/80 px-3 py-1 text-[9px] font-black tracking-widest text-amber-600 uppercase mb-2">
                      {isHindi ? 'स्मार्ट विश्लेषण' : 'Intelligence Engine'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-900 mb-1 tracking-tight">{isHindi ? 'PYQ इंटेलिजेंस' : 'PYQ Intelligence Engine'}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-[280px]">
                      {isHindi ? 'पिछले वर्षों के प्रश्नों का SMART विश्लेषण और द्विभाषी याद रखने की मेमरी ट्रिक्स।' : 'Smart analysis of past exams with memory keys, weightage reports, and explanations.'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <Link 
                      href="/syllabus/quiz/pyq/intelligence"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-amber-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                          <Sparkles size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                            {isHindi ? 'विषय-वार इंटेलिजेंस विश्लेषण' : 'Subject-wise PYQ Intelligence'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'विशिष्ट टॉपिक्स के पिछले सालों के प्रश्न और ट्रेंड्स' : 'Examine visual trends and repeated questions by subject'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>

                    <Link 
                      href="/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-amber-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 border border-amber-100 text-amber-600">
                          <History size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors">
                            {isHindi ? 'वर्ष-वार पेपर्स (2020 - 2026)' : 'Year-wise PYQs (All Years)'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'सभी पिछले पेपर्स के प्रश्नों को व्याख्या के साथ हल करें' : 'Explore full past exam sheets with detailed explanations'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* 4. STRATEGIES & RECORD KEEPER */}
              <motion.div 
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-purple-50/60 border border-purple-200/80 px-3.5 py-6 sm:p-6 shadow-sm hover:shadow-xl transition-all"
              >
                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/5 blur-2xl pointer-events-none" />

                <div>
                  {/* Centered top icon & header layout mirroring /syllabus design */}
                  <div className="flex flex-col items-center text-center mb-5 mt-1">
                    <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100/80 border border-purple-200 text-purple-600 shadow-md">
                      <div className="absolute inset-0 rounded-full blur-md bg-purple-400/20 opacity-60" />
                      <Compass className="h-7 w-7 relative z-10" />
                    </div>
                    <span className="rounded-full bg-purple-100 border border-purple-200/80 px-3 py-1 text-[9px] font-black tracking-widest text-purple-600 uppercase mb-2">
                      {isHindi ? 'रणनीति मार्गदर्शक' : 'Strategy Guide'}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-purple-900 mb-1 tracking-tight">{isHindi ? 'रणनीति और इतिहास' : 'Strategy & History'}</h3>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold max-w-[280px]">
                      {isHindi ? 'अपने हल किए गए टेस्टों का इतिहास देखें और लेटेस्ट स्ट्रेटेजी ब्लॉग्स पढ़ें।' : 'Track past quiz attempts, correctness reports, and stay updated with tips.'}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <Link 
                      href="/syllabus/test-history"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-purple-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
                          <History size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                            {isHindi ? 'टेस्ट प्रयास इतिहास (Attempt History)' : 'Test Attempt History'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'अपने हल किए गए टेस्ट और गलत उत्तरों की समीक्षा करें' : 'Review accuracy analysis and see incorrect answers'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>

                    <Link 
                      href="/blogs"
                      className="flex items-center justify-between rounded-2xl bg-white/80 hover:bg-white p-3.5 transition-all group cursor-pointer border border-slate-200/60 hover:border-purple-300 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
                          <BookOpen size={16} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-slate-800 group-hover:text-purple-600 transition-colors">
                            {isHindi ? 'परीक्षा रणनीति और ब्लॉग्स' : 'Syllabus & Strategy Blogs'}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight font-semibold">
                            {isHindi ? 'अधिकारी बनने के टिप्स, बुकलिस्ट और सरकारी नोटिफिकेशन' : 'Explanatory posts, topper recommended tips and notifications'}
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-purple-600 transition-transform group-hover:translate-x-1 shrink-0 ml-1" />
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        )}

        {/* TAB 2: MY PROGRESS & DETAILED ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
              {/* 📝 STUDY PROGRESS — LEFT HUB */}
              <div className="lg:col-span-8 space-y-10">
                <div className="space-y-2">
                  <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                    {isHindi ? 'प्रगति और रिपोर्ट' : 'My Performance Report'}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="h-1 w-10 rounded-full bg-indigo-500/20" />
                    <p className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">
                      {isHindi ? 'परीक्षा परफॉरमेंस' : 'Exam Performance Insights'}
                    </p>
                  </div>
                </div>
                
                <AnalyticsDashboardWrapper 
                  analytics={analyticsData} 
                  actionCard={<DashboardActionCard totalTests={analyticsData?.totalTests || 0} />}
                />
              </div>

              {/* 📊 ANALYTICS — RIGHT SIDEBAR */}
              <div className="lg:col-span-4 lg:pl-4">
                <div className="lg:sticky lg:top-32 space-y-10">
                  {/* Subject Mastery — Desktop Optimized */}
                  <div className="hidden lg:block">
                    <div className="mb-4 space-y-2">
                      <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                        {isHindi ? 'विषयवार प्रवीणता' : 'Subject Mastery'}
                      </h3>
                      <div className="h-1 w-6 rounded-full bg-indigo-500/20" />
                    </div>
                    <SubjectMasteryWidget mastery={analyticsData?.mastery || []} />
                  </div>

                  {/* Progress Pod */}
                  <div className="group relative">
                    <div className="mb-4 space-y-2">
                      <h3 className="text-xs font-black tracking-[0.2em] text-slate-500 uppercase">
                        {isHindi ? 'सिलेबस की प्रगति' : 'Syllabus Progress'}
                      </h3>
                      <div className="h-1 w-6 rounded-full bg-indigo-500/20" />
                    </div>
                    
                    <SyllabusProgressWidget data={syllabusProgress} totalTopics={totalTopics} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
