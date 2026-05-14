'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Moon, SlidersHorizontal, SunMedium } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore } from '@/store/useSettingsStore';

type Paper = {
  id: string;
  examYear: number;
  paperNumber: number;
};

type ReadingTheme = 'deep' | 'paper';

interface PyqDeskControlsProps {
  papers: Paper[];
  paperId: string;
  onPaperChange: (id: string) => void;
  readingTheme: ReadingTheme;
  onThemeChange: (theme: ReadingTheme) => void;
  deskControlsOpen: boolean;
  onControlsToggle: (open: boolean) => void;
}

export function PyqDeskControls({
  papers,
  paperId,
  onPaperChange,
  readingTheme,
  onThemeChange,
  deskControlsOpen,
  onControlsToggle,
}: PyqDeskControlsProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';
  const themeDeep = readingTheme === 'deep';

  return (
    <AnimatePresence initial={false}>
      {deskControlsOpen ? (
        <motion.div
          key="desk-controls"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden"
        >
          <div
            className={cn(
              'mb-5 space-y-5 rounded-3xl border p-5 sm:p-6 transition-all duration-300 shadow-xl',
              themeDeep ? 'border-slate-700 bg-slate-900/60 backdrop-blur-md shadow-black/40' : 'border-slate-200/80 bg-white/95 backdrop-blur-md shadow-slate-200/60'
            )}
          >
            {/* 1. PAPER SELECTOR (TOP) */}
            <div>
              <label
                className={cn(
                  'mb-2 flex items-center gap-1.5 text-xs font-black uppercase tracking-wider',
                  themeDeep ? 'text-emerald-400' : 'text-emerald-600'
                )}
              >
                <span>🎯</span>
                <span>{hi ? 'पेपर चुनें (Select Paper)' : 'Select Paper'}</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full animate-pulse',
                      themeDeep
                        ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                        : 'bg-emerald-600 shadow-[0_0_10px_rgba(5,150,105,0.4)]'
                    )}
                  />
                </div>
                <Select value={paperId} onValueChange={onPaperChange}>
                  <SelectTrigger
                    className={cn(
                      'h-13 w-full rounded-2xl pl-10 pr-4 text-base font-black shadow-md ring-offset-0 transition-all focus:ring-0',
                      themeDeep
                        ? 'border-slate-700 bg-slate-950 text-slate-100 hover:border-emerald-500/50 hover:bg-slate-900/90 [&_svg]:text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-800 hover:border-emerald-500/40 hover:bg-white'
                    )}
                  >
                    <SelectValue placeholder={hi ? 'पेपर चुनें' : 'Select paper'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    viewportClassName="max-h-[280px] overflow-y-auto py-1.5 no-scrollbar"
                    className={cn(
                      'z-[200] w-[min(100%,var(--radix-select-trigger-width))] min-w-[280px] max-w-[90vw] rounded-2xl shadow-2xl',
                      themeDeep
                        ? 'border border-slate-700 bg-slate-950 text-slate-100'
                        : 'border border-slate-200 bg-white text-slate-800'
                    )}
                  >
                    {papers.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        textValue={`${p.examYear} Paper ${p.paperNumber}`}
                        className={cn(
                          'cursor-pointer py-3.5 px-4 text-sm font-bold md:text-[15px] transition-colors rounded-xl mx-1 my-0.5',
                          themeDeep
                            ? 'text-slate-300 focus:bg-slate-800 focus:text-white'
                            : 'text-slate-700 focus:bg-emerald-50 focus:text-emerald-950'
                        )}
                      >
                        <span className="font-black tabular-nums flex items-center gap-2">
                          <span className="text-emerald-500">▪</span>
                          <span>{p.examYear}</span>
                          <span className="opacity-40">|</span>
                          <span>{hi ? <>पेपर {p.paperNumber}</> : <>Paper {p.paperNumber}</>}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 2. THEME SWITCHER (MIDDLE) */}
            <div
              className={cn(
                'flex items-center justify-between gap-3 border-t pt-4',
                themeDeep ? 'border-slate-800' : 'border-slate-100'
              )}
            >
              <span
                className={cn(
                  'text-xs font-extrabold uppercase tracking-wider',
                  themeDeep ? 'text-slate-400' : 'text-slate-500'
                )}
              >
                {hi ? 'पठन थीम (Theme)' : 'Reading Theme'}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1.5 rounded-2xl border p-1.5',
                  themeDeep ? 'border-slate-700 bg-slate-950/80' : 'border-slate-200 bg-slate-100/80 shadow-inner'
                )}
              >
                <Button
                  type="button"
                  variant={!themeDeep ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'rounded-xl font-black px-4 py-2 h-9 transition-all active:scale-95',
                    !themeDeep ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400' : 'text-slate-400 hover:text-slate-200'
                  )}
                  onClick={() => onThemeChange('paper')}
                >
                  <SunMedium className="mr-1.5 h-4 w-4 shrink-0" />
                  {hi ? 'हल्का' : 'Light'}
                </Button>
                <Button
                  type="button"
                  variant={themeDeep ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'rounded-xl font-black px-4 py-2 h-9 transition-all active:scale-95',
                    themeDeep ? 'bg-slate-800 text-white shadow-md border border-slate-700 hover:bg-slate-700' : 'text-slate-600 hover:text-slate-900'
                  )}
                  onClick={() => onThemeChange('deep')}
                >
                  <Moon className="mr-1.5 h-4 w-4 shrink-0" />
                  {hi ? 'गहरा' : 'Dark'}
                </Button>
              </div>
            </div>

            {/* 3. DESCRIPTIVE TEXT (BOTTOM FOOTER) */}
            <div
              className={cn(
                'rounded-2xl p-4 border transition-colors',
                themeDeep ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-100 text-slate-600'
              )}
            >
              <div className="flex items-start gap-2.5">
                <SlidersHorizontal className={cn("h-4 w-4 mt-0.5 shrink-0", themeDeep ? "text-amber-500" : "text-amber-600")} />
                <p className="text-xs leading-relaxed font-semibold">
                  {hi
                    ? 'पेपर या पठन थीम बदलने के लिए ऊपर दिए गए विकल्पों का उपयोग करें। नीचे संपूर्ण प्रश्न सूची और सटीक विश्लेषणात्मक उत्तर उपलब्ध हैं।'
                    : 'Use the controls above to fast-switch exam papers or reading mode. Access the complete list of strategic answers below.'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
