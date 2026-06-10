'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  TrendingUp,
  ArrowLeft,
  Target,
  Zap,
  Info,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function PYQAnalysisGuideClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('bilingual');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
      <div className="mx-auto max-w-[1000px] px-4 pt-10 sm:px-6 lg:px-8 w-full">
        {/* Back Button */}
        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="group mb-8 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 shadow-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Analysis
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          className="mb-12 space-y-4 text-center"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-1.5 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-slate-200">
            <Sparkles className="h-3.5 w-3.5" />
            Strategy Masterclass
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Analyze Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-emerald-600">Topper</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500 border-b border-slate-100 pb-4">
            {activeTab === 'hindi' 
              ? 'डेटा और रुझानों (Trends) को समझना सीखें ताकि आपकी तैयारी 100% सटीक हो।' 
              : 'Master the art of decoding data and trends to make your preparation 100% accurate.'}
          </p>
        </motion.div>

        <Tabs defaultValue="bilingual" className="w-full overflow-x-hidden" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-10 overflow-x-auto pb-2">
            <TabsList className="bg-slate-50 border border-slate-200 shadow-sm rounded-2xl h-12 p-1 flex-nowrap min-w-max">
              <TabsTrigger value="bilingual" className="rounded-xl px-6 font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                Bilingual Guide
              </TabsTrigger>
              <TabsTrigger value="english" className="rounded-xl px-6 font-bold">
                English
              </TabsTrigger>
              <TabsTrigger value="hindi" className="rounded-xl px-6 font-bold">
                हिन्दी
              </TabsTrigger>
              <TabsTrigger value="technical" className="rounded-xl px-6 font-bold bg-amber-500/10 text-amber-600 data-[state=active]:bg-amber-600 data-[state=active]:text-white border border-amber-200 ml-2">
                Admin Tech 🛠️
              </TabsTrigger>
            </TabsList>
          </div>

          <AnimatePresence mode="wait">
            <TabsContent value={activeTab} className="mt-0">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid gap-10"
              >
                {/* 1. THE BASICS: INTUITIVE CARDS */}
                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden rounded-[2.5rem] border-blue-100 bg-white shadow-xl shadow-blue-500/5">
                    <div className="grid md:grid-cols-12">
                      <div className="bg-blue-50 p-8 md:col-span-4 flex flex-col justify-center items-center text-center border-r border-blue-100/50">
                        <div className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-blue-100">
                          <BarChart3 className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-black text-blue-900 leading-tight">Overall Importance</h2>
                        <p className="text-blue-600 font-bold mt-2 text-sm italic">कुल वेटेज (Overall Weightage)</p>
                      </div>
                      <div className="p-8 md:col-span-8 space-y-6">
                        <div className="space-y-4">
                          <div className={cn("space-y-3", activeTab === 'english' ? 'block' : activeTab === 'hindi' ? 'hidden' : 'block')}>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-500" />
                              What is Overall Weight?
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              It shows the topic\'s share in all questions since 2020. This is the "Gold Standard" of importance. High weightage means it is a preparation pillar.
                            </p>
                          </div>
                          <div className={cn("space-y-3 border-t border-slate-100 pt-4", activeTab === 'english' ? 'hidden' : activeTab === 'hindi' ? 'block pt-0 border-0' : 'block')}>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Target className="h-5 w-5 text-blue-500" />
                              कुल वेटेज (Overall Weight) क्या है?
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              यह बताता है कि 2020 से अब तक के सभी सवालों में इस टॉपिक का कितना हिस्सा रहा है। यह टॉपिक की "सदाबहार" महत्ता को दर्शाता है।
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Card className="overflow-hidden rounded-[2.5rem] border-emerald-100 bg-white shadow-xl shadow-emerald-500/5">
                    <div className="grid md:grid-cols-12">
                      <div className="bg-emerald-50 p-8 md:col-span-4 flex flex-col justify-center items-center text-center border-r border-emerald-100/50">
                        <div className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-emerald-100">
                          <TrendingUp className="h-10 w-10 text-emerald-600" />
                        </div>
                        <h2 className="text-2xl font-black text-emerald-900 leading-tight">Trending Momentum</h2>
                        <p className="text-emerald-600 font-bold mt-2 text-sm italic">हॉट ट्रेंड्स (Rising Topics)</p>
                      </div>
                      <div className="p-8 md:col-span-8 space-y-6">
                        <div className="space-y-4">
                          <div className={cn("space-y-3", activeTab === 'english' ? 'block' : activeTab === 'hindi' ? 'hidden' : 'block')}>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-emerald-500" />
                              More vs Last Year
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              These are topics that paper-setters are focusing on NOW. If a topic has a "+4 more" trend, it means 4 extra questions were asked this year compared to last year.
                            </p>
                          </div>
                          <div className={cn("space-y-3 border-t border-slate-100 pt-4", activeTab === 'english' ? 'hidden' : activeTab === 'hindi' ? 'block pt-0 border-0' : 'block')}>
                            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-emerald-500" />
                              पिछले साल से अधिक
                            </h3>
                            <p className="text-slate-600 leading-relaxed font-medium">
                              ये वे विषय हैं जिन पर आयोग अभी ज़्यादा ध्यान दे रहा है। अगर आप "+4 अधिक" देखते हैं, तो इसका मतलब है कि पिछले साल के मुकाबले इस बार 4 नए सवाल बढ़े हैं।
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* 2. THE DEEP DIVE: DATA CLARIFICATION */}
                <motion.div variants={itemVariants}>
                  <Card className="rounded-[2.5rem] border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50">
                    <div className="mb-8 text-center sm:text-left">
                      <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center sm:justify-start gap-3">
                        <AlertCircle className="h-6 w-6 text-slate-400" />
                        {activeTab === 'hindi' ? 'डेटा चार्ट कैसे पढ़ें' : 'Understanding the Data Cards'}
                      </h2>
                      <p className="text-slate-500 font-bold mt-1">
                         {activeTab === 'hindi' ? 'वेटेज (%) और ट्रेंड (+/-) के बीच का सही अंतर।' : 'The difference between Weightage (%) and Trend Delta (+/-).'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Weightage Block */}
                      <div className="space-y-4 p-6 rounded-[2rem] bg-blue-50 border border-blue-100">
                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                           <Target className="h-4 w-4" />
                           Overall Weightage (%)
                        </h3>
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">
                             {activeTab === 'hindi' 
                               ? 'पूरे समय (2020-2026) का औसत हिस्सा।' 
                               : 'Average share since 2020.'}
                          </p>
                          <div className="bg-white/80 p-4 rounded-xl text-xs font-bold border border-blue-100">
                             <div className="flex flex-col gap-1">
                               <p className="text-blue-600">Overall Weight Logic:</p>
                               <p className="text-slate-700 font-black">20% Overall Weight = Out of 100 total questions (2020-26), 20 came from here.</p>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Trend Block */}
                      <div className="space-y-4 p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                        <h3 className="text-sm font-black text-emerald-900 uppercase tracking-widest flex items-center gap-2">
                           <TrendingUp className="h-4 w-4" />
                           Trend Delta (+X more)
                        </h3>
                        <div className="space-y-3">
                          <p className="text-sm font-bold text-slate-700 leading-relaxed">
                             {activeTab === 'hindi' 
                               ? 'सिर्फ पिछले साल की तुलना में बदलाव।' 
                               : 'Only shows change compared to the previous year.'}
                          </p>
                          <div className="bg-white/80 p-4 rounded-xl text-xs font-bold border border-emerald-100">
                             <div className="flex flex-col gap-1">
                               <p className="text-emerald-600 font-black">Calculation Logic:</p>
                               <p className="text-slate-700 font-black italic">Trend = (Questions this year) - (Questions last year)</p>
                               <div className="mt-1 flex gap-2 items-center text-slate-500">
                                  <span>History 24: 5 qs → History 25: 25 qs → </span>
                                  <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-lg font-black transition-all">+20 more</span>
                               </div>
                               <p className="text-[10px] text-slate-400 mt-1 italic leading-tight">
                                  {activeTab === 'hindi' ? '*इसका मतलब है कि इस टॉपिक से पिछले साल की तुलना में 20 नए एक्स्ट्रा सवाल पूछे गए।' : '*This means 20 extra questions were asked compared to last year.'}
                               </p>
                               <div className="mt-3 flex items-center gap-2 border-t border-emerald-100 pt-2 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                  <ShieldCheck className="h-3.5 w-3.5" />
                                  {activeTab === 'hindi' ? 'डैशबोर्ड पर "प्रमाण देखें" पर क्लिक करें' : 'Click "View Proof" on Dashboard'}
                               </div>
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Latest Weight Hint */}
                    <div className="mt-8 p-6 rounded-[2rem] bg-pink-50 border border-pink-100">
                       <h3 className="text-sm font-black text-pink-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                         <Sparkles className="h-4 w-4" />
                         Latest Share (%)
                       </h3>
                       <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                         {activeTab === 'hindi'
                           ? 'सिर्फ सबसे लेटेस्ट पेपर (जैसे 2025) में इस टॉपिक का % हिस्सा।'
                           : 'Shows the topic\'s share specifically in the **most recent paper** (e.g. 2025).'}
                       </p>
                    </div>
                  </Card>
                </motion.div>

                {/* 3. WINNING STRATEGY: DARK CARD */}
                <motion.div variants={itemVariants}>
                  <Card className="rounded-[2.5rem] border-slate-900 bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-64 w-64 bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl transition-opacity group-hover:opacity-10"></div>
                    <CardHeader className="px-0 pt-0 mb-10 text-center">
                      <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border border-white/5">
                        <Target className="h-3.5 w-3.5" />
                        Final Strategy
                      </div>
                      <CardTitle className="text-3xl font-black">
                        {activeTab === 'hindi' ? 'जीतने की रणनीति (ABC Analysis)' : 'Winning Strategy (ABC Analysis)'}
                      </CardTitle>
                    </CardHeader>
                    
                    <div className="grid gap-6 sm:grid-cols-3 relative z-10">
                      {[
                        {
                          lvl: 'A',
                          title: activeTab === 'hindi' ? 'Critical Core' : 'Critical Core',
                          sub: 'High Weight + High Trend',
                          icon: <Zap className="h-6 w-6 text-rose-400" />,
                          desc: activeTab === 'hindi' ? 'सबसे महत्वपूर्ण! इन्हें रट लें।' : 'Top priority. Master these first.'
                        },
                        {
                          lvl: 'B',
                          title: activeTab === 'hindi' ? 'Steady Pillars' : 'Steady Pillars',
                          sub: 'High Weight + Stable',
                          icon: <CheckCircle2 className="h-6 w-6 text-emerald-400" />,
                          desc: activeTab === 'hindi' ? 'सिलेबस का आधार। इन्हें मिस न करें।' : 'Foundation topics. Don\'t miss them.'
                        },
                        {
                          lvl: 'C',
                          title: activeTab === 'hindi' ? 'The Surprises' : 'The Surprises',
                          sub: 'Low Weight + Rising',
                          icon: <Search className="h-6 w-6 text-amber-400" />,
                          desc: activeTab === 'hindi' ? 'सावधान रहें, ये बढ़ रहे हैं।' : 'Watch out! These are emerging trends.'
                        }
                      ].map((item, i) => (
                        <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition cursor-default">
                           <div className="flex justify-between mb-4">
                              <span className="text-4xl font-black text-white/10">0{i+1}</span>
                              {item.icon}
                           </div>
                           <h4 className="text-lg font-black mb-1">{item.title}</h4>
                           <p className="text-xs font-black text-white/40 uppercase tracking-tight mb-2">{item.sub}</p>
                           <p className="text-sm font-bold text-slate-400">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center pt-8">
                  <Button
                    size="lg"
                    onClick={() => router.push('/syllabus/quiz/pyq/analysis')}
                    className="rounded-full bg-slate-900 hover:bg-black px-12 py-8 text-xl font-black text-white shadow-2xl transition-all hover:scale-105 active:scale-95 group"
                  >
                    Go Back to Analysis
                    <ChevronRight className="ml-2 h-6 w-6 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.div>
              </motion.div>
            </TabsContent>
            <TabsContent value="technical" className="mt-0">
               <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white border border-white/10 shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 h-64 w-64 bg-amber-500 opacity-5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                     <h3 className="text-2xl font-black mb-8 flex items-center gap-3">
                        <Sparkles className="h-6 w-6 text-amber-400" />
                        Admin Guide: Techie Tapori (Mumbai Style) 🛠️
                     </h3>
                     
                     <div className="grid gap-6">
                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/[0.07] transition-colors">
                           <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/20">
                                 <Search className="h-5 w-5 text-amber-500" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-xl font-black text-amber-400 uppercase tracking-tight">1. Asli Mal (Source of Truth)</p>
                                 <p className="text-slate-400 font-medium leading-relaxed">
                                    Bhai, sara khel <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">questions</code> table ka hai. Ye table hi asli godown hai jisme saare sawal (PYQs) bhare pade hain. Baki jo bhi analysis dikhta hai, uska root yehi table hai boss.
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/[0.07] transition-colors">
                           <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/20">
                                 <Target className="h-5 w-5 text-blue-500" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-xl font-black text-blue-400 uppercase tracking-tight">2. Rishtedaari (Relations)</p>
                                 <p className="text-slate-400 font-medium leading-relaxed">
                                    Sawal (Question) ko Topic se set karne ke liye <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">pyq_question_topics</code> table lagti hai. Idhar Question ID aur Topic ID ka joda banate hain. Aur Paper (Test) ka saal janne ke liye <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">tests</code> table se alignment lete hain. Full automatic scene hai!
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/[0.07] transition-colors">
                           <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/20">
                                 <TrendingUp className="h-5 w-5 text-emerald-500" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-xl font-black text-emerald-400 uppercase tracking-tight">3. Trend ka Hisaab (Delta Logic)</p>
                                 <p className="text-slate-400 font-medium leading-relaxed">
                                    Formula ekdum simple: <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">Trend = Naya Saal - Pichla Saal</code>. Agar History mein is saal 25 questions aaye aur pichle saal 5, to answer +20 aaya. Iska matlab Commission full History mode mein hai, aur yehi data dashboard par "Rising Topic" bankar chamakta hai. Trend DB table <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">pyq_topic_trends</code> mein save hota hai.
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="bg-white/5 p-8 rounded-3xl border border-white/5 hover:bg-white/[0.07] transition-colors">
                           <div className="flex items-start gap-4">
                              <div className="h-10 w-10 rounded-xl bg-pink-500/20 flex items-center justify-center shrink-0 border border-pink-500/20">
                                 <ShieldCheck className="h-5 w-5 text-pink-500" />
                              </div>
                              <div className="space-y-2">
                                 <p className="text-xl font-black text-pink-400 uppercase tracking-tight">4. Matrix ki Loyalty (Deduplication)</p>
                                 <p className="text-slate-400 font-medium leading-relaxed">
                                    Matrix mein do-numbari nahi chalti. Agar ek sawal 3 topics (ex: MP GK, History, Unit 10) mein mapped hai, to Matrix use physical ID se <code className="text-white bg-white/10 px-1.5 py-0.5 rounded">COUNT(DISTINCT questionId)</code> karke sirf 1 hi ginta hai. Paper ek, count ek. Accuracy 100% honi mangti hai bhai!
                                 </p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 text-center">
                     <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 mb-4">
                        <Zap className="h-6 w-6 text-slate-400" />
                     </div>
                     <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Conclusion</p>
                     <h4 className="text-xl font-black text-slate-800 mt-2 italic">"Data sahi to strategy sahi, strategy sahi to selection pakka!"</h4>
                  </div>
               </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
