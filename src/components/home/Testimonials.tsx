'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Star, Quote, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// Real Aspirant Data (Hinglish + MP Locations)
import { useSettingsStore } from '@/store/useSettingsStore';

const TESTIMONIALS = [
  {
    name: 'Palak sahu',
    role: 'Aspirant',
    location: 'Indore',
    comment:
      'Unlike you,no one is providing such quality analysis at such depth. Serious aspirants can definately take its holistic advantage for sure! The best part is you have such robust feedback system which ensured that every relevant suggestions should be heard.',
    stars: 5,
  },
  {
    name: 'Arjun Gurjar',
    role: 'Aspirant',
    location: 'Gwalior',
    comment:
      'PYQs ke liye ek gazab ki cheez mili hai. Main abhi tak sirf ratta maar raha tha, par is website (mppsc.zenscroll.app) par explanation ka tarika ekdum alag hai',
    image: '/testimonials/arjun.png',
    stars: 5,
  },
  {
    name: 'Shivam Gurjar',
    role: 'Aspirant',
    location: 'Ujjain',
    comment: 'Recent history and explanation of answers is next level h.',
    image: '/testimonials/shivam.png',
    stars: 5,
  },
  {
    name: 'Rahul Tiwari',
    role: 'Aspirant',
    location: 'Satna',
    comment:
      'Bhai app ka analysis part bahut sahi hai. Har question ka timing dikhta hai, jo help karta hai speed badhane me.',
    image: '/testimonials/rahul.png',
    stars: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Aspirant',
    location: 'Rewa',
    comment: 'बस एक ही शब्द में - बेहतरीन!',
    image: '/testimonials/priya.png',
    stars: 5,
  },
  {
    name: 'Amit Patel',
    role: 'Aspirant',
    location: 'Bhopal',
    comment:
      'Syllabus ke har topic ka analysis acha laga. Pata chalta hai ki kaunsa topic strong hai aur kisme mehnat karni hai.',
    image: '/testimonials/amit.png',
    stars: 5,
  },
  {
    name: 'Sneha Gupta',
    role: 'Aspirant',
    location: 'Gwalior',
    comment:
      'English medium walo ke liye hindi terms samajhna mushkil hota tha, par is app ne wo problem solve kar di.',
    image: '/testimonials/sneha.png',
    stars: 5,
  },
  {
    name: 'Vikram Singh',
    role: 'Aspirant',
    location: 'Shivpuri',
    comment:
      'Test series ka level actual exam jaisa hai. Analysis dekh kar weak areas clearly pata chal jate hain.',
    image: '/testimonials/vikram.png',
    stars: 5,
  },
  {
    name: 'Anjali Verma',
    role: 'Aspirant',
    location: 'Ashoknagar',
    comment: 'Mnemonics wale flashcards bahut creative hain.',
    image: '/testimonials/anjali.png',
    stars: 5,
  },
  {
    name: 'Sandeep Yadav',
    role: 'Aspirant',
    location: 'Morena',
    comment:
      'Daily quizzes se continuity bani rahti hai. Question timings feature ne meri speed improve kar di.',
    image: '/testimonials/sandeep.png',
    stars: 5,
  },
  {
    name: 'Divya Jain',
    role: 'Aspirant',
    location: 'Bhind',
    comment: 'Syllabus ko cards ke form me and flashcards me convert karna bahut creative hai.',
    image: '/testimonials/divya.png',
    stars: 5,
  },
];

export function Testimonials() {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const t = {
    tag: hi ? 'छात्रों की सफलता की कहानियाँ' : 'Student Success Stories',
    titleStart: hi ? 'लगनशील उम्मीदवारों' : 'Loved by',
    titleHighlight: hi ? 'का भरोसा' : 'Serious Aspirants',
    subtitle: hi
      ? 'मध्य प्रदेश के कोने-कोने से जुड़े उन छात्रों के साथ शामिल हों जो स्मार्ट तरीके से सिलेबस पूरा कर रहे हैं।'
      : 'Join students from every corner of Madhya Pradesh who are mastering the syllabus smarter, not harder.',
  };

  return (
    <section className="overflow-hidden border-t border-slate-100 bg-slate-50 py-24">
      <div className="container mx-auto mb-16 px-4 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-700 uppercase">
          <Star className="h-3.5 w-3.5 fill-indigo-700" />
          {t.tag}
        </div>
        <h2 className="font-display mb-6 text-3xl leading-tight font-black tracking-tight text-slate-900 md:text-5xl">
          {hi ? (
            <>
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t.titleStart}
              </span>{' '}
              {t.titleHighlight}
            </>
          ) : (
            <>
              {t.titleStart}{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                {t.titleHighlight}
              </span>
            </>
          )}
        </h2>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-500 md:text-xl">
          {t.subtitle}
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="mask-linear-fade relative flex w-full overflow-hidden">
        {/* Gradient Masks */}
        <div className="pointer-events-none absolute top-0 left-0 z-20 h-full w-24 bg-gradient-to-r from-slate-50 via-slate-50/80 to-transparent md:w-48" />
        <div className="pointer-events-none absolute top-0 right-0 z-20 h-full w-24 bg-gradient-to-l from-slate-50 via-slate-50/80 to-transparent md:w-48" />

        {/* Marquee Track */}
        <div className="group flex overflow-hidden select-none">
          <div className="animate-marquee-scroll flex w-max shrink-0 items-stretch gap-6 pr-6 py-4 hover:[animation-play-state:paused]">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((user, idx) => (
              <div
                key={`${user.name}-${idx}`}
                className="flex h-full w-[300px] shrink-0 flex-col justify-between rounded-3xl border border-slate-200/60 bg-white p-6 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/5 md:w-[380px] md:p-8"
              >
                <div>
                  <Quote className="mb-6 h-8 w-8 text-indigo-100 transition-colors group-hover:text-indigo-200" />
                  <p className="mb-6 text-base leading-relaxed font-medium text-slate-700 md:text-lg">
                    "{user.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-4 border-t border-slate-50 pt-6">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 bg-slate-50">
                    <Image
                      height={48}
                      width={48}
                      src={user?.image || '/assets/images/user.png'}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="truncate leading-tight font-bold text-slate-900">{user.name}</h4>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3 w-3 text-indigo-500" />
                      <span className="truncate font-medium">
                        {user.location} • {user.role}
                      </span>
                    </div>
                  </div>
                  <div className="ml-auto flex shrink-0 gap-0.5 rounded-full border border-amber-100/50 bg-amber-50 px-2 py-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    <span className="ml-0.5 text-xs font-bold text-amber-700">5.0</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
