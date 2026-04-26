'use client';

import React, { Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Bookmark, ChevronRight, Home, Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ConnectSocials } from '@/components/ConnectSocials';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { isIndianMobileValid, validateIndianMobileMessage } from '@/lib/validate-indian-mobile';
import { createGuestEntry } from '@/actions/guest-actions';
import { GUEST_LEAD_SOURCE } from '@/lib/lead-source';
import { logger } from '@/lib/logger';
import { Question } from '@/types/quiz';
import { mapQuizToOpenPaperViewQuestion } from '@/lib/map-quiz-to-open-paper-view';
import { OpenPyq2026PaperView } from './components/OpenPyq2026PaperView';
import { toast } from 'sonner';

const STORAGE_KEY = 'mppsc_open_pyq_2026_v1';
const PAPER_YEAR = 2026;

/** Formal exam line — landing hero + paper header (bilingual). */
const FORMAL_TITLE_HI = 'MPPSC राज्य सेवा प्रारंभिक परीक्षा 2026 (पेपर 1 - सामान्य अध्ययन)';
const FORMAL_TITLE_EN =
  'MPPSC State Service Preliminary Examination 2026 (Paper 1 — General Studies)';

type Phase = 'tile' | 'paper';

type StoredLead = { name: string; email: string; mobile: string; at: number };

function readStoredLead(): StoredLead | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as StoredLead;
    if (
      p &&
      typeof p.name === 'string' &&
      p.name.trim().length >= 2 &&
      typeof p.mobile === 'string' &&
      isIndianMobileValid(p.mobile)
    ) {
      return { ...p, email: typeof p.email === 'string' ? p.email : '' };
    }
  } catch {
    /* ignore */
  }
  return null;
}

interface OpenPyq2026ClientProps {
  questions: Question[];
  testTitle: string;
}

