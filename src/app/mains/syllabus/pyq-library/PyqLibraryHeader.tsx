'use client';

import Link from 'next/link';
import { ArrowLeft, BookMarked, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSettingsStore } from '@/store/useSettingsStore';

type ReadingTheme = 'deep' | 'paper';

interface PyqLibraryHeaderProps {
  readingTheme: ReadingTheme;
  deskControlsOpen: boolean;
  onControlsToggle: (open: boolean) => void;
}

export function PyqLibraryHeader({
  readingTheme,
  deskControlsOpen,
  onControlsToggle,
}: PyqLibraryHeaderProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const themeDeep = readingTheme === 'deep';

  return (
    <div className="mb-5 flex items-start gap-3">
      <BookMarked
        className={cn('mt-0.5 h-9 w-9 shrink-0', themeDeep ? 'text-emerald-400' : 'text-emerald-600')}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2 sm:gap-3">
          <h1
            className={cn(
              'min-w-0 flex-1 text-balance text-xl font-black tracking-tight sm:text-[1.65rem] md:text-[2rem]',
              !themeDeep &&
                'bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent'
            )}
          >
            {hi
              ? 'MPPSC मेंस PYQ लाइब्रेरी — प्रामाणिक पेपर व मॉडल उत्तर'
              : 'MPPSC Mains PYQ Library — authentic papers & model answers'}
          </h1>
          <button
            type="button"
            onClick={() => onControlsToggle(!deskControlsOpen)}
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-colors',
              deskControlsOpen
                ? themeDeep
                  ? 'border-emerald-500 bg-emerald-950/50 text-emerald-200'
                  : 'border-emerald-500 bg-emerald-50 text-emerald-900'
                : themeDeep
                  ? 'border-slate-600 bg-slate-900 text-slate-300 hover:bg-slate-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            )}
            aria-expanded={deskControlsOpen}
            aria-label={hi ? 'पेपर, थीम व विवरण' : 'Paper, theme & description'}
          >
            <SlidersHorizontal className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
        {!deskControlsOpen ? (
          <p
            className={cn(
              'mt-1.5 text-xs font-semibold tracking-wide',
              themeDeep ? 'text-slate-500' : 'text-slate-500'
            )}
          >
            {hi
              ? 'पेपर, थीम्स या परिचय खोलने के लिए दाएँ नियंत्रण बटन का उपयोग करें। नीचे संपूर्ण प्रश्न सूची और सटीक विश्लेषणात्मक उत्तर उपलब्ध हैं।'
              : 'Use the right control panel to explore paper filters, dark mode, or summary guides. Access the complete list of strategic answers below.'}
          </p>
        ) : null}
      </div>
    </div>
  );
}
