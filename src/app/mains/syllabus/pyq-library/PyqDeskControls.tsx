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
              'mb-5 space-y-4 rounded-2xl border p-4 sm:p-5',
              themeDeep ? 'border-slate-700 bg-slate-900/50' : 'border-slate-200 bg-white/90 shadow-sm'
            )}
          >
            <p
              className={cn(
                'text-[15px] leading-relaxed md:text-base',
                themeDeep ? 'text-slate-300' : 'text-slate-600'
              )}
            >
              {hi
                ? 'पिछले वर्षों के वास्तविक मेंस प्रश्न, दो लेखन शैलियों में तैयार उत्तर और एक्सपर्ट टिप्स — साइट की भाषा स्विच से पढ़ें; प्रश्न पर टैप कर विस्तार खोलें।'
                : 'Real MPPSC Mains previous-year questions, two curated answer styles, and expert pointers — use the site language switcher; tap a question to expand.'}
            </p>

            <div
              className={cn(
                'flex flex-wrap items-center gap-3 border-t pt-4',
                themeDeep ? 'border-slate-700' : 'border-slate-100'
              )}
            >
              <span
                className={cn(
                  'text-[10px] font-black uppercase tracking-[0.14em]',
                  themeDeep ? 'text-slate-500' : 'text-slate-500'
                )}
              >
                {hi ? 'पठन थीम' : 'Reading'}
              </span>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-2xl border p-1',
                  themeDeep ? 'border-slate-600 bg-slate-950/70' : 'border-slate-200 bg-slate-50 shadow-sm'
                )}
              >
                <Button
                  type="button"
                  variant={!themeDeep ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'rounded-xl font-black',
                    !themeDeep && 'bg-amber-500 text-slate-900 shadow-sm hover:bg-amber-400'
                  )}
                  onClick={() => onThemeChange('paper')}
                >
                  <SunMedium className="mr-1.5 h-4 w-4" />
                  {hi ? 'हल्का' : 'Light'}
                </Button>
                <Button
                  type="button"
                  variant={themeDeep ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    'rounded-xl font-black',
                    themeDeep && 'bg-slate-800 text-white hover:bg-slate-700'
                  )}
                  onClick={() => onThemeChange('deep')}
                >
                  <Moon className="mr-1.5 h-4 w-4" />
                  {hi ? 'गहरा' : 'Dark'}
                </Button>
              </div>
            </div>

            <div
              className={cn(
                'border-t pt-4',
                themeDeep ? 'border-slate-700' : 'border-slate-100'
              )}
            >
              <label
                className={cn(
                  'mb-2 block text-[10px] font-black uppercase tracking-[0.14em]',
                  themeDeep ? 'text-slate-500' : 'text-slate-500'
                )}
              >
                {hi ? 'पेपर' : 'Paper'}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
                  <div
                    className={cn(
                      'h-1.5 w-1.5 rounded-full',
                      themeDeep
                        ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.35)]'
                        : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.45)]'
                    )}
                  />
                </div>
                <Select value={paperId} onValueChange={onPaperChange}>
                  <SelectTrigger
                    className={cn(
                      'h-12 w-full rounded-2xl pl-10 text-sm font-bold shadow-sm ring-offset-0 transition-all focus:ring-0 sm:text-base',
                      themeDeep
                        ? 'border-slate-600 bg-slate-900/85 text-slate-100 hover:border-emerald-500/45 hover:bg-slate-900 [&_svg]:text-slate-400'
                        : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:border-emerald-300 hover:bg-white'
                    )}
                  >
                    <SelectValue placeholder={hi ? 'पेपर चुनें' : 'Select paper'} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    sideOffset={5}
                    viewportClassName="max-h-[280px] overflow-y-auto py-1 no-scrollbar"
                    className={cn(
                      'z-[200] w-[min(100%,var(--radix-select-trigger-width))] min-w-[280px] max-w-[90vw] rounded-2xl shadow-2xl',
                      themeDeep
                        ? 'border border-slate-600 bg-slate-900 text-slate-100'
                        : 'border border-slate-100 bg-white text-slate-700'
                    )}
                  >
                    {papers.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        textValue={`${p.examYear} Paper ${p.paperNumber}`}
                        className={cn(
                          'cursor-pointer py-3 text-sm font-bold md:text-[15px]',
                          themeDeep
                            ? 'text-slate-300 focus:bg-slate-800 focus:text-white'
                            : 'text-slate-600 focus:bg-emerald-50 focus:text-emerald-800'
                        )}
                      >
                        <span className="font-black tabular-nums">
                          {p.examYear}
                          <span className="mx-1.5 font-semibold opacity-50">·</span>
                          {hi ? <>पेपर {p.paperNumber}</> : <>Paper {p.paperNumber}</>}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