export default function OpenPyq2026Client({ questions, testTitle }: OpenPyq2026ClientProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const [ready, setReady] = useState(false);
  const [phase, setPhase] = useState<Phase>('tile');
  const [leadOpen, setLeadOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestMobile, setGuestMobile] = useState('');

  const [savedUser, setSavedUser] = useState<{
    name: string;
    email: string;
    mobile: string;
  } | null>(null);

  const paperRows = useMemo(
    () => questions.map((q, i) => mapQuizToOpenPaperViewQuestion(q, i, PAPER_YEAR)),
    [questions]
  );

  useEffect(() => {
    const s = readStoredLead();
    if (s) {
      setSavedUser({ name: s.name.trim(), email: s.email || '', mobile: s.mobile });
      setPhase('paper');
    }
    setReady(true);
  }, []);

  const isNameValid = useMemo(() => guestName.trim().length >= 2, [guestName]);

  const mobileError = useMemo(
    () => (guestMobile.trim() ? validateIndianMobileMessage(guestMobile) : null),
    [guestMobile]
  );
  const isMobileOk = useMemo(() => isIndianMobileValid(guestMobile), [guestMobile]);

  const isEmailValid = useMemo(() => {
    if (!guestEmail.trim()) return true;
    return guestEmail.toLowerCase().endsWith('@gmail.com') && guestEmail.length > 10;
  }, [guestEmail]);

  const canSubmit = isNameValid && isMobileOk && isEmailValid;

  const onLeadSubmit = useCallback(async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      const name = guestName.trim();
      const email = guestEmail.trim();
      const mobile = guestMobile.replace(/\D/g, '').slice(0, 10);
      const payload: StoredLead = {
        name,
        email,
        mobile,
        at: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setSavedUser({ name, email, mobile });
      setLeadOpen(false);
      setPhase('paper');
      const result = await createGuestEntry({
        name,
        email,
        mobile,
        leadSource: GUEST_LEAD_SOURCE.OPEN_PYQ_2026,
      });
      if (result && 'error' in result) {
        toast.error(
          'We could not save your details. You can still use this page. If the problem continues, contact support or try again later.'
        );
      }
    } catch (e) {
      logger.error('open-pyq-2026 lead', e, { category: 'auth' });
      toast.error('Something went wrong while saving. You can still use the paper below.');
    } finally {
      setSubmitting(false);
    }
  }, [canSubmit, submitting, guestName, guestEmail, guestMobile]);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-[#fafbfc]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-700" />
      </div>
    );
  }

  if (phase === 'paper' && savedUser) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-slate-950">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        }
      >
        <OpenPyq2026PaperView
          questions={paperRows}
          pageTitle={testTitle}
          formalTitleHi={FORMAL_TITLE_HI}
          formalTitleEn={FORMAL_TITLE_EN}
          guestMobile={savedUser.mobile}
          backHref="/"
        />
      </Suspense>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#fafbfc] pb-10 font-sans antialiased">
      {/* Syllabus-page style ambience — mobile-first, soft colour */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-slate-100/80 to-transparent sm:h-80" />
        <div className="absolute -top-10 right-[-20%] h-56 w-56 rounded-full bg-indigo-100/50 blur-3xl sm:-top-20 sm:right-[-10%] sm:h-72 sm:w-72 sm:blur-[100px]" />
        <div className="absolute top-36 left-[-25%] h-52 w-52 rounded-full bg-emerald-100/40 blur-3xl sm:top-44 sm:left-[-15%] sm:h-72 sm:w-72" />
        <div className="absolute bottom-0 left-1/2 h-40 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-violet-100/30 blur-3xl" />
      </div>

      {/* Static bar (scrolls with page) — same layout as before: home + badge | socials; syllabus-ish accent only */}
      <header className="relative z-10 border-b border-indigo-100/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="group inline-flex items-center gap-1.5 rounded-lg px-1.5 py-1 text-slate-600 transition-colors hover:text-indigo-900"
            >
              <Home className="h-4 w-4 shrink-0 text-indigo-600 group-hover:text-indigo-700" />
              <span className="max-w-[9rem] truncate text-xs font-bold sm:max-w-none sm:text-sm">
                Mindful MPPSC
              </span>
            </Link>
            <span className="hidden h-4 w-px shrink-0 bg-gradient-to-b from-transparent via-indigo-200 to-transparent sm:block" />
            <div className="hidden min-w-0 sm:flex sm:items-center sm:gap-1.5">
              <span className="inline-flex h-6 items-center rounded-full border border-emerald-200/80 bg-emerald-50/90 px-2 text-[10px] font-bold tracking-wide text-emerald-800 uppercase">
                {hi ? '2026 तैयारी' : '2026 prep'}
              </span>
            </div>
          </div>
          <ConnectSocials minimal className="shrink-0 scale-90 sm:scale-100" />
        </div>
      </header>

      <main className="relative mx-auto w-full max-w-3xl flex-1 px-4 pt-5 pb-12 sm:px-6 sm:pt-7 sm:pb-16">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 px-3.5 py-2 text-[10px] leading-tight font-black tracking-[0.16em] text-slate-600 uppercase shadow-sm sm:px-4 sm:text-[11px] sm:tracking-[0.18em]">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="truncate">MPPSC · 2026</span>
          </div>

          <h2 className="font-display px-0.5 text-lg leading-[1.35] font-black tracking-tight text-slate-900 sm:px-0 sm:text-2xl sm:leading-snug md:text-[1.75rem] md:leading-snug lg:text-4xl lg:leading-tight">
            {hi ? (
              <>
                <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                  MPPSC राज्य सेवा प्रारंभिक परीक्षा 2026
                </span>
                <span className="mt-2 block text-base leading-snug font-bold text-slate-800 sm:mt-2.5 sm:text-lg md:text-xl">
                  (पेपर 1 - सामान्य अध्ययन)
                </span>
              </>
            ) : (
              <>
                <span className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 bg-clip-text text-transparent">
                  MPPSC State Service Preliminary Examination 2026
                </span>
                <span className="mt-2 block text-[0.95rem] leading-snug font-semibold text-slate-700 sm:text-lg md:text-xl">
                  (Paper 1 — General Studies)
                </span>
              </>
            )}
          </h2>

          <p className="mt-5 max-w-xl px-1 text-base leading-relaxed font-medium text-slate-600 sm:mt-6 sm:px-0 sm:text-lg">
            {hi
              ? `${questions.length} प्रश्न · हिंदी व अंग्रेज़ी में विस्तृत व्याख्या`
              : `${questions.length} questions · detailed explanations in Hindi & English.`}
          </p>
        </div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => setLeadOpen(true)}
          className={cn(
            'group mx-auto mt-8 w-full max-w-lg cursor-pointer overflow-hidden text-left',
            /* Quiz palette sheet: white panel, slate border, soft shadow */
            'border-0 border-slate-100 bg-white shadow-lg shadow-slate-900/10 sm:rounded-2xl sm:border sm:border-slate-100',
            'transition-all duration-200 hover:shadow-xl hover:shadow-slate-900/12',
            'focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafbfc] focus-visible:outline-none',
            'active:scale-[0.99]'
          )}
        >
          {/* Same header row as QuizPaletteMobile SheetHeader */}
          <div className="flex items-start gap-3 border-b border-slate-50 px-5 py-4 sm:px-6 sm:py-5">
            <div className="shrink-0 rounded-xl bg-slate-900 p-2 text-white shadow-md shadow-slate-900/25">
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                {hi ? 'पिछला वर्ष' : 'Previous year'}
              </p>
              <p className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                {hi
                  ? ' MPPSC प्रारंभिक 2026 (पेपर 1 - सामान्य अध्ययन)'
                  : '2026 MPPSC prelims (Paper 1 - General Studies)'}
              </p>
              <p className="text-sm leading-relaxed font-medium text-slate-600 sm:text-base">
                {hi
                  ? `${questions.length} प्रश्न · व्याख्या सहित`
                  : `${questions.length} questions · detailed explanations`}
              </p>
            </div>
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border-2 border-slate-100 bg-white text-slate-500 shadow-sm transition-all group-hover:border-slate-300 group-hover:text-slate-800 sm:h-11 sm:w-11"
              aria-hidden
            >
              <ArrowRight className="h-5 w-5" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-50 bg-slate-50/50 px-5 py-3.5 sm:px-6">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-2.5 py-1 text-[11px] font-black text-white shadow-sm">
              <Sparkles className="h-3 w-3" />
              {hi ? 'लिस्ट' : 'List'}
            </span>
            {/* <span className="text-xs font-bold text-slate-500">
              {hi ? 'टैप करके खोलें · लॉगिन नहीं' : 'Tap to open · No sign-in'}
            </span> */}
          </div>
        </motion.button>
      </main>

      <Dialog
        open={leadOpen}
        onOpenChange={(o) => {
          if (submitting) return;
          setLeadOpen(o);
        }}
      >
        <DialogContent
          className={cn(
            'gap-0 overflow-hidden border-0 bg-white p-0 shadow-lg sm:max-w-md sm:rounded-none sm:border sm:border-slate-100 md:rounded-xl'
          )}
          onInteractOutside={(e) => e.preventDefault()}
          showCloseButton={false}
        >
          <DialogHeader className="relative flex flex-row items-start gap-3 border-b border-slate-50 bg-white px-5 py-4 text-left sm:px-6 sm:py-5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={submitting}
              onClick={() => setLeadOpen(false)}
              className="absolute top-4 right-4 h-8 w-8 rounded-md text-slate-500 opacity-70 transition-opacity hover:bg-slate-100 hover:opacity-100"
              aria-label={hi ? 'बंद करें' : 'Close'}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="shrink-0 rounded-xl bg-slate-900 p-2 text-white shadow-md shadow-slate-900/20">
              <Bookmark className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1 space-y-1 pr-10">
              <DialogTitle className="text-left text-xl font-black tracking-tight text-slate-900">
                {hi ? '2026 प्रारंभिक पेपर अनलॉक करें' : 'Unlock the 2026 prelims paper'}
              </DialogTitle>
              <DialogDescription className="text-left text-sm leading-relaxed text-slate-500">
                {hi
                  ? 'पेपर देखने के लिए अपना नाम और मान्य 10 अंकों का मोबाइल नंबर दर्ज करें।'
                  : 'Enter your name and a valid 10-digit mobile number to open the paper.'}
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="space-y-5 bg-white px-5 py-6 sm:px-6">
            <div className="grid gap-2">
              <Label
                htmlFor="open-pyq-2026-name"
                className="text-xs font-bold tracking-wide text-slate-500 uppercase"
              >
                {hi ? 'पूरा नाम' : 'Full name'} <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="open-pyq-2026-name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder={hi ? 'अपना पूरा नाम' : 'Your full name'}
                className="h-10 border-slate-200 bg-white"
                autoComplete="name"
              />
              {guestName.length > 0 && !isNameValid && (
                <p className="text-xs text-rose-600">
                  {hi ? 'कम से कम दो अक्षर लिखें।' : 'Please enter at least two characters.'}
                </p>
              )}
            </div>

            {isNameValid && (
              <div className="animate-in fade-in-50 space-y-5 duration-200">
                <div className="grid gap-2">
                  <Label
                    htmlFor="open-pyq-2026-mobile"
                    className="text-xs font-bold tracking-wide text-slate-500 uppercase"
                  >
                    {hi ? 'मोबाइल नंबर' : 'Mobile number'} <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="open-pyq-2026-mobile"
                    type="tel"
                    inputMode="numeric"
                    value={guestMobile}
                    onChange={(e) => setGuestMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={hi ? '10 अंक' : '10-digit number'}
                    className="h-10 border-slate-200 bg-white"
                    autoComplete="tel"
                  />
                  {guestMobile.length > 0 && mobileError && (
                    <p className="text-xs text-rose-600">{mobileError}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label
                    htmlFor="open-pyq-2026-email"
                    className="text-xs font-bold tracking-wide text-slate-400 uppercase"
                  >
                    Gmail ({hi ? 'वैकल्पिक' : 'optional'})
                  </Label>
                  <Input
                    id="open-pyq-2026-email"
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="name@gmail.com"
                    className={cn(
                      'h-10 border-slate-200 bg-white',
                      guestEmail.length > 0 &&
                        !isEmailValid &&
                        'border-amber-400 focus-visible:ring-amber-200'
                    )}
                    autoComplete="email"
                  />
                  {guestEmail.length > 0 && !isEmailValid && (
                    <p className="text-xs text-amber-700">
                      {hi
                        ? 'ईमेल हो तो मान्य Gmail पता डालें।'
                        : 'If you add an email, use a valid Gmail address.'}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {isNameValid && (
            <DialogFooter className="border-t border-slate-100 bg-white px-5 py-4 sm:flex-col sm:space-x-0 sm:px-6">
              <Button
                type="button"
                disabled={!canSubmit || submitting}
                onClick={() => void onLeadSubmit()}
                className="group h-14 w-full bg-slate-900 text-lg font-black tracking-tight text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-xl active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {hi ? 'खुल रहा है…' : 'Opening…'}
                  </>
                ) : (
                  <>
                    {hi ? 'पेपर खोलें' : 'Open paper'}
                    <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
