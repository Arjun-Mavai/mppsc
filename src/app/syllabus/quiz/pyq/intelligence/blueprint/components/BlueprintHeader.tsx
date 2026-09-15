'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Languages, Compass, BarChart3, Repeat, Flame, BookMarked } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettingsStore } from '@/store/useSettingsStore';

interface BlueprintHeaderProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function BlueprintHeader({ activeSection, onSectionChange }: BlueprintHeaderProps) {
  const router = useRouter();
  const { language, setLanguage } = useSettingsStore();
  const isHindi = language === 'hi';

  const toggleLanguage = () => {
    setLanguage(isHindi ? 'en' : 'hi');
  };

  const navItems = [
    { id: 'overview', icon: Compass, labelEn: 'Overview', labelHi: 'सिंहावलोकन' },
    { id: 'matrix', icon: BarChart3, labelEn: '7-Yr Matrix', labelHi: '7-वर्षीय मैट्रिक्स' },
    { id: 'patterns', icon: Repeat, labelEn: 'Repeated PYQs', labelHi: 'दोहराए गए प्रश्न' },
    { id: 'hot-topics', icon: Flame, labelEn: 'Hot Topics & Cheats', labelHi: 'हॉट टॉपिक्स & चीट शीट्स' },
    { id: 'study-plan', icon: BookMarked, labelEn: 'Study Sequence', labelHi: 'अध्ययन क्रम' },
  ];

  return (
    <div className="sticky top-0 z-40 border-b border-[#0b0d14]/15 bg-[#f4f5f8]/95 backdrop-blur-md transition-all font-mono">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        {/* Top bar: px0.ai Nav Inner */}
        <div className="flex h-12 sm:h-14 items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/syllabus/quiz/pyq/intelligence')}
              className="-ml-1 h-8 w-8 shrink-0 rounded-none border border-[#0b0d14]/15 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black"
              title={isHindi ? 'वापस जाएं' : 'Back to Intelligence Home'}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-bold text-xs sm:text-sm text-[#0b0d14] tracking-tight">
                <span className="text-[#b45309] font-black">[MPPSC]</span> BLUEPRINT
              </span>
              <span className="hidden md:inline-block h-3 w-[1px] bg-[#0b0d14]/20" />
              <span className="hidden md:inline-block text-[11px] uppercase tracking-wider text-zinc-500">
                {isHindi ? 'अनुभवजन्य कटऑफ ब्लूप्रिंट' : 'read-only intelligence'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 border border-[#0b0d14]/15 bg-white px-2 py-0.5 text-[11px] text-zinc-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#d97706] animate-pulse" />
              <span>v2026.1</span>
            </span>

            {/* Language Switcher */}
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="h-7.5 rounded-none border border-[#0b0d14]/20 bg-white px-2.5 text-xs font-mono font-bold text-zinc-800 hover:border-[#b45309] hover:bg-amber-50 hover:text-[#b45309] transition-all"
            >
              <Languages className="mr-1.5 h-3.5 w-3.5 text-[#b45309]" />
              <span>{isHindi ? 'EN' : 'हिंदी'}</span>
            </Button>
          </div>
        </div>

        {/* Bottom bar: Horizontal Numbered Nav Tabs (px0.ai style: 01, 02, 03, ...) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-0.5 scrollbar-none border-t border-[#0b0d14]/5">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSectionChange(item.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 px-3 py-1 text-xs font-mono transition-all rounded-none border ${
                  isActive
                    ? 'bg-[#d97706] text-white font-bold border-[#b45309] shadow-xs'
                    : 'bg-white text-zinc-600 border-[#0b0d14]/15 hover:border-[#0b0d14]/40 hover:text-[#0b0d14]'
                }`}
              >
                <span className={`text-[10px] ${isActive ? 'text-amber-100' : 'text-zinc-400'}`}>
                  0{idx + 1}
                </span>
                <Icon className={`h-3 w-3 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{isHindi ? item.labelHi : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
