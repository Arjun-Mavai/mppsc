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
  Bookmark,
  Shield,
  Target,
  CheckCircle2,
  Phone,
  Send
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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

  // First-Login Expectation Setting & Welcome Tour State
  const [showWelcomeTour, setShowWelcomeTour] = React.useState(false);
  const [tourStep, setTourStep] = React.useState(1);

  React.useEffect(() => {
    const day = new Date().getDate();
    setQuote(STUDY_QUOTES[day % STUDY_QUOTES.length]);

    if (typeof window !== 'undefined') {
      const isFreshPayment = sessionStorage.getItem('payment_success_fresh') === 'true';
      const alreadyTourShown = localStorage.getItem('welcome_tour_completed') === 'true';
      if (isFreshPayment && !alreadyTourShown) {
        setShowWelcomeTour(true);
        sessionStorage.removeItem('payment_success_fresh');
      }
    }
  }, []);

  const hasPre = hasPreAccess(user);
  const hasMains = hasMainsAccess(user);
  const isCombo = hasPre && hasMains;
  const isMainsOnly = hasMains && !hasPre;
  
  // Rules for showing lock screens (lock if they don't have that specific product access)
  const showPreLock = !hasPre;
  const showMainsLock = !hasMains; 
  const showPyqLock = !hasPre;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/50 pb-24 font-sans text-slate-900 selection:bg-indigo-500/30">
      {/* Vibrant Premium Background Gradients */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] h-[70%] w-[60%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] h-[60%] w-[50%] rounded-full bg-emerald-100/50 blur-[120px]" />
        <div className="absolute top-[30%] right-[-5%] h-[50%] w-[50%] rounded-full bg-purple-100/50 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] h-[50%] w-[40%] rounded-full bg-amber-100/40 blur-[120px]" />
      </div>

      {/* 🏷️ BILINGUAL HEADER */}
      <DashboardHeader user={user} />

      <main className="relative z-10 mx-auto max-w-5xl px-4 py-8">
        
        {/* PREMIUM WELCOME CARD */}
        <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-6 md:p-8 text-white shadow-2xl border border-slate-800/80">
          <div className="absolute top-[-50%] left-[-20%] h-[200px] w-[200px] rounded-full bg-indigo-500/10 blur-[60px]" />
          <div className="absolute bottom-[-50%] right-[-10%] h-[250px] w-[250px] rounded-full bg-violet-600/10 blur-[80px]" />
          
          {/* PRO Badge in Top Right */}
          {(hasPre || hasMains) && (
            <div className="absolute top-6 right-6 z-20">
              {(() => {
                if (isCombo) {
                  return (
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-amber-500 border border-amber-500/20 shadow-2xl backdrop-blur-md">
                      <Sparkles size={12} className="fill-amber-500" />
                      PRO+
                    </div>
                  );
                }
                if (hasMains) {
                  return (
                    <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-emerald-400 border border-emerald-400/20 shadow-2xl backdrop-blur-md">
                      <Sparkles size={12} className="fill-emerald-400" />
                      MAINS
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-1.5 rounded-full bg-amber-400/10 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-amber-400 border border-amber-400/20 shadow-2xl backdrop-blur-md">
                    <Crown size={12} className="fill-amber-400" />
                    PRO
                  </div>
                );
              })()}
            </div>
          )}

          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-4">
              {/* Premium Status Badge Restored */}
              <div className="flex flex-wrap items-center gap-2">
                {isCombo ? (
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                    <Sparkles size={12} className="text-amber-400 fill-amber-400/20 shrink-0" />
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
        {!isMainsOnly && (
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
        )}

        {/* TAB 1: STUDY HUB (LAUNCHPAD PORTAL) */}
        {(activeTab === 'study' || isMainsOnly) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div className={cn("grid gap-8", isMainsOnly ? "grid-cols-1 max-w-2xl mx-auto" : "grid-cols-1 md:grid-cols-2")}>
              
              {/* 1. PRELIMS PREP HUB */}
              {!isMainsOnly && (
              <LauncherCard
                title={isHindi ? 'प्रिलिम्स विजय पथ' : 'Prelims Victory Path'}
                subtitle={isHindi ? 'तैयारी का आधार' : 'The Foundation'}
                icon={<GraduationCap className="h-6 w-6" />}
                color="blue"
                showLock={showPreLock}
                lockTitle={isHindi ? 'प्रारंभिक परीक्षा प्रीमियम' : 'Prelims Premium'}
                lockDesc={isHindi ? 'यूनिट/टॉपिक टेस्ट और प्रीलिम्स सिलेबस अनलॉक करें।' : 'Unlock Prelims units practice, mocks, and micro syllabus tracking.'}
                onUnlock={() => router.push('/upgrade')}
                unlockText={isHindi ? 'प्रीमियम अनलॉक करें' : 'Unlock Now'}
              >
                <LauncherLink
                  href="/syllabus"
                  icon={<BookOpen size={18} />}
                  title={isHindi ? 'सिलेबस डीप-डाइव और Active Recall' : 'Syllabus Deep-Dive & Active Recall'}
                  description={isHindi ? 'सिलेबस टॉपिक्स की गहरी समझ, सक्रिय याद करने की पद्धति और एक्सपर्ट एक्सप्लेनेशन।' : 'Deep understanding of syllabus topics with active recall questions and expert explanations.'}
                  color="amber"
                />
                <LauncherLink
                  href="/syllabus/quiz/pyq"
                  icon={<Bookmark size={18} />}
                  title={isHindi ? 'परीक्षा स्तर टेस्ट प्रैक्टिस (Test Series)' : 'Exam-Level Test Practice (Test Series)'}
                  description={isHindi ? 'मॉक टेस्ट, यूनिट टेस्ट और परीक्षा-स्तर प्रश्नों के साथ संपूर्ण अभ्यास करें।' : 'Target weaknesses with unit-wise mocks and topic practice.'}
                  color="purple"
                />
                <LauncherLink
                  href="/free-quiz"
                  icon={<Zap size={18} />}
                  title={isHindi ? 'डेली फ्री क्विज़ (मेमरी बूस्टर)' : 'Daily Free Quiz (Memory Booster)'}
                  description={isHindi ? 'दैनिक प्रश्नों के साथ कठिन तथ्यों का रिवीजन करें' : 'Boost retention scores with daily revision micro-tests'}
                  color="emerald"
                />
              </LauncherCard>
              )}

              {/* 2. MAINS PREP HUB */}
              <LauncherCard
                title={isHindi ? 'मेंस राइटिंग स्टूडियो' : 'Mains Writing Studio'}
                subtitle={isHindi ? 'लिखने की कला' : 'Master Writing'}
                icon={<Crown className="h-6 w-6" />}
                color="emerald"
                showLock={showMainsLock}
                lockTitle={isHindi ? 'मुख्य परीक्षा प्रीमियम' : 'Mains Premium'}
                lockDesc={isHindi ? 'डबल-स्टाइल MODEL उत्तर और मेंस PYQ LIBRARY खोलें।' : 'Unlock expert double-style model answers mapped to your syllabus.'}
                onUnlock={() => router.push('/mains/syllabus')}
                unlockText={isHindi ? 'मेंस अनलॉक करें' : 'Unlock Mains'}
              >
                <LauncherLink
                  href="/mains/syllabus"
                  icon={<Crown size={18} />}
                  title={isHindi ? 'सिलेबस की गहरी समझ एवं PYQ एकीकरण' : 'Syllabus Deep Understanding & PYQ Integration'}
                  description={isHindi ? 'सिलेबस के हर टॉपिक को गहराई से समझें, पिछले वर्षों के प्रश्नों (PYQ) के साथ।' : 'Master syllabus topics in depth, perfectly integrated with previous year questions.'}
                  color="purple"
                />
                <LauncherLink
                  href="/mains/syllabus/pyq-library"
                  icon={<Library size={18} />}
                  title={isHindi ? 'मेंस PYQ इनसाइट लाइब्रेरी' : 'Mains PYQ Insight Library'}
                  description={isHindi ? 'पिछले प्रश्नों में छिपी परीक्षा की सोच और प्रवृत्ति को समझें।' : 'Discover the patterns and expectations hidden within previous year questions.'}
                  color="amber"
                />
              </LauncherCard>

              {/* 3. PYQ INTELLIGENCE ENGINE */}
              {!isMainsOnly && (
              <LauncherCard
                title={isHindi ? 'PYQ इंटेलिजेंस इंजन' : 'PYQ Intelligence Engine'}
                subtitle={isHindi ? 'डेटा की शक्ति' : 'Power of Data'}
                icon={<Sparkles className="h-6 w-6" />}
                color="amber"
                showLock={showPyqLock}
                lockTitle={isHindi ? 'PYQ इंटेलिजेंस' : 'PYQ Intelligence'}
                lockDesc={isHindi ? 'विषय-वार और वर्ष-वार इंटेलिजेंस विश्लेषण अनलॉक करें।' : 'Analyze repeating trends, and access bilingual mnemonics for PYQs.'}
                onUnlock={() => router.push('/upgrade')}
                unlockText={isHindi ? 'इंजन अनलॉक करें' : 'Unlock Engine'}
              >
                <LauncherLink
                  href="/syllabus/quiz/pyq/intelligence"
                  icon={<Sparkles size={18} />}
                  title={isHindi ? 'विषय-वार इंटेलिजेंस विश्लेषण' : 'Subject-wise PYQ Intelligence'}
                  description={isHindi ? 'विशिष्ट टॉपिक्स के पिछले सालों के प्रश्न और ट्रेंड्स' : 'Examine visual trends and repeated questions by subject'}
                  color="purple"
                />
                <LauncherLink
                  href="/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject"
                  icon={<History size={18} />}
                  title={isHindi ? 'वर्ष-वार पेपर्स (2020 - 2026)' : 'Year-wise PYQs (All Years)'}
                  description={isHindi ? 'सभी पिछले पेपर्स के प्रश्नों को व्याख्या के साथ हल करें' : 'Explore full past exam sheets with detailed explanations'}
                  color="blue"
                />
              </LauncherCard>
              )}

              {/* 4. STRATEGIES & RECORD KEEPER */}
              {!isMainsOnly && (
              <LauncherCard
                title={isHindi ? 'रणनीति और इतिहास' : 'Strategy & History'}
                subtitle={isHindi ? 'सफलता का रोडमैप' : 'Success Roadmap'}
                icon={<Compass className="h-6 w-6" />}
                color="purple"
              >
                <LauncherLink
                  href="/syllabus/test-history"
                  icon={<History size={18} />}
                  title={isHindi ? 'टेस्ट प्रयास इतिहास (Attempt History)' : 'Test Attempt History'}
                  description={isHindi ? 'अपने हल किए गए टेस्ट और गलत उत्तरों की समीक्षा करें' : 'Review accuracy analysis and see incorrect answers'}
                  color="emerald"
                />
                <LauncherLink
                  href="/blogs"
                  icon={<BookOpen size={18} />}
                  title={isHindi ? 'परीक्षा रणनीति और ब्लॉग्स' : 'Syllabus & Strategy Blogs'}
                  description={isHindi ? 'अधिकारी बनने के टिप्स, बुकलिस्ट और सरकारी नोटिफिकेशन' : 'Explanatory posts, topper recommended tips and notifications'}
                  color="amber"
                />
              </LauncherCard>
              )}

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

      {/* Premium Welcome & Orientation Tour Modal */}
      <Dialog open={showWelcomeTour} onOpenChange={(open) => {
        if (!open) {
          localStorage.setItem('welcome_tour_completed', 'true');
          setShowWelcomeTour(false);
        }
      }}>
        <DialogContent className="max-w-md rounded-[2rem] border border-slate-100 bg-white/95 p-6 shadow-2xl backdrop-blur-xl">
          {tourStep === 1 && (
            <div className="space-y-4 py-2">
              <DialogHeader className="text-center pb-2 border-b border-zinc-100">
                <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold mb-1">
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                  <span>{isHindi ? 'स्वागत है!' : 'Welcome to ZenScroll!'}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-950">
                  {isHindi ? 'आपका प्रीमियम एक्सेस शुरू हो गया है!' : 'Your Premium Access is Active! 🎉'}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  {isHindi
                    ? 'कृपया 1 मिनट में समझें कि इस प्लेटफ़ॉर्म का उपयोग कैसे करें:'
                    : 'Let\'s take 1 minute to understand how to get the maximum value:'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 text-xs">
                <div className="flex gap-3 items-start bg-amber-500/10 p-3.5 rounded-xl border border-amber-500/20">
                  <Shield className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900">{isHindi ? 'इंटरैक्टिव लर्निंग प्लेटफ़ॉर्म' : 'Expectation Settings Check'}</p>
                    <p className="mt-1 leading-relaxed text-slate-700 font-medium">
                      {isHindi 
                        ? 'ZenScroll पारंपरिक PDF नोट्स लाइब्रेरी नहीं है। यहाँ आप सिलेबस के अनुसार पॉइंट-बाय-पॉइंट अभ्यास, मॉडल आंसर्स और प्रोग्रेस ट्रैकर के साथ तैयारी करेंगे।' 
                        : 'ZenScroll is a structured learning system, not a static PDF dump. You will interact with topic-wise syllabus nodes, practice PYQs, and see progress charts.'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                  <Target className="h-5 w-5 text-slate-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-800">{isHindi ? 'तैयारी का सही तरीका' : 'Right Way to Prepare'}</p>
                    <p className="mt-1 leading-relaxed text-slate-600 font-medium whitespace-pre-line">
                      {isHindi 
                        ? '1. सिलेबस हब से शुरुआत करें।\n2. टॉपिक-wise अभ्यास और मॉडल आंसर्स देखें।\n3. अपने व्यक्तिगत ट्रैकर से प्रगति देखें।' 
                        : '1. Start from the Syllabus Hub.\n2. Navigate through topics to view model answers and practice questions.\n3. Track your subject mastery.'}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setTourStep(2)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
              >
                {isHindi ? 'अगला चरण →' : 'Next Step →'}
              </Button>
            </div>
          )}

          {tourStep === 2 && (
            <div className="space-y-4 py-2">
              <DialogHeader className="text-center pb-2 border-b border-zinc-100">
                <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-semibold mb-1">
                  <Target className="h-3.5 w-3.5" />
                  <span>{isHindi ? 'महत्वपूर्ण फीचर्स' : 'Key Features'}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-950">
                  {isHindi ? 'ZenScroll के 3 स्तंभ' : 'The 3 Pillars of ZenScroll'}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  {isHindi
                    ? 'इन फीचर्स का उपयोग करके आपकी तैयारी 2x बेहतर होगी:'
                    : 'Use these features to boost your preparation by 2x:'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3 text-xs font-medium">
                <div className="flex items-center gap-3 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-indigo-900">{isHindi ? 'सिलेबस हब:' : 'Syllabus Hub:'}</span>{' '}
                    <span className="text-slate-600">{isHindi ? 'पूरे सिलेबस की टॉपिक-wise कवरेज।' : 'Topic-wise coverage of the entire syllabus.'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-emerald-900">{isHindi ? 'डबल मॉडल उत्तर:' : 'Double Model Answers:'}</span>{' '}
                    <span className="text-slate-600">{isHindi ? 'दोस्त जैसा उत्तर और अधिकारी स्तर का उत्तर।' : 'Simple learner-friendly answers + advanced officer-level answers.'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-2 bg-purple-50/50 rounded-lg border border-purple-100">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="font-bold text-purple-900">{isHindi ? 'स्मार्ट प्रैक्टिस और ट्रैकर:' : 'Smart Practice & Tracker:'}</span>{' '}
                    <span className="text-slate-600">{isHindi ? 'अपनी कमियों को पहचानें और सुधारें।' : 'Identify your weak areas and improve target topics.'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setTourStep(1)}
                  className="w-1/3 border-slate-200 text-slate-700"
                >
                  {isHindi ? 'पीछे' : 'Back'}
                </Button>
                <Button
                  onClick={() => setTourStep(3)}
                  className="w-2/3 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl shadow-lg transition-transform active:scale-95"
                >
                  {isHindi ? 'अगला चरण →' : 'Next Step →'}
                </Button>
              </div>
            </div>
          )}

          {tourStep === 3 && (
            <div className="space-y-4 py-2">
              <DialogHeader className="text-center pb-2 border-b border-zinc-100">
                <div className="inline-flex mx-auto items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-1">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{isHindi ? 'सपोर्ट और कम्युनिटी' : 'Support & Community'}</span>
                </div>
                <DialogTitle className="text-xl font-bold text-zinc-950">
                  {isHindi ? 'हम हमेशा आपके साथ हैं' : 'We are here to help! 🤝'}
                </DialogTitle>
                <DialogDescription className="text-xs text-zinc-500">
                  {isHindi
                    ? 'तैयारी के दौरान किसी भी प्रश्न या सहायता के लिए:'
                    : 'For any questions or guidance during your preparation:'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3.5 text-xs leading-relaxed text-slate-600">
                <p className="font-medium text-center">
                  {isHindi ? (
                    <>
                      📢 <strong>सपोर्ट चैनल्स:</strong> हमारी सपोर्ट टीम से जुड़ने के लिए नीचे दिए गए व्हाट्सएप या टेलीग्राम बटनों पर क्लिक करें।
                    </>
                  ) : (
                    <>
                      📢 <strong>Support Channels:</strong> Connect with our support team instantly via WhatsApp or Telegram below.
                    </>
                  )}
                </p>

                <div className="grid grid-cols-2 gap-3 pb-1">
                  <Button
                    asChild
                    className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-800 font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <a href="https://wa.me/917489388350?text=Hi,%20I%20need%20help%20with%20the%20MPPSC%20App." target="_blank" rel="noopener noreferrer">
                      <Phone className="h-4 w-4 text-green-600" />
                      <span>WhatsApp</span>
                    </a>
                  </Button>
                  <Button
                    asChild
                    className="w-full bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 font-bold py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <a href="https://t.me/mppsc_conversation_bot?start=dashboard" target="_blank" rel="noopener noreferrer">
                      <Send className="h-4 w-4 text-sky-600" />
                      <span>Telegram</span>
                    </a>
                  </Button>
                </div>

                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center bg-slate-50 text-slate-500 font-bold">
                  {isHindi ? 'सपोर्ट टाइम: सुबह 10:00 से शाम 7:00 बजे' : 'Support Hours: 10:00 AM to 7:00 PM'}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => {
                    localStorage.setItem('welcome_tour_completed', 'true');
                    setShowWelcomeTour(false);
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-transform active:scale-95"
                >
                  {isHindi ? 'डैशबोर्ड पर जाएं' : 'Go to Dashboard'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** ──────────────────────────────────────────────────────────────────────────
 * 🛠️ INTERNAL HELPER COMPONENTS (Production-Ready Clean Code)
 * ────────────────────────────────────────────────────────────────────────── */

interface LauncherCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
  children: React.ReactNode;
  showLock?: boolean;
  lockTitle?: string;
  lockDesc?: string;
  onUnlock?: () => void;
  unlockText?: string;
}

function LauncherCard({ 
  title, subtitle, icon, color, children, 
  showLock, lockTitle, lockDesc, onUnlock, unlockText 
}: LauncherCardProps) {
  
  const colorMap = {
    blue: 'bg-blue-600 text-blue-600 shadow-blue-200 border-blue-100',
    emerald: 'bg-emerald-600 text-emerald-600 shadow-emerald-200 border-emerald-100',
    amber: 'bg-amber-500 text-amber-600 shadow-amber-200 border-amber-100',
    purple: 'bg-purple-600 text-purple-600 shadow-purple-200 border-purple-100',
  };

  const cardBgMap = {
    blue: 'bg-gradient-to-br from-blue-50/80 to-white/95 border-blue-100/60 shadow-blue-900/5',
    emerald: 'bg-gradient-to-br from-emerald-50/80 to-white/95 border-emerald-100/60 shadow-emerald-900/5',
    amber: 'bg-gradient-to-br from-amber-50/80 to-white/95 border-amber-100/60 shadow-amber-900/5',
    purple: 'bg-gradient-to-br from-purple-50/80 to-white/95 border-purple-100/60 shadow-purple-900/5',
  };

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={cn("group relative flex flex-col overflow-hidden rounded-[2.5rem] border shadow-xl backdrop-blur-xl transition-all duration-300", cardBgMap[color])}
    >
      {showLock && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 backdrop-blur-[4px] p-8 text-center animate-in fade-in duration-300">
          <div className={cn("mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm", colorMap[color].replace('bg-', 'bg-').split(' ')[0] + '/10')}>
            <Lock size={22} className={colorMap[color].split(' ')[1]} />
          </div>
          <h4 className="text-base font-black text-slate-800 uppercase tracking-wider">{lockTitle}</h4>
          <p className="mt-2 text-xs text-slate-500 max-w-[240px] leading-relaxed font-medium">{lockDesc}</p>
          <button 
            onClick={onUnlock}
            className={cn("mt-6 flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-black uppercase tracking-widest text-white transition-all cursor-pointer shadow-lg active:scale-95", colorMap[color].split(' ')[0])}
          >
            <Sparkles size={12} className="fill-current text-white" />
            <span>{unlockText}</span>
          </button>
        </div>
      )}

      <div className="p-7">
        <div className="flex items-center gap-4 mb-8">
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg", colorMap[color].split(' ')[0])}>
            {icon}
          </div>
          <div>
            <span className={cn("inline-block rounded-full px-3 py-0.5 text-[9px] font-black tracking-widest uppercase mb-0.5", colorMap[color].replace('bg-', 'bg-').split(' ')[0] + '/10', colorMap[color].split(' ')[1])}>
              {subtitle}
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
        </div>

        <div className="space-y-4">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

interface LauncherLinkProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}

function LauncherLink({ href, icon, title, description, color }: LauncherLinkProps) {
  const colorMap = {
    blue: 'bg-blue-50/50 hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm hover:text-blue-700',
    emerald: 'bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-200 hover:shadow-sm hover:text-emerald-700',
    amber: 'bg-amber-50/50 hover:bg-amber-50 hover:border-amber-200 hover:shadow-sm hover:text-amber-700',
    purple: 'bg-purple-50/50 hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm hover:text-purple-700',
  };

  const iconColorMap = {
    blue: 'group-hover/item:bg-blue-600 text-blue-600',
    emerald: 'group-hover/item:bg-emerald-600 text-emerald-600',
    amber: 'group-hover/item:bg-amber-500 text-amber-600',
    purple: 'group-hover/item:bg-purple-600 text-purple-600',
  };

  const arrowColorMap = {
    blue: 'group-hover/item:text-blue-600',
    emerald: 'group-hover/item:text-emerald-600',
    amber: 'group-hover/item:text-amber-600',
    purple: 'group-hover/item:text-purple-600',
  };

  return (
    <Link href={href} className={cn("group/item flex items-start gap-4 p-4 rounded-3xl border border-transparent hover:bg-white transition-all", colorMap[color].split(' ')[0], colorMap[color].split(' ')[1], colorMap[color].split(' ')[2])}>
      <div className={cn("mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white border border-slate-100 shadow-sm transition-all group-hover/item:text-white", iconColorMap[color])}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[13px] font-black text-slate-900 leading-none">
            {title}
          </span>
          <ArrowRight size={14} className={cn("text-slate-300 group-hover/item:translate-x-1 transition-all", arrowColorMap[color])} />
        </div>
        <p className="mt-1.5 text-[11px] font-medium text-slate-500 leading-snug group-hover/item:text-slate-600">
          {description}
        </p>
      </div>
    </Link>
  );
}
