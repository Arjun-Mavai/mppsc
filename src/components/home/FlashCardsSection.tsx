'use client';

/**
 * FlashCardsSection — Yeh section flash card flip demo dikhata hai bhai!
 * Active Recall technique ka demo — tap to flip, swipe to next wala feel.
 * Dynasties, Capitals, Mnemonics sab ek card mein packed hai.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Target, RotateCw, Lightbulb } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';

export function FlashCardsSection() {
  const { language } = useSettingsStore();

  const [isFlipped, setIsFlipped] = React.useState(false);

  React.useEffect(() => {
    // Auto-flip demo sequence
    const timer1 = setTimeout(() => setIsFlipped(true), 1500);
    const timer2 = setTimeout(() => setIsFlipped(false), 4500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <section className="relative overflow-hidden py-32">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid items-center gap-20 lg:grid-cols-2">
          <div className="order-2 space-y-8 lg:order-1">
            <Badge
              variant="outline"
              className="border-slate-200 bg-slate-50 px-4 py-1 text-sm text-slate-700"
            >
              {language === 'hi' ? 'सक्रिय शिक्षण' : 'Active Learning'}
            </Badge>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
              {language === 'hi' ? 'इंटरैक्टिव फ्लैशकार्ड्स।' : 'Interactive Flash Cards.'}
            </h2>
            <p className="text-lg leading-relaxed font-medium text-slate-600">
              {language === 'hi'
                ? 'रटने की जरूरत नहीं। हमारे फ्लैशकार्ड्स "Active Recall" तकनीक का उपयोग करते हैं, जिससे आप तारीखें, वंश और अनुच्छेद चुटकियों में याद कर लेंगे।'
                : 'Never forget a fact again. Our curated flashcards use active recall to help you memorize Dates, Dynasties, and Articles effortlessly.'}
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                  <RotateCw className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {language === 'hi' ? 'स्मार्ट रोटेशन' : 'Smart Rotation'}
                  </h4>
                  <p className="text-slate-600">
                    {language === 'hi'
                      ? 'जवाब देखने के लिए टैप करें। अगले कार्ड के लिए स्वाइप करें।'
                      : 'Tap to reveal key facts. Swipe to next.'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <Lightbulb className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {language === 'hi' ? 'निमोनिक्स (स्मरण सूत्र)' : 'Mnemonics Included'}
                  </h4>
                  <p className="text-slate-600">
                    {language === 'hi'
                      ? 'जटिल विषयों को याद रखने के लिए आसान ट्रिक्स।'
                      : 'Complex topics broken down into easy memory tricks.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="perspective-1000 order-1 flex justify-center lg:order-2 lg:justify-end">
            <div
              className="group h-80 w-full max-w-md cursor-pointer bg-transparent select-none [perspective:1000px]"
              onClick={handleCardClick}
            >
              <motion.div
                className="relative h-full w-full rounded-3xl shadow-2xl transition-all duration-700 [transform-style:preserve-3d] hover:shadow-slate-500/20"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-8 [backface-visibility:hidden]">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <Target size={120} />
                  </div>
                  <span className="absolute top-6 left-6 font-serif text-7xl font-bold text-slate-100">
                    01
                  </span>

                  {/* Icon */}
                  <div className="mb-8 flex h-20 w-20 rotate-3 transform items-center justify-center rounded-2xl bg-gradient-to-tr from-slate-700 to-purple-500 shadow-lg transition-transform group-hover:rotate-6">
                    <Sparkles className="h-10 w-10 text-white" />
                  </div>

                  <h3 className="text-center text-3xl font-extrabold text-slate-900">
                    {language === 'hi' ? 'मध्य प्रदेश का इतिहास' : 'History of MP'}
                  </h3>
                  <span className="mt-4 flex items-center gap-2 rounded-full bg-slate-100 px-4 py-1.5 text-sm font-semibold text-slate-500">
                    <RotateCw size={14} />{' '}
                    {language === 'hi' ? 'पलटने के लिए टैप करें' : 'Tap to Flip'}
                  </span>
                </div>

                {/* Back */}
                <div className="absolute inset-0 flex h-full w-full [transform:rotateY(180deg)] flex-col justify-between overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white [backface-visibility:hidden]">
                  {/* Texture */}
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-20"></div>
                  <div className="absolute -right-20 -bottom-20 h-60 w-60 rounded-full bg-slate-500 opacity-30 blur-3xl"></div>

                  <div className="relative">
                    <div className="mb-1 text-xs font-bold tracking-widest text-slate-400 uppercase">
                      {language === 'hi' ? 'विषय विश्लेषण' : 'Topic Analysis'}
                    </div>
                    <h4 className="text-2xl font-bold text-white">
                      {language === 'hi' ? 'राजवंश और राजधानियाँ' : 'Dynasties & Capitals'}
                    </h4>
                  </div>

                  <ul className="relative space-y-3">
                    <li className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-medium">
                        Holkar:{' '}
                        <span className="text-slate-300">
                          {language === 'hi' ? 'इंदौर (मालवा)' : 'Indore (Malwa)'}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-medium">
                        Scindia:{' '}
                        <span className="text-slate-300">
                          {language === 'hi' ? 'ग्वालियर' : 'Gwalior'}
                        </span>
                      </span>
                    </li>
                    <li className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/5 p-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-medium">
                        Bundela:{' '}
                        <span className="text-slate-300">
                          {language === 'hi' ? 'ओरछा' : 'Orchha'}
                        </span>
                      </span>
                    </li>
                  </ul>

                  <div className="relative mt-2 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 p-3">
                    <div className="mb-1 flex items-center gap-1 text-xs font-bold text-amber-300 uppercase">
                      <Lightbulb size={12} /> {language === 'hi' ? 'स्मरण सूत्र' : 'Mnemonic'}
                    </div>
                    <div className="text-sm font-medium text-amber-100">
                      "Holkar In Doors" (Indore)
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
