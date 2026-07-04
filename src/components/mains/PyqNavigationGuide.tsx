'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Sparkles, Filter, Layers, MousePointer2, ListTree, HelpCircle, LayoutGrid, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';

const STEPS = [
  {
    id: 'paper',
    icon: Target,
    colorClass: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    title: { en: 'Year & Paper Filter', hi: 'वर्ष और पेपर फ़िल्टर' },
    desc: { 
      en: 'Click the target icon (top right) to switch between different exam years and papers seamlessly.', 
      hi: 'विभिन्न वर्षों और पेपर्स के बीच स्विच करने के लिए टारगेट आइकन (ऊपर दाएँ) पर क्लिक करें।' 
    }
  },
  {
    id: 'parts',
    icon: Layers,
    colorClass: 'text-pink-500 bg-pink-500/10 border-pink-500/20',
    title: { en: 'Parts Filter', hi: 'खंड फ़िल्टर (Part A/B)' },
    desc: { 
      en: 'Filter questions by Part A or Part B of the syllabus.', 
      hi: 'प्रश्नों को Part A या Part B के अनुसार छाँटें।' 
    }
  },
  {
    id: 'topics',
    icon: ListTree,
    colorClass: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    title: { en: 'Topic Filter', hi: 'विषय फ़िल्टर (Topics)' },
    desc: { 
      en: 'Click the circular flag icon next to parts to drill down into specific syllabus topics.', 
      hi: 'विशिष्ट विषयों को चुनने के लिए पार्ट्स के बगल वाले गोल (फ़्लैग) आइकन पर क्लिक करें।' 
    }
  },
  {
    id: 'marks',
    icon: Filter,
    colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
    title: { en: 'Marks Filter', hi: 'मार्क्स फ़िल्टर' },
    desc: { 
      en: 'Focus your practice strictly on 2m, 7m, or 10m marker questions with a single tap.', 
      hi: 'एक टैप से केवल 2m, 7m, या 10m मार्कर प्रश्नों पर अपना फोकस सेट करें।' 
    }
  },
  {
    id: 'units',
    icon: LayoutGrid,
    colorClass: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    title: { en: 'Units Filter', hi: 'इकाई फ़िल्टर (Units)' },
    desc: { 
      en: 'Click the grid icon next to topics to quickly filter questions by specific syllabus units.', 
      hi: 'प्रश्नों को विशिष्ट इकाइयों (Units) के अनुसार जल्दी से छाँटने के लिए टॉपिक्स के बगल वाले ग्रिड आइकन पर क्लिक करें।' 
    }
  },
  {
    id: 'focus',
    icon: Sparkles,
    colorClass: 'text-sky-500 bg-sky-500/10 border-sky-500/20',
    title: { en: 'Focus Mode', hi: 'फोकस मोड (इमर्सिव)' },
    desc: { 
      en: 'Click the sparkles icon to hide all filters for a distraction-free, immersive reading experience.', 
      hi: 'सभी फ़िल्टर्स को छिपाने और बिना किसी रुकावट के पढ़ने के लिए स्पार्कल्स आइकन पर क्लिक करें।' 
    }
  }
];

