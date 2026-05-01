'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, BookOpen, Lightbulb, BarChart3, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExpandableCard } from './shared/ExpandableCard';
import { cn } from '@/lib/utils';

interface PYQMenuProps {
  isHindi: boolean;
  currentPage?: 'intelligence' | 'facts' | 'analysis' | 'repeated';
  theme?: 'light' | 'dark';
}

const menuItems = [
  {
    id: 'intelligence',
    href: '/syllabus/quiz/pyq/intelligence',
    icon: Sparkles,
    title: 'Premium Intelligence',
    titleHi: 'प्रीमियम इंटेलिजेंस',
    subtitle: 'Extracting Every Secret of PYQs',
    subtitleHi: 'PYQ के हर रहस्य का विश्लेषण',
    color: 'emerald',
  },
  {
    id: 'facts',
    href: '/syllabus/quiz/pyq/facts',
    icon: Lightbulb,
    title: 'Facts Library',
    titleHi: 'फैक्ट्स लाइब्रेरी',
    subtitle: 'High-yield Exam Facts',
    subtitleHi: 'परीक्षा फैक्ट्स',
    color: 'emerald',
  },
  /*
  {
    id: 'analysis',
    href: '/syllabus/quiz/pyq/analysis',
    icon: BarChart3,
    title: 'Topic Analysis',
    titleHi: 'विषय विश्लेषण',
    subtitle: 'Deep-dive by Subject',
    subtitleHi: 'विषयवार गहन विश्लेषण',
    color: 'cyan',
  },
  */
];

export function PYQMenu({ isHindi, currentPage, theme = 'dark' }: PYQMenuProps) {
  const router = useRouter();
  const header = (
    <div className="flex flex-col gap-1">
      <div className={cn("mb-1 flex items-center gap-2 text-sm font-medium tracking-wider uppercase", theme === 'light' ? "text-[#86868B]" : "text-slate-400")}>
        <div className={cn("h-1.5 w-1.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]", theme === 'light' ? "bg-indigo-500" : "bg-emerald-500")} />
        {isHindi ? 'मेनू' : 'Menu'}
      </div>
      <h3 className={cn("flex items-center gap-3 text-2xl font-black tracking-tight sm:text-3xl", theme === 'light' ? "text-indigo-600" : "text-amber-500")}>
        {isHindi ? 'प्रीमियम इंटेलिजेंस टूल्स' : 'Premium Intelligence Tools'}
      </h3>
    </div>
  );

  return (
    <ExpandableCard
      id="menu"
      defaultExpanded={true}
      header={header}
      gradientFrom="from-emerald-600/20"
      gradientTo="to-teal-500/10"
    >
      <CardContent className="p-4 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <Link
                key={item.id}
                href={item.href}
                prefetch={true}
                onMouseEnter={() => router.prefetch(item.href)}
                className={cn(
                  'block w-full cursor-pointer',
                  isActive && 'pointer-events-none'
                )}
              >
                <div
                  className={cn(
                    'rounded-2xl p-[1px] transition-all duration-300',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                      : 'bg-white/5 hover:bg-white/10'
                  )}
                >
                  <div
                    className={cn(
                      'group relative flex h-auto w-full items-center gap-4 overflow-hidden rounded-[15px] px-5 py-4 transition-all duration-300',
                      isActive
                        ? (theme === 'light' ? 'bg-indigo-50 hover:bg-indigo-100/50' : 'bg-[#080510] hover:bg-[#0c081a]')
                        : (theme === 'light' ? 'bg-transparent hover:bg-slate-50' : 'bg-[#080510]/40 hover:bg-white/5')
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-500',
                        isActive
                          ? (theme === 'light' ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]')
                          : (theme === 'light' ? 'bg-indigo-50 text-indigo-500 group-hover:bg-indigo-100' : 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20')
                      )}
                    >
                      <Icon className={cn('h-6 w-6', isActive && 'animate-pulse')} />
                    </div>

                    <div className="flex flex-col items-start text-left">
                      <span
                        className={cn(
                          'text-lg font-black tracking-tight transition-colors',
                          isActive
                            ? (theme === 'light' ? 'text-indigo-600' : 'text-emerald-500')
                            : (theme === 'light' ? 'text-[#1D1D1F] group-hover:text-indigo-600' : 'text-slate-200 group-hover:text-emerald-400')
                        )}
                      >
                        {isHindi ? item.titleHi : item.title}
                      </span>
                      <span
                        className={cn(
                          'text-[10px] font-bold tracking-[0.1em] uppercase',
                          isActive 
                            ? (theme === 'light' ? 'text-indigo-400' : 'text-slate-400') 
                            : (theme === 'light' ? 'text-[#86868B] group-hover:text-indigo-400' : 'text-slate-500 group-hover:text-slate-400')
                        )}
                      >
                        {isHindi ? item.subtitleHi : item.subtitle}
                      </span>
                    </div>

                    {!isActive && (
                      <ChevronRight className="ml-auto h-5 w-5 text-slate-600 transition-transform group-hover:translate-x-1 group-hover:text-emerald-500" />
                    )}

                    {isActive && (
                      <div className="ml-auto hidden sm:block">
                        <div className={cn(
                          "flex h-2 w-2 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]",
                          theme === 'light' ? "bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.6)]" : "bg-emerald-500"
                        )} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </ExpandableCard>
  );
}
