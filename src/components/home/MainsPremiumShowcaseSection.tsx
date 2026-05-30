'use client';

import React, { useState, useEffect } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  BookOpen, 
  Layers, 
  Target, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  Flame,
  FileText,
  Bookmark,
  Scale,
  MapPin
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function MainsPremiumShowcaseSection() {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';

  const [activeTab, setActiveTab] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const mainsFeatures = [
    {
      id: 0,
      icon: Layers,
      titleEn: 'How to Think & Write Answers',
      titleHi: 'उत्तर कैसे सोचना और लिखना है',
      descEn: 'Master multiple high-scoring approaches and Double-Style Variations for every answer.',
      descHi: 'एक ही प्रश्न को अलग-अलग स्कोरिंग एप्रोच और डबल-स्टाइल उत्तर वेरिएशन से लिखना सीखें।',
      activeBorder: 'border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      tagEn: '2 VARIANTS',
      tagHi: '2 स्टाइल उत्तर',
    },
    {
      id: 1,
      icon: Target,
      titleEn: 'What to Study',
      titleHi: 'क्या पढ़ना है',
      descEn: 'Understand the unique subject-expert perspectives and precise boundaries for all Mains papers.',
      descHi: 'सभी पेपर्स के लिए विषय-विशेषज्ञों के अनूठे नज़रिए और सटीक संरचनात्मक ढाँचे को समझें।',
      activeBorder: 'border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.15)]',
      bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      tagEn: 'SYLLABUS DECODED',
      tagHi: 'सिलेबस डिकोडिंग',
    },
    {
      id: 2,
      icon: BookOpen,
      titleEn: 'Examiner\'s Angle & Patterns',
      titleHi: 'परीक्षक का वास्तविक दृष्टिकोण',
      descEn: 'Recognize the examiner\'s actual pattern and question weightage from official PYQs.',
      descHi: 'पिछले वर्षों के प्रश्नों (PYQs) से परीक्षक के वास्तविक प्रश्न-निर्माण पैटर्न को पहचानें।',
      activeBorder: 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      tagEn: 'PYQ PATTERNS',
      tagHi: 'PYQ पैटर्न',
    },
    {
      id: 3,
      icon: ShieldCheck,
      titleEn: 'Brahmastra Value Addition',
      titleHi: 'ब्रह्मास्त्र वैल्यू एडिशन',
      descEn: 'Ready-to-use constitutional articles, Supreme Court judgements, authentic surveys, and MP-specific dynamic facts.',
      descHi: 'उत्तरों में अंक बढ़ाने के लिए तैयार संवैधानिक अनुच्छेद, सुप्रीम कोर्ट जजमेंट, प्रामाणिक रिपोर्ट और मध्य प्रदेश के विशेष तथ्य।',
      activeBorder: 'border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.15)]',
      bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      tagEn: 'MARKS BOOSTERS',
      tagHi: 'अंक बढ़ाने के सूत्र',
    },
  ];

  // Auto-rotate tabs every 6 seconds unless hovered
  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % mainsFeatures.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isHovered, mainsFeatures.length]);

  const activeFeat = mainsFeatures[activeTab] || mainsFeatures[0];

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative overflow-hidden py-20 sm:py-32 bg-slate-950 text-white contain-layout border-y border-white/10 font-sans">
        {/* Hardware-accelerated background glows */}
        <div className="pointer-events-none absolute top-0 left-1/4 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px] will-change-transform" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-amber-500/10 blur-[120px] will-change-transform" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 relative z-10">
          <div className="mx-auto max-w-3xl text-center mb-16 sm:mb-24">
            <m.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-5 py-2 text-xs font-black uppercase tracking-widest text-amber-400 mb-6 shadow-lg shadow-amber-500/5"
            >
              <Flame className="h-4 w-4 text-amber-500 animate-pulse" />
              <span>{isHindi ? 'मेंस ज्ञान कोष · प्रीमियम हब' : 'Mains Gyan Kosh'}</span>
            </m.div>

            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.2] text-balance py-2"
            >
              {isHindi ? (
                <>
                  <span className="block text-slate-100 mb-2">MPPSC मेंस:</span>
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent block py-1">
                    रटना नहीं, लिखना सीखें
                  </span>
                </>
              ) : (
                <>
                  <span className="block text-slate-100 mb-2">MPPSC Mains:</span>
                  <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-400 bg-clip-text text-transparent block py-1">
                    Master The Art of Writing
                  </span>
                </>
              )}
            </m.h2>

            <p 
              className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-bold animate-fade-in-up" 
              style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
            >
              {isHindi 
                ? 'सिर्फ नोट्स जमा करने से मेंस क्लीयर नहीं होता। जानिए हर सिलेबस लाइन की असली डिमांड और सीखिए 2 अलग-अलग स्टाइल में उत्तर लिखने का विज्ञान।'
                : 'Mains isn\'t about hoarding PDFs—it\'s about structuring under time pressure. Unlock dual-style model answers and deep syllabus clarity.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            
            {/* Left side: Interactive Feature Grid */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5">
              {mainsFeatures.map((feat) => {
                const Icon = feat.icon;
                const isActive = activeTab === feat.id;
                return (
                  <button
                    type="button"
                    key={feat.id}
                    onClick={() => setActiveTab(feat.id)}
                    className={cn(
                      "w-full text-left group flex items-start gap-4 sm:gap-6 rounded-2xl sm:rounded-3xl border p-5 sm:p-7 transition-all duration-500 relative overflow-hidden cursor-pointer",
                      isActive 
                        ? cn("bg-slate-900 border-2", feat.activeBorder)
                        : "border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20"
                    )}
                  >
                    {isActive && (
                      <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full pointer-events-none" />
                    )}
                    <div className={cn("h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl sm:rounded-2xl flex items-center justify-center border transition-all duration-500", feat.bg)}>
                      <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                    </div>
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className={cn("text-lg sm:text-xl font-bold transition-colors duration-300", isActive ? "text-white font-black" : "text-slate-300 group-hover:text-white")}>
                          {isHindi ? feat.titleHi : feat.titleEn}
                        </h3>
                        {isActive && (
                          <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full animate-pulse">
                            {isHindi ? 'सक्रिय' : 'Active'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                        {isHindi ? feat.descHi : feat.descEn}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right side: Dynamic Animated Display Screen */}
            <div 
              className="lg:col-span-5 flex justify-center"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="relative w-full max-w-md">
                <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-tr from-emerald-600 via-amber-500 to-pink-600 opacity-30 blur-2xl transition-all duration-700 animate-pulse" />
                
                <Card className="relative overflow-hidden rounded-[2.5rem] border border-white/20 bg-slate-900 text-white shadow-2xl min-h-[500px] flex flex-col justify-between">
                  {/* Header with Demo Disclaimer */}
                  <div className="flex items-center justify-between border-b border-white/10 p-6 pb-4 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-ping" />
                      <span className="text-xs font-black uppercase tracking-widest text-emerald-400">MAINS DESK</span>
                      <span className="text-[10px] font-medium text-slate-500 italic ml-1">
                        {isHindi ? '(डेमो उद्देश्य / Sample Preview)' : '(Sample Preview)'}
                      </span>
                    </div>
                    <Badge className="bg-amber-500 text-slate-950 font-black border-none text-[10px] px-2.5 py-1 shadow-md">
                      {isHindi ? activeFeat.tagHi : activeFeat.tagEn}
                    </Badge>
                  </div>

                  {/* Dynamic Content Area with Smooth Animation */}
                  <div className="p-6 sm:p-8 flex-1 flex flex-col justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      
                      {/* TAB 0: Dual-Style Model Answers */}
                      {activeTab === 0 && (
                        <m.div 
                          key="tab0" 
                          initial={{ opacity: 0, y: 15 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -15 }} 
                          transition={{ duration: 0.4 }} 
                          className="space-y-4 text-left"
                        >
                          <div className="rounded-xl bg-white/5 p-4 border border-white/5 space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Syllabus Topic Line</span>
                            <p className="text-sm sm:text-base font-bold text-slate-100">
                              {isHindi ? '1857 का प्रथम स्वतंत्रता संग्राम: कारण एवं परिणाम' : 'First War of Independence 1857: Causes & Consequences'}
                            </p>
                            <div className="flex gap-2 pt-1">
                              <Badge variant="outline" className="text-[9px] border-emerald-500/40 text-emerald-400 bg-emerald-500/10">10m Question</Badge>
                              <Badge variant="outline" className="text-[9px] border-white/20 text-slate-300 bg-white/5">Paper I · Part A</Badge>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 space-y-2 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-400 uppercase tracking-wider">
                                  <Layers className="h-3 w-3" /> {isHindi ? 'वेरिएंट 1 (विश्लेषणात्मक)' : 'Variant 1 (Analytical)'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">~200 words</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                {isHindi 
                                  ? 'विप्लव का मूल कारण केवल चर्बी वाले कारतूस नहीं थे, बल्कि डलहौजी की व्यपगत का सिद्धांत और भू-राजस्व नीतियां थीं...'
                                  : 'The uprising was not sparked merely by greased cartridges, but deeply rooted in Dalhousie\'s Doctrine of Lapse...'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2 shadow-sm">
                              <div className="flex items-center justify-between">
                                <span className="inline-flex items-center gap-1 text-xs font-black text-amber-400 uppercase tracking-wider">
                                  <Layers className="h-3 w-3" /> {isHindi ? 'वेरिएंट 2 (बिंदुवार / MP एंगल)' : 'Variant 2 (Point-wise)'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">~180 words</span>
                              </div>
                              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                                {isHindi 
                                  ? 'सैनिक असंतोष के साथ-साथ बुंदेला विद्रोह (1842) की पृष्ठभूमि ने मध्य प्रदेश में नीमच व ग्वालियर से क्रांति का बिगुल फूंका...'
                                  : 'Alongside military unrest, the backdrop of the Bundela rebellion (1842) laid absolute foundation for revolts in Neemuch...'}
                              </p>
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-950 p-4 border border-white/10 space-y-1.5 text-center shadow-inner">
                            <div className="flex items-center justify-center gap-2 text-amber-400 font-bold text-xs">
                              <Award className="h-4 w-4" />
                              <span>{isHindi ? 'एक्सपर्ट टिप्स · टॉपर X-Factor' : 'Expert Tips · Topper X-Factor'}</span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                              {isHindi 
                                ? 'औसत छात्र केवल कारण लिखेगा, लेकिन टॉपर उत्तर की शुरुआत में 1857 के प्रमुख केंद्रों का 🗺️ मध्य प्रदेश मैप बनाएगा। (+1 अतिरिक्त अंक)'
                                : 'Average student lists general causes; topper draws an MP map 🗺️ pinpointing major revolt centers at the start. (+1 extra mark)'}
                            </p>
                          </div>
                        </m.div>
                      )}

                      {/* TAB 1: Deep Syllabus Grasp */}
                      {activeTab === 1 && (
                        <m.div 
                          key="tab1" 
                          initial={{ opacity: 0, y: 15 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -15 }} 
                          transition={{ duration: 0.4 }} 
                          className="space-y-4 text-left"
                        >
                          <div className="rounded-xl bg-amber-500/10 p-4 border border-amber-500/20 space-y-1.5">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Official Syllabus Line</span>
                            <p className="text-sm sm:text-base font-bold text-slate-100">
                              {isHindi ? 'भारतीय संविधान: उद्देशिका, मूल अधिकार व नीति निदेशक तत्व' : 'Indian Constitution: Preamble, Fundamental Rights & DPSP'}
                            </p>
                            <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-300 bg-amber-500/10 mt-1">Paper II · Unit 1</Badge>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                                <FileText className="h-3.5 w-3.5" /> {isHindi ? 'मर्म एवं मूलभाव (Core Concept)' : 'Essence & Context'}
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {isHindi 
                                  ? 'संविधान का दर्शन और नागरिकों व राज्य के बीच का सामाजिक अनुबंध। यह भाग लोकतांत्रिक व्यवस्था की नींव है।'
                                  : 'The philosophical soul of the Constitution establishing a social contract between citizens and the state.'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                              <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                                <Target className="h-3.5 w-3.5" /> {isHindi ? 'MPPSC परीक्षा डिमांड (Exam Angle)' : 'MPPSC Exam Demand'}
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed">
                                {isHindi 
                                  ? 'अनुच्छेद 14 से 32 तक के अपवाद और हालिया सुप्रीम कोर्ट के ऐतिहासिक फैसलों पर सीधे 7m और 10m सवाल बनते हैं।'
                                  : 'Direct 7m and 10m questions targeting exceptions from Art 14-32 and recent landmark Supreme Court verdicts.'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
                              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                <Bookmark className="h-3.5 w-3.5" /> {isHindi ? 'इन-स्कोप (परीक्षा के लिए क्या पढ़ें)' : 'In-Scope (What to study)'}
                              </h4>
                              <div className="space-y-1 text-xs text-slate-300">
                                <p className="flex items-center gap-2.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {isHindi ? 'प्रस्तावना में संशोधन व मूल ढांचा सिद्धांत' : 'Amendments to Preamble & Basic Structure'}
                                </p>
                                <p className="flex items-center gap-2.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> {isHindi ? 'मूल अधिकार बनाम नीति निदेशक तत्व' : 'Fundamental Rights vs DPSP harmony'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </m.div>
                      )}

                      {/* TAB 2: 6-Paper Expert Framework */}
                      {activeTab === 2 && (
                        <m.div 
                          key="tab2" 
                          initial={{ opacity: 0, y: 15 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -15 }} 
                          transition={{ duration: 0.4 }} 
                          className="space-y-4 text-left"
                        >
                          <div className="rounded-xl bg-blue-500/10 p-4 border border-blue-500/20 space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">Paper V & VI Preview</span>
                              <Badge className="bg-blue-500 text-white font-black text-[9px] border-none px-2 py-0.5">शुद्ध हिंदी माध्यम</Badge>
                            </div>
                            <p className="text-sm sm:text-base font-bold text-slate-100 font-[family-name:var(--font-pyq-dev)]">
                              पेपर V (सामान्य हिंदी एवं व्याकरण) · पेपर VI (हिंदी निबंध एवं प्रारूप लेखन)
                            </p>
                            <span className="text-[10px] text-slate-400 block pt-0.5">अंग्रेजी माध्यम के छात्रों के लिए भी यह पेपर अनिवार्यतः हिंदी में ही होता है।</span>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                              <h4 className="text-xs font-black text-white uppercase tracking-wider border-b border-white/10 pb-2">
                                प्रारूप लेखन: शासकीय व अर्ध-शासकीय पत्र में अंतर
                              </h4>
                              <div className="space-y-2 text-xs text-slate-300 pt-1 leading-relaxed font-[family-name:var(--font-pyq-dev)]">
                                <p className="flex items-start gap-2">
                                  <span className="text-blue-400 font-bold">●</span>
                                  <span><strong>शासकीय पत्र (Official Letter):</strong> पूर्णतः औपचारिक होते हैं, तटस्थ भाषा का प्रयोग होता है और यह पद से पद को भेजे जाते हैं।</span>
                                </p>
                                <p className="flex items-start gap-2">
                                  <span className="text-blue-400 font-bold">●</span>
                                  <span><strong>अर्ध-शासकीय पत्र (D.O. Letter):</strong> में व्यक्तिगत स्पर्श व आत्मीय भाषा (जैसे 'प्रिय श्री...') का प्रयोग होता है। यह अधिकारी द्वारा दूसरे अधिकारी को व्यक्तिगत ध्यान आकर्षित करने हेतु भेजे जाते हैं।</span>
                                </p>
                              </div>
                            </div>

                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 space-y-2">
                              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-[family-name:var(--font-pyq-dev)]">
                                <Award className="h-3.5 w-3.5" /> निबंध लेखन रणनीति (Essay Strategy)
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed font-[family-name:var(--font-pyq-dev)]">
                                1000 शब्दों के निबंध में प्रासंगिक कविता, कबीर के दोहे या संस्कृत श्लोक (जैसे <em>'यत्र नार्यस्तु पूज्यन्ते...'</em>) से शुरुआत करने पर परीक्षक पर उत्कृष्ट प्रभाव पड़ता है।
                              </p>
                            </div>
                          </div>
                        </m.div>
                      )}

                      {/* TAB 3: Brahmastra Value Addition */}
                      {activeTab === 3 && (
                        <m.div 
                          key="tab3" 
                          initial={{ opacity: 0, y: 15 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          exit={{ opacity: 0, y: -15 }} 
                          transition={{ duration: 0.4 }} 
                          className="space-y-4 text-left"
                        >
                          <div className="rounded-xl bg-pink-500/10 p-4 border border-pink-500/20 space-y-1.5">
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">Brahmastra Selection Kit</span>
                            <p className="text-sm sm:text-base font-bold text-slate-100">
                              {isHindi ? 'अंक बढ़ाने के विशेष ब्रह्मास्त्र तथ्य (Value Additions)' : 'Dynamic Fact Anchors for +1 Mark'}
                            </p>
                            <span className="text-[10px] text-slate-400 block pt-0.5">
                              {isHindi ? 'सामान्य उत्तर को असाधारण बनाने वाले प्रमाणित इनपुट्स।' : 'Turn standard answers into topper-grade submissions.'}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                              <h4 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                                <Scale className="h-3.5 w-3.5" /> {isHindi ? 'संवैधानिक अनुच्छेद (Constitutional Anchor)' : 'Constitutional Article'}
                              </h4>
                              <p className="text-xs text-slate-200 font-semibold bg-white/5 p-2.5 rounded-lg border border-white/5">
                                {isHindi ? 'अनुच्छेद 38: राज्य लोक कल्याण की अभिवृद्धि के लिए सामाजिक व्यवस्था बनाएगा।' : 'Article 38: State to secure a social order for the promotion of welfare of the people.'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                              <h4 className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                                <BookOpen className="h-3.5 w-3.5" /> {isHindi ? 'सुप्रीम कोर्ट जजमेंट (Landmark Case)' : 'Supreme Court Verdict'}
                              </h4>
                              <p className="text-xs text-slate-300 leading-relaxed italic bg-white/5 p-2.5 rounded-lg border border-white/5">
                                {isHindi 
                                  ? 'मिनर्वा मिल्स मामला (1980): "संविधान की नींव भाग III (मूल अधिकार) और भाग IV (नीति निदेशक तत्व) के बीच संतुलन पर रखी गई है।"'
                                  : 'Minerva Mills Case (1980): "The Indian Constitution is founded on the bedrock of the balance between Part III and Part IV."'}
                              </p>
                            </div>

                            <div className="rounded-2xl border border-pink-500/20 bg-pink-500/10 p-4 space-y-2">
                              <h4 className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" /> {isHindi ? 'मध्य प्रदेश विशेष तथ्य (MP Dynamic Fact)' : 'MP Dynamic Fact'}
                              </h4>
                              <p className="text-xs text-slate-200 leading-relaxed">
                                {isHindi 
                                  ? 'महिला सशक्तिकरण के उत्तर में मध्य प्रदेश की "लाड़ली बहना योजना" और ग्रामीण अर्थव्यवस्था में इसके प्रभाव का उल्लेख करें।'
                                  : 'Cite MP\'s "Ladli Behna Yojana" to substantiate female financial inclusion and boost rural economic demand.'}
                              </p>
                            </div>
                          </div>
                        </m.div>
                      )}

                    </AnimatePresence>
                  </div>

                  {/* Footer Action */}
                  <div className="p-6 pt-0 bg-white/[0.01]">
                    <Link 
                      href="/mains/syllabus"
                      className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-xs font-black text-slate-950 uppercase tracking-wider transition-all hover:bg-slate-100 active:scale-95 shadow-lg"
                    >
                      <span>{isHindi ? 'मेंस लाइब्रेरी एक्सप्लोर करें' : 'Explore Mains Library'}</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </Card>
              </div>
            </div>

          </div>
        </div>
      </section>
    </LazyMotion>
  );
}