export function PyqNavigationGuide({ themeDeep, triggerType = 'banner' }: { themeDeep: boolean, triggerType?: 'banner' | 'icon' }) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const [activeStep, setActiveStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-cycle through steps when open, unless user interacts
  useEffect(() => {
    if (!open || hasInteracted) return;
    const interval = setInterval(() => {
      setActiveStep((s) => (s + 1) % STEPS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [open, hasInteracted]);
  
  // Reset interaction state when modal closes
  useEffect(() => {
    if (!open) {
      setHasInteracted(false);
      setActiveStep(0);
    }
  }, [open]);

  return (
    <div className={cn("w-full", triggerType === 'banner' ? "flex justify-center mb-6" : "")}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {triggerType === 'banner' ? (
            <button
              className={cn(
                "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border px-5 py-2.5 text-[12px] font-bold tracking-wide transition-all hover:scale-[1.02] active:scale-95 shadow-sm w-full sm:w-auto",
                themeDeep 
                  ? "border-sky-500/30 bg-sky-900/30 text-sky-300 hover:bg-sky-800/40" 
                  : "border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
              )}
            >
              <Sparkles className="h-4 w-4 text-sky-500 animate-pulse" />
              {hi ? 'गाइड: स्मार्ट फ़िल्टर्स कैसे उपयोग करें?' : 'Guide: How to use Smart Filters?'}
              <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                <div className="relative h-full w-8 bg-white/20" />
              </div>
            </button>
          ) : (
            <button
              className={cn(
                "relative flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-105 active:scale-95 ml-1 group",
              )}
              title={hi ? "स्मार्ट नेविगेशन गाइड" : "Smart Navigation Guide"}
            >
              {/* Colorful animated border */}
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(#ef4444,#ec4899,#22c55e,#eab308,#ef4444)] animate-[spin_4s_linear_infinite]" />
              {/* Inner background */}
              <div className={cn(
                "absolute inset-[2px] rounded-full flex items-center justify-center transition-colors",
                themeDeep ? "bg-slate-900 group-hover:bg-slate-800" : "bg-white group-hover:bg-slate-50"
              )}>
                <HelpCircle className={cn(
                  "h-5 w-5",
                  themeDeep ? "text-sky-400" : "text-sky-600"
                )} />
              </div>
            </button>
          )}
        </DialogTrigger>

        <DialogContent 
          showCloseButton={false}
          className={cn(
          "max-w-2xl md:w-[95vw] p-0 overflow-hidden border-0 gap-0",
          themeDeep ? "bg-slate-950 text-slate-200" : "bg-white text-slate-900"
        )}>
          <div className="flex flex-col h-[85vh] md:h-[650px] max-h-[800px] relative">
            
            {/* Custom Close Button */}
            <DialogClose className={cn(
              "absolute top-3 right-3 sm:top-4 sm:right-4 z-50 p-2 rounded-full transition-all active:scale-95 shadow-sm border",
              themeDeep ? "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white" : "bg-white/80 border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}>
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Close</span>
            </DialogClose>

            {/* Top: Horizontal Steps & Description */}
            <div className={cn(
              "w-full p-6 pb-4 flex flex-col items-center shrink-0 z-10 shadow-sm",
              themeDeep ? "bg-slate-900" : "bg-slate-50"
            )}>
              <DialogTitle className="text-xl md:text-2xl font-black tracking-tight mb-2 text-center">
                {hi ? 'नेविगेशन कैसे उपयोग करें? 🚀' : 'How to use navigation 🚀'}
              </DialogTitle>
              <DialogDescription className="sr-only">Guide on how to use filters</DialogDescription>
              
              {/* Horizontal Icons */}
              <div className="flex items-center justify-center gap-2 sm:gap-4 w-full mt-4 mb-4 overflow-x-auto no-scrollbar">
                {STEPS.map((step, idx) => {
                  const isActive = activeStep === idx;
                  const Icon = step.icon;
                  return (
                    <button
                      key={step.id}
                      onClick={() => {
                        setActiveStep(idx);
                        setHasInteracted(true);
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 transition-all group shrink-0",
                        isActive ? "scale-110" : "opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className={cn(
                        "p-2.5 sm:p-3 rounded-full flex items-center justify-center transition-all",
                        isActive 
                          ? cn("shadow-md", step.colorClass) 
                          : themeDeep ? "bg-slate-800" : "bg-white border shadow-sm"
                      )}>
                        <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", isActive ? "" : "text-slate-500")} />
                      </div>
                      <span className={cn(
                        "text-[9px] sm:text-[10px] font-bold uppercase tracking-wider",
                        isActive ? (themeDeep ? "text-slate-200" : "text-slate-800") : "text-slate-500 hidden sm:block group-hover:block"
                      )}>
                        {step.id}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Active Description */}
              <div className="h-16 flex flex-col items-center justify-center text-center max-w-lg">
                <h4 className={cn("font-bold text-[15px] mb-1", themeDeep ? "text-slate-200" : "text-slate-800")}>
                  {hi ? STEPS[activeStep].title.hi : STEPS[activeStep].title.en}
                </h4>
                <p className={cn("text-[12px] leading-relaxed font-medium", themeDeep ? "text-slate-400" : "text-slate-600")}>
                  {hi ? STEPS[activeStep].desc.hi : STEPS[activeStep].desc.en}
                </p>
              </div>
            </div>

            {/* Bottom/Center: Dynamic Interactive Mockup */}
            <div className={cn(
              "w-full flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden",
              themeDeep ? "bg-slate-950" : "bg-slate-100"
            )}>
              <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/50 [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)] -z-10" />
              
              {/* Dynamic App Mockup */}
              <motion.div 
                layout
                className={cn(
                  "w-full max-w-[320px] rounded-2xl p-5 border shadow-2xl relative z-10",
                  themeDeep ? "bg-slate-900 border-slate-700 shadow-sky-900/20" : "bg-white border-slate-200 shadow-slate-200/50"
                )}
              >
                {/* Header (Sparkles & Target) */}
                <div className="flex justify-between items-center mb-4 z-20 relative">
                  <div className={cn("h-4 w-16 rounded", themeDeep ? "bg-slate-700" : "bg-slate-200")} />
                  <div className="flex gap-2 relative">
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                      activeStep === 3 ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] scale-110" : themeDeep ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                    )}>
                      <Sparkles className="h-3 w-3" />
                    </div>
                    
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center transition-all",
                      activeStep === 0 ? "bg-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110" : themeDeep ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400"
                    )}>
                      <Target className="h-3 w-3" />
                    </div>

                    {/* Paper Dropdown Mockup (Step 0) */}
                    <AnimatePresence>
                      {activeStep === 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          className={cn(
                            "absolute top-8 right-0 w-32 rounded-lg p-1.5 border shadow-lg z-30",
                            themeDeep ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"
                          )}
                        >
                          <div className={cn("text-[7px] font-bold px-1.5 py-1 rounded mb-1 flex items-center gap-1", themeDeep ? "bg-slate-700 text-amber-300" : "bg-amber-100 text-amber-700")}>
                            <Target className="h-2 w-2" /> 2024 | Paper 1
                          </div>
                          <div className={cn("text-[7px] font-medium px-1.5 py-1 rounded mb-1", themeDeep ? "text-slate-400" : "text-slate-500")}>2023 | Paper 1</div>
                          <div className={cn("text-[7px] font-medium px-1.5 py-1 rounded", themeDeep ? "text-slate-400" : "text-slate-500")}>2022 | Paper 1</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Filters Area (Collapses on Step 5) */}
                <motion.div
                  animate={{ height: activeStep === 5 ? 0 : 'auto', opacity: activeStep === 5 ? 0 : 1 }}
                  className="overflow-hidden mb-4"
                >
                  <div className="space-y-3 pb-1">
                    {/* Parts & Topic & Units (Steps 1, 2 & 4) */}
                    <div className={cn(
                      "p-2 rounded-xl border-2 transition-all flex flex-col gap-2",
                      (activeStep === 1 || activeStep === 2 || activeStep === 4) ? (
                        activeStep === 1 ? "border-pink-400 bg-pink-500/10" : 
                        activeStep === 2 ? "border-emerald-400 bg-emerald-500/10" : 
                        "border-indigo-400 bg-indigo-500/10"
                      ) : "border-transparent"
                    )}>
                      <div className="flex gap-1 items-center">
                        <div className={cn("h-4 px-2 rounded-full flex items-center justify-center text-[6px] font-black uppercase tracking-wider", activeStep === 1 ? "bg-pink-500 text-white" : themeDeep ? "bg-slate-700 text-slate-400" : "bg-slate-200 text-slate-500")}>PART A</div>
                        <div className={cn("h-4 px-2 rounded-full flex items-center justify-center text-[6px] font-black uppercase tracking-wider", themeDeep ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>PART B</div>
                        {/* Circular Flag Icon Mockup */}
                        <div className={cn("h-4 w-4 rounded-full overflow-hidden flex flex-col ml-1 border transition-all shrink-0", activeStep === 2 ? "border-emerald-400 scale-110 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "border-slate-300 dark:border-slate-600")}>
                           <div className="w-full h-1/3 bg-orange-400"></div>
                           <div className="w-full h-1/3 bg-white flex items-center justify-center">
                             <div className="h-1 w-1 rounded-full border-[0.5px] border-blue-800"></div>
                           </div>
                           <div className="w-full h-1/3 bg-green-500"></div>
                        </div>
                        {/* LayoutGrid Icon Mockup (Units) */}
                        <div className={cn("h-4 w-4 rounded-full flex items-center justify-center transition-all shrink-0 border border-transparent", 
                            activeStep === 4 ? "bg-indigo-100 text-indigo-500 scale-110 shadow-[0_0_10px_rgba(99,102,241,0.5)] border-indigo-400" : "bg-slate-100 text-slate-400 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        )}>
                            <LayoutGrid className="h-2 w-2" />
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {activeStep === 2 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className={cn("h-6 w-full rounded flex items-center px-2", themeDeep ? "bg-slate-800" : "bg-slate-100")}
                          >
                            <div className={cn("text-[7px] font-bold text-emerald-500")}>
                              All Topics (Syllabus topic-wise)
                            </div>
                          </motion.div>
                        )}
                        {activeStep === 4 && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            exit={{ opacity: 0, height: 0 }}
                            className={cn("h-6 w-full rounded flex items-center px-2", themeDeep ? "bg-slate-800" : "bg-slate-100")}
                          >
                            <div className={cn("text-[7px] font-bold text-indigo-500")}>
                              Part A : Unit 1
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Marks (Step 3) */}
                    <div className={cn(
                      "p-2 rounded-xl border-2 transition-all flex gap-1",
                      activeStep === 3 ? "border-orange-400 bg-orange-500/10" : "border-transparent"
                    )}>
                       <div className={cn("h-5 px-2 rounded-full flex items-center justify-center text-[7px] font-black", activeStep === 3 ? "bg-orange-500 text-white" : themeDeep ? "bg-slate-800 text-slate-400" : "bg-slate-200 text-slate-500")}>ALL</div>
                       <div className={cn("h-5 px-1.5 rounded-full flex items-center justify-center text-[7px] font-bold", themeDeep ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>2m</div>
                       <div className={cn("h-5 px-1.5 rounded-full flex items-center justify-center text-[7px] font-bold", themeDeep ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>7m</div>
                       <div className={cn("h-5 px-1.5 rounded-full flex items-center justify-center text-[7px] font-bold", themeDeep ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400")}>10m</div>
                    </div>
                  </div>
                </motion.div>

                {/* Real-looking Question Content Mockup */}
                <motion.div layout className={cn(
                  "p-3 rounded-xl border shadow-sm",
                  themeDeep ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"
                )}>
                  <div className="flex gap-1.5 items-center mb-1.5">
                    <span className={cn("px-1.5 py-0.5 rounded text-[6px] font-black", themeDeep ? "bg-emerald-900/50 text-emerald-300" : "bg-emerald-100 text-emerald-700")}>7m</span>
                    <span className={cn("text-[6px] font-black uppercase tracking-wider opacity-60", themeDeep ? "text-slate-400" : "text-slate-600")}>PART A · U1 · Q2</span>
                  </div>
                  <p className={cn("text-[9px] font-bold leading-relaxed mb-3", themeDeep ? "text-slate-200" : "text-slate-800")}>
                    {hi ? "सिंधु घाटी सभ्यता की प्रमुख विशेषताओं का वर्णन करें।" : "Describe the main features of the Indus Valley Civilization."}
                  </p>
                  
                  {/* Mock Answer Button */}
                  <div className={cn("h-5 rounded-full w-[120px] border flex items-center gap-1.5 px-2", themeDeep ? "border-amber-500/20 bg-amber-500/10" : "border-amber-300/50 bg-amber-50")}>
                    <Layers className={cn("h-2.5 w-2.5", themeDeep ? "text-amber-400" : "text-amber-600")} />
                    <span className={cn("text-[6px] font-bold uppercase", themeDeep ? "text-amber-400" : "text-amber-600")}>{hi ? 'आदर्श उत्तर देखें' : 'View Model Answer'}</span>
                  </div>
                </motion.div>

                {/* Animated Simulated Cursor Overlay */}
                <motion.div
                  className="absolute z-50 text-slate-800 dark:text-white drop-shadow-lg"
                  animate={
                    activeStep === 0 ? { top: 12, right: 12 } :
                    activeStep === 1 ? { top: 85, right: 120 } :
                    activeStep === 2 ? { top: 85, right: 80 } :
                    activeStep === 3 ? { top: 130, right: 150 } : // Marks
                    activeStep === 4 ? { top: 85, right: 60 } : // Units
                    { top: 12, right: 45 } // Focus
                  }
                  transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                  <MousePointer2 className="h-6 w-6 -rotate-12 fill-white dark:fill-slate-800 text-slate-800 dark:text-slate-200" />
                  <motion.div 
                    className={cn(
                      "absolute -top-2 -left-2 h-8 w-8 rounded-full border-4 opacity-0 scale-50",
                      activeStep === 0 ? "border-amber-400" :
                      activeStep === 1 ? "border-pink-400" :
                      activeStep === 2 ? "border-emerald-400" : 
                      activeStep === 3 ? "border-orange-400" : 
                      activeStep === 4 ? "border-indigo-400" : 
                      "border-sky-400"
                    )}
                    animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.2, 1.5] }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 1 }}
                  />
                </motion.div>
              </motion.div>

            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
