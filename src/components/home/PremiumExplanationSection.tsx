'use client';

/**
 * PremiumExplanationSection — "More Than Just Answers" wala section bhai!
 * Yeh dikhata hai ki hamari explanations mein kya-kya aata hai:
 * Core Logic, Exam Fact, Memory Tip, aur Scam Alert — full package!
 */

import React from 'react';
import { CheckCircle2, Lightbulb, Brain, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function PremiumExplanationSection() {
  const { language } = useSettingsStore();

  return (
    <section className="border-t border-slate-200 bg-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <Badge
            variant="outline"
            className="mb-6 rounded-full border-purple-200 bg-purple-50 px-4 py-1 text-sm text-purple-700"
          >
            {language === 'hi' ? 'प्रीमियम व्याख्या' : 'Premium Explanations'}
          </Badge>
          <h2 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
            {language === 'hi' ? 'सिर्फ उत्तर नहीं,' : 'More Than Just Answers.'} <br />
            <span className="text-slate-700">
              {language === 'hi' ? 'संपूर्ण कांसेप्ट सीखें।' : 'Master The Concept.'}
            </span>
          </h2>
          <p className="text-lg leading-relaxed text-slate-600">
            {language === 'hi'
              ? 'हर प्रश्न के साथ मिलती है एक विस्तृत, संरक्षित व्याख्या जो आपको रटने की जगह समझने में मदद करती है।'
              : 'Every question comes with a structured breakdown designed to help you learn, retain, and eliminate wrong options.'}
          </p>
        </div>

        <div className="grid items-start gap-12 lg:grid-cols-2">
          {/* The Card Visualization */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-slate-700 to-purple-600 opacity-10 blur-xl"></div>
            <Card className="relative z-10 overflow-hidden rounded-[2rem] border-0 bg-white shadow-2xl">
              {/* Question Header */}
              <div className="border-b border-slate-100 bg-slate-50 p-6">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-lg leading-snug font-bold text-slate-900">
                    Which river is known as the "Ganga of Madhya Pradesh"?
                    <br />
                    <span className="mt-1 block text-base font-medium text-slate-500">
                      मध्य प्रदेश की गंगा किस नदी को कहा जाता है?
                    </span>
                  </h3>
                  <Badge className="shrink-0 bg-slate-200 text-slate-600 hover:bg-slate-200">
                    MP Geo
                  </Badge>
                </div>
              </div>

              <div className="space-y-6 p-6 md:p-8">
                {/* Answer Status */}
                <div className="flex items-center gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500">
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold tracking-wider text-emerald-700 uppercase">
                      Correct Answer
                    </div>
                    <div className="font-bold text-slate-900">Betwa (बेतवा)</div>
                  </div>
                </div>

                {/* The 4 Gimmick Sections */}
                <div className="space-y-4">
                  {/* 1. Logic */}
                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-emerald-500"></div>
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-emerald-700">
                        <CheckCircle2 size={16} /> ✅ Core Logic
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        Based on <span className="font-bold">pollution levels</span> like the
                        Ganges, Betwa is called the Ganga of MP.
                        <br />
                        <span className="text-xs text-slate-500">
                          (प्रदूषण के आधार पर इसे म.प्र. की गंगा कहा जाता है।)
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* 2. Exam Fact */}
                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-slate-500"></div>
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Lightbulb size={16} /> 💡 Exam Fact
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        Origin: <span className="font-bold">Kumra Gaon (Raisen)</span>. <br />
                        Total Length: <span className="font-bold">480 km</span>.
                      </p>
                    </div>
                  </div>

                  {/* 3. Memory Tip */}
                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-amber-500"></div>
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-amber-700">
                        <Brain size={16} /> 🧠 Memory Tip
                      </h4>
                      <p className="rounded-lg border border-amber-100 bg-amber-50 p-2 text-sm leading-relaxed text-slate-700 italic">
                        "Betwa = Beta (Son) of Raisen" → Kumra Gaon.
                      </p>
                    </div>
                  </div>

                  {/* 4. Scam Alert */}
                  <div className="flex gap-4">
                    <div className="w-1 shrink-0 rounded-full bg-red-500"></div>
                    <div className="flex-1">
                      <h4 className="mb-1 flex items-center gap-2 text-sm font-bold text-red-700">
                        <AlertTriangle size={16} /> 🚫 Scam Alert
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-700">
                        Don't confuse with <span className="font-bold text-red-600">Narmada</span>.
                        Narmada is the <span className="underline">Lifeline</span> of MP, not the
                        Ganga (based on sanctity/pollution distinction).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Features List */}
          <div className="space-y-10 lg:pt-10">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
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
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
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
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
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
