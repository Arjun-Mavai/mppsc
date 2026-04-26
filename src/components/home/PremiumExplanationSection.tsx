'use client';

/**
 * PremiumExplanationSection — "More Than Just Answers" wala section bhai!
 * Ab yeh pure CSS animations ke saath auto-switch hota hai!
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle, Sparkles, Zap, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';

export function PremiumExplanationSection() {
  const { language } = useSettingsStore();
  const [mode, setMode] = useState<'classic' | 'expert'>('expert');

  return (
    <section className="overflow-hidden border-t border-slate-200 bg-slate-50 py-24">
      <style jsx>{`
        .card-content {
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-4 border-purple-200 bg-purple-50 px-4 py-1 text-xs font-black tracking-widest text-purple-700 uppercase"
          >
            {language === 'hi' ? 'विशेष फीचर' : 'Premium Feature'}
          </Badge>
          <h2 className="mb-4 text-4xl font-black tracking-tight text-slate-900 md:text-5xl">
            {language === 'hi' ? 'सिर्फ उत्तर नहीं।' : 'More Than Just Answers.'}{' '}
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              {language === 'hi' ? 'कॉन्सेप्ट पर पकड़ बनायें।' : 'Master The Concept.'}
            </span>
          </h2>
          <p className="text-lg font-medium text-slate-600">
            {language === 'hi'
              ? 'हमारी AI-संचालित व्याख्याएं आपको रटने के बजाय समझने में मदद करती हैं।'
              : "Our AI-powered explanations help you understand the 'why' behind every answer."}
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* The Card Visualization Area */}
          <div className="relative">
            {/* Mode Toggle Pill */}
            <div className="mb-6 flex items-center justify-start gap-4">
              <div className="relative flex overflow-hidden rounded-full border border-slate-200 bg-white p-1 shadow-sm">
                <button
                  onClick={() => setMode('classic')}
                  className={cn(
                    'relative z-10 px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-all duration-300',
                    mode === 'classic' ? 'text-slate-900' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {language === 'hi' ? 'क्लासिक' : 'Classic'}
                </button>
                <button
                  onClick={() => setMode('expert')}
                  className={cn(
                    'relative z-10 px-6 py-2 text-[10px] font-black tracking-widest uppercase transition-all duration-300',
                    mode === 'expert' ? 'text-purple-700' : 'text-slate-400 hover:text-slate-600'
                  )}
                >
                  {language === 'hi' ? 'एक्स्पर्ट' : 'Expert'}
                </button>

                <div
                  className="absolute inset-y-1 rounded-full border border-slate-200/50 bg-slate-100 transition-all duration-300"
                  style={{
                    left: mode === 'classic' ? '4px' : 'calc(50% + 2px)',
                    width: 'calc(50% - 6px)',
                  }}
                />
              </div>
            </div>

            <div className="card-container relative min-h-[520px]">
              <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-slate-700 to-purple-600 opacity-5 blur-2xl"></div>

              <Card
                className={cn(
                  'card-content relative z-10 overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl',
                  mode === 'expert' ? 'ring-2 ring-purple-500/10' : 'ring-1 ring-slate-200'
                )}
              >
                <div className="p-8">
                  {/* Card Header */}
                  <div className="mb-8 flex items-center justify-between border-b border-slate-50 pb-6">
                    <h3 className="flex flex-col gap-1">
                      <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                        Question #1024
                      </span>
                      <span className="text-xl font-bold tracking-tight text-slate-900">
                        मध्य प्रदेश की गंगा किस नदी को कहा जाता है?
                      </span>
                    </h3>
                    <Badge className="shrink-0 border-0 bg-slate-200/80 text-[10px] font-black text-slate-600 hover:bg-slate-200/80">
                      MP GEO
                    </Badge>
                  </div>

                  <div className="relative overflow-hidden">
                    {/* CLASSIC MODE SECTIONS */}
                    <div
                      className={cn(
                        'space-y-5 transition-all duration-500',
                        mode === 'classic'
                          ? 'translate-y-0 opacity-100'
                          : 'pointer-events-none absolute inset-0 translate-y-10 opacity-0'
                      )}
                    >
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                          <CheckCircle2 size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            ✅ Core Logic
                          </h4>
                          <p className="text-sm leading-relaxed text-slate-700">
                            Based on{' '}
                            <span className="font-bold text-slate-900">pollution levels</span> like
                            the Ganges, Betwa is called the Ganga of MP.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50">
                          <Lightbulb size={18} className="text-slate-400" />
                        </div>
                        <div>
                          <h4 className="mb-1 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            💡 Exam Fact
                          </h4>
                          <p className="text-sm leading-relaxed text-slate-700">
                            Origin:{' '}
                            <span className="font-bold text-slate-900">Kumra Gaon (Raisen)</span>.{' '}
                            <br />
                            Total Length: <span className="font-bold text-slate-900">480 km</span>.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* EXPERT MODE SECTIONS */}
                    <div
                      className={cn(
                        'space-y-4 transition-all duration-500',
                        mode === 'expert'
                          ? 'translate-y-0 opacity-100'
                          : 'pointer-events-none absolute inset-0 translate-y-10 opacity-0'
                      )}
                    >
                      {[
                        {
                          label: language === 'hi' ? 'तर्क एवं विश्लेषण' : 'Core Logic',
                          icon: <CheckCircle2 size={16} className="text-emerald-500" />,
                          color: 'emerald',
                          content:
                            language === 'hi'
                              ? 'प्रदूषण के आधार पर इसे म.प्र. की गंगा कहा जाता है।'
                              : 'Betwa is known as the Ganga of MP due to its pollution levels, similar to the Ganges.',
                        },
                        {
                          label: language === 'hi' ? 'एग्जाम फैक्ट' : 'Exam Fact',
                          icon: <Lightbulb size={16} className="text-amber-500" />,
                          color: 'amber',
                          content:
                            language === 'hi'
                              ? 'उद्गम: कुमरा गाँव (रायसेन), कुल लंबाई: 480 किमी।'
                              : 'Origin: Kumra Gaon (Raisen). It flows for 480km before joining Yamuna.',
                        },
                        {
                          label: language === 'hi' ? 'मेमोरी टिप' : 'Memory Tip',
                          icon: <Brain size={16} className="text-indigo-500" />,
                          color: 'indigo',
                          content:
                            language === 'hi'
                              ? 'बेतवा = बेटा (बेटा रायसेन का) → कुमरा गाँव।'
                              : 'Betwa = Beta (Son) of Raisen → Connects to Kumra Gaon origin.',
                        },
                        {
                          label: language === 'hi' ? 'स्कैम अलर्ट' : 'Scam Alert',
                          icon: <AlertTriangle size={16} className="text-rose-500" />,
                          color: 'rose',
                          content:
                            language === 'hi'
                              ? 'नर्मदा को पवित्रता के आधार पर एमपी की गंगा कहते हैं, बेतवा को प्रदूषण के आधार पर।'
                              : 'Confusion Check: Narmada is Ganga of MP based on SANCTITY, Betwa based on POLLUTION.',
                        },
                      ].map((ai) => (
                        <div
                          key={ai.label}
                          className={cn(
                            'group relative overflow-hidden rounded-2xl border p-4 transition-all duration-300',
                            ai.color === 'emerald' &&
                              'border-emerald-500/20 bg-emerald-500/[0.03] hover:bg-emerald-500/[0.05]',
                            ai.color === 'amber' &&
                              'border-amber-500/20 bg-amber-500/[0.03] hover:bg-amber-500/[0.05]',
                            ai.color === 'indigo' &&
                              'border-indigo-500/20 bg-indigo-500/[0.03] hover:bg-indigo-500/[0.05]',
                            ai.color === 'rose' &&
                              'border-rose-500/20 bg-rose-500/[0.03] hover:bg-rose-500/[0.05]'
                          )}
                        >
                          <div className="mb-2 flex items-center gap-2.5">
                            <div
                              className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-xl',
                                ai.color === 'emerald' && 'bg-emerald-500/10',
                                ai.color === 'amber' && 'bg-amber-500/10',
                                ai.color === 'indigo' && 'bg-indigo-500/10',
                                ai.color === 'rose' && 'bg-rose-500/10'
                              )}
                            >
                              {ai.icon}
                            </div>
                            <h4
                              className={cn(
                                'text-[10px] font-black tracking-[0.2em] uppercase',
                                ai.color === 'emerald' && 'text-emerald-500',
                                ai.color === 'amber' && 'text-amber-500',
                                ai.color === 'indigo' && 'text-indigo-500',
                                ai.color === 'rose' && 'text-rose-500'
                              )}
                            >
                              {ai.label}
                            </h4>
                          </div>
                          <p className="text-sm font-bold leading-relaxed tracking-tight text-slate-800">
                            {ai.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-10 lg:pt-10">
            <div className="group flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <Brain size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  {language === 'hi' ? 'स्मृति तकनीक (Mnemonics)' : 'Built-in Mnemonics'}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {language === 'hi'
                    ? 'कठिन तथ्यों को याद रखने के लिए विशेष ट्रिक्स और सूत्र।'
                    : 'Every explanation includes catchy mnemonics to help you retain dry facts forever.'}
                </p>
              </div>
            </div>
            <div className="group flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  {language === 'hi' ? 'ट्रैप अलर्ट' : 'Trap Alerts'}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {language === 'hi'
                    ? 'जानें कि परीक्षार्थी अक्सर कहाँ गलती करते हैं और उन "जाल" से कैसे बचें।'
                    : 'We highlight commonly confused options and historical "scams" so you never fall for them in the exam.'}
                </p>
              </div>
            </div>
            <div className="group flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  {language === 'hi' ? 'टू-द-पॉइंट लॉजिक' : 'To-The-Point Logic'}
                </h3>
                <p className="leading-relaxed text-slate-600">
                  {language === 'hi'
                    ? 'सीधा और सटीक उत्तर। कोई अनावश्यक जानकारी नहीं।'
                    : 'Direct reasoning without the fluff. Save time and absorb only what matters.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
