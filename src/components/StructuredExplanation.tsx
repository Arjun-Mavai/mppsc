import React, { useState } from 'react';
import {
  GraduationCap,
  AlertOctagon,
  Target,
  BookOpen,
  Layers,
  Zap,
  AlignLeft,
  Globe,
  Brain,
  Link,
  Sparkles,
  Trophy,
  GitBranch,
} from 'lucide-react';
import { parseExtendedData } from '@/lib/explanation-parser';
import { PremiumExplanation } from '@/features/tests/components/PremiumExplanation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface StructuredExplanationProps {
  extendedData?: unknown;
  plainExplanation?: string;
  explanationEn?: string | null;
  explanationHi?: string | null;
  language?: 'hi' | 'en';
  /** When true, adapts classic explanation colors for dark surfaces */
  darkMode?: boolean;
}

export function StructuredExplanation({ 
  extendedData, 
  plainExplanation,
  explanationEn,
  explanationHi,
  language = 'hi',
  darkMode = false,
}: StructuredExplanationProps) {
  const [showExpert, setShowExpert] = useState(false);
  const [contentLang, setContentLang] = useState<'hi' | 'en'>(language);
  
  const explanation = parseExtendedData(extendedData);

  // If no properly structured expert data is present, just show the classic view
  const hasExpertData = explanation && (explanation.stream === 'mppsc_expert' || explanation.stream === 'csat_logic');

  const renderClassic = () => (
    plainExplanation || explanationEn || explanationHi ? (
      <div
        className={cn(
          'mt-4 border-t pt-4 animate-in fade-in duration-300',
          darkMode ? 'border-white/10' : 'border-slate-200',
        )}
      >
        <PremiumExplanation 
            explanation={plainExplanation || ''} 
            explanationEn={explanationEn} 
            explanationHi={explanationHi} 
            language={contentLang}
            compact={true}
            darkMode={darkMode}
        />
      </div>
    ) : null
  );

  if (!hasExpertData || !showExpert) {
    if (!hasExpertData) return renderClassic();
    
    // If we HAVE expert data but user toggled to Classic, show switch to go back
    return (
      <div className="space-y-4">
        <div className="flex justify-end pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowExpert(true)}
              className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100"
            >
              <Zap className="mr-1 h-3 w-3 fill-indigo-600" /> Switch to Expert Analysis
            </Button>
        </div>
        {renderClassic()}
      </div>
    );
  }

  // --- MPPSC GS EXPERT RENDERER ---
  if (explanation.stream === 'mppsc_expert' && showExpert) {
    // Helper to get bilingual field
    const getField = (base: string) => {
        const hi = explanation[`${base}_hi`] || explanation[base];
        const en = explanation[`${base}_en`] || explanation[base];
        return contentLang === 'hi' ? hi : en;
    };

    const facts = contentLang === 'hi' 
        ? (explanation.high_yield_facts_hi || explanation.high_yield_facts || [])
        : (explanation.high_yield_facts_en || explanation.high_yield_facts || []);

    return (
      <div className="mt-6 overflow-hidden rounded-2xl border border-indigo-200/70 bg-gradient-to-b from-indigo-50/90 to-white shadow-xl shadow-indigo-100/20 animate-in zoom-in-95 duration-500">
        {/* Toggle Header - Minimalist */}
        <div className="flex items-center justify-between border-b border-indigo-100 bg-white/80 px-4 py-1.5 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-7 items-center gap-1 rounded-full bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setShowExpert(true)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase transition-all ${showExpert ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <Zap className={`h-3 w-3 ${showExpert ? 'fill-white' : ''}`} /> Expert
                </button>
                <button
                  type="button"
                  onClick={() => setShowExpert(false)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[9px] font-black uppercase transition-all ${!showExpert ? 'bg-slate-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                >
                  <AlignLeft className="h-3 w-3" /> Classic
                </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex h-7 items-center gap-1 rounded-full bg-indigo-50 p-1 border border-indigo-100">
                <button
                  type="button"
                  onClick={() => setContentLang('hi')}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-black transition-all ${contentLang === 'hi' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-400 hover:text-indigo-600'}`}
                >
                  हिंदी
                </button>
                <button
                  type="button"
                  onClick={() => setContentLang('en')}
                  className={`rounded-full px-2.5 py-1 text-[9px] font-black transition-all ${contentLang === 'en' ? 'bg-white text-indigo-600 shadow-sm' : 'text-indigo-400 hover:text-indigo-600'}`}
                >
                  ENG
                </button>
            </div>
          </div>
        </div>

        <div className="border-b border-indigo-100 bg-indigo-500/5 px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2 font-bold uppercase tracking-widest text-indigo-900 text-[10px]">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            {contentLang === 'hi' ? 'सिविल सेवा विशेषज्ञ विश्लेषण' : 'Civil Services Expert Analysis'}
          </div>
          {explanation.topic_micro_mapping && (
             <div className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[9px] font-black tracking-tight text-indigo-600 border border-indigo-100 shadow-sm max-w-[200px] truncate">
                <Target className="h-3 w-3" /> {explanation.topic_micro_mapping}
             </div>
          )}
        </div>
        
        <div className="p-5 space-y-6">
          {/* Conceptual Core */}
          {getField('conceptual_depth') && (
            <div className="animate-in slide-in-from-left-2 duration-500">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-800 mb-2.5">
                <BookOpen className="h-4 w-4 text-indigo-500" /> 
                {contentLang === 'hi' ? '✅ कॉन्सेप्चुअल कोर (Conceptual Core)' : '✅ Conceptual Core'}
              </h4>
              <p className="text-sm leading-relaxed text-slate-800 font-medium">
                {getField('conceptual_depth')}
              </p>
            </div>
          )}

          {/* Inter-disciplinary Link */}
          {getField('interdisciplinary_link') && (
            <div className="relative overflow-hidden rounded-2xl bg-indigo-50/30 border border-indigo-100/50 p-4 animate-in slide-in-from-right-2 duration-500">
               <div className="absolute -right-4 -top-4 opacity-5">
                  <GitBranch className="h-20 w-20 text-indigo-900" />
               </div>
               <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-900 mb-2">
                 <Link className="h-3.5 w-3.5 text-indigo-600" /> 
                 {contentLang === 'hi' ? '🔄 इंटर-डिसिप्लिनरी लिंक' : '🔄 Inter-disciplinary Link'}
               </h4>
               <p className="text-[13px] leading-relaxed text-indigo-900/80 font-bold italic">
                 {getField('interdisciplinary_link')}
               </p>
            </div>
          )}

          {/* Elimination Logic & Trend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getField('elimination_strategy') && (
              <div className="rounded-2xl bg-amber-50/50 border border-amber-100 p-4 transition-all hover:bg-amber-50">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-900 mb-2">
                  <AlertOctagon className="h-3.5 w-3.5 text-amber-600" /> 
                  {contentLang === 'hi' ? '⚡ एलिमिनेशन रणनीति (Elimination)' : '⚡ Elimination Strategy'}
                </h4>
                <p className="text-[13px] leading-relaxed text-slate-700">
                    {getField('elimination_strategy')}
                </p>
              </div>
            )}
            
            {getField('historical_trend') && (
              <div className="rounded-2xl bg-rose-50/50 border border-rose-100 p-4 transition-all hover:bg-rose-50">
                <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-900 mb-2">
                  <Target className="h-3.5 w-3.5 text-rose-600" /> 
                  {contentLang === 'hi' ? '🧠 वेटरन्स विजडम (Veteran\'s Wisdom)' : '🧠 Veteran\'s Wisdom'}
                </h4>
                <p className="text-[13px] leading-relaxed text-slate-700">
                    {getField('historical_trend')}
                </p>
              </div>
            )}
          </div>

          {/* Memory Mnemonics */}
          {getField('memory_mnemonic') && (
            <div className="group relative overflow-hidden rounded-2xl bg-emerald-50/40 border border-emerald-100 p-5 shadow-sm hover:shadow-md transition-all">
                <div className="absolute right-4 top-4 opacity-10 group-hover:scale-110 transition-transform">
                   <Brain className="h-10 w-10 text-emerald-600" />
                </div>
                <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-900 mb-3">
                  <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" /> 
                  {contentLang === 'hi' ? '🧠 मेमोरी वॉल्ट (Memory Trick)' : '🧠 Memory Vault (Mnemonic)'}
                </h4>
                <div className="rounded-xl bg-white/60 p-3 border border-emerald-100/50">
                   <p className="text-[13px] font-black text-emerald-800 leading-relaxed italic">
                       {getField('memory_mnemonic')}
                   </p>
                </div>
            </div>
          )}

          {/* NCERT Reference */}
          {explanation.ncert_reference && (
             <div className="flex items-start gap-3 rounded-2xl bg-slate-50 border border-slate-200 p-4 border-l-4 border-l-slate-400">
                <div className="mt-0.5 rounded px-1.5 py-0.5 bg-slate-200 shrink-0">
                  <span className="text-[9px] font-black tracking-widest text-slate-600">SOURCE</span>
                </div>
                <p className="text-[13px] font-bold text-slate-700 italic">
                    {explanation.ncert_reference}
                </p>
             </div>
          )}

          {/* Facts */}
          {facts.length > 0 && (
            <div className="animate-in slide-in-from-bottom-2 duration-500 delay-150">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-emerald-800 mb-3">
                <Layers className="h-4 w-4 text-emerald-600" /> 
                {contentLang === 'hi' ? 'महत्वपूर्ण परीक्षा तथ्य' : 'High-Yield Facts'}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {facts.map((fact: string, i: number) => (
                  <div key={i} className="flex gap-2 text-[13px] text-slate-700 bg-white/50 p-2 rounded-lg border border-emerald-50">
                    <span className="text-emerald-500 font-black">▶</span> {fact}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Highlights */}
          <div className="flex flex-col gap-3 pt-4 border-t border-indigo-100/50">
             {getField('mains_application') && (
                <div className="text-[13px] text-slate-600 flex gap-2">
                  <span className="font-black text-slate-900 uppercase text-[9px] tracking-widest shrink-0 mt-1">Mains:</span> 
                  <span className="italic">{getField('mains_application')}</span>
                </div>
             )}
             {(getField('toppers_mantra') || explanation.toppers_secret) && (
                <div className="group relative overflow-hidden text-[13px] text-sky-800 bg-gradient-to-r from-sky-50 to-indigo-50/30 px-5 py-4 rounded-2xl border border-sky-200 shadow-lg shadow-sky-100/20">
                  <div className="absolute -right-2 -top-2 p-1 opacity-20 group-hover:rotate-12 transition-transform">
                      <Trophy className="h-12 w-12 text-sky-900" />
                  </div>
                  <span className="flex items-center gap-2 font-black mb-1.5 text-sky-900 uppercase text-[10px] tracking-widest">
                    <Sparkles className="h-3 w-3 text-sky-600" />
                    {contentLang === 'hi' ? '🏆 टॉपर्स मंत्र (Topper\'s Mantra):' : "🏆 Topper's Mantra:"}
                  </span> 
                  <span className="font-black text-[15px] leading-tight text-sky-900 block">
                    {getField('toppers_mantra') || getField('toppers_secret')}
                  </span>
                </div>
             )}
          </div>
        </div>
      </div>
    );
  }

  // --- CSAT RENDERER ---
  if (explanation.stream === 'csat_logic' && showExpert) {
     return (
       <div className="mt-6 p-1 rounded-2xl bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 shadow-xl shadow-purple-200/50">
          <div className="bg-white rounded-[14px] p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                <strong className="text-slate-900 text-xs flex items-center gap-2 uppercase tracking-widest font-black">
                    <Globe className="w-4 h-4 text-violet-600" /> 
                    {contentLang === 'hi' ? 'CSAT लॉजिक मैप' : 'CSAT Logic Map'}
                </strong>
                <div className="flex gap-1 bg-slate-100 p-0.5 rounded-md h-7">
                    <button type="button" onClick={() => setShowExpert(false)} className="px-2 text-[9px] font-bold text-slate-400 hover:text-slate-600">CLASSIC</button>
                    <button type="button" onClick={() => setContentLang(contentLang === 'hi' ? 'en' : 'hi')} className="px-2 bg-white rounded shadow-sm text-[9px] font-black text-violet-600">
                        {contentLang === 'hi' ? 'हिंदी' : 'ENG'}
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {explanation.steps && (
                    <div className="space-y-2">
                        {explanation.steps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white uppercase tabular-nums">{i+1}</span>
                                <span className="font-medium">{step}</span>
                            </div>
                        ))}
                    </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {explanation.shortcut && (
                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 text-[12px] font-medium text-emerald-900">
                           <span className="font-black text-emerald-600 mr-2 block text-[9px] uppercase tracking-widest mb-1">⚡ Shortcut</span>
                           {explanation.shortcut}
                        </div>
                    )}
                    {explanation.trap && (
                        <div className="bg-rose-50 p-3 rounded-xl border border-rose-100 text-[12px] font-medium text-rose-900">
                           <span className="font-black text-rose-600 mr-2 block text-[9px] uppercase tracking-widest mb-1">🚫 Trap Alert</span>
                           {explanation.trap}
                        </div>
                    )}
                </div>
            </div>
          </div>
       </div>
     )
  }

  return renderClassic();
}

