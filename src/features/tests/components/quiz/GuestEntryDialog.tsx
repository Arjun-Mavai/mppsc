'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { isIndianMobileValid, validateIndianMobileMessage } from '@/lib/validate-indian-mobile';

interface GuestEntryDialogProps {
  open: boolean;
  guestName: string;
  guestEmail: string;
  guestMobile: string;
  isSubmitting: boolean;
  isVerifying?: boolean; // Added to fix TS error
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onMobileChange: (value: string) => void;
  onSubmit: () => void;
  onExit: () => void;
}

export function GuestEntryDialog({
  open,
  guestName,
  guestEmail,
  guestMobile,
  isSubmitting,
  isVerifying = false, // Default to false
  onNameChange,
  onEmailChange,
  onMobileChange,
  onSubmit,
  onExit,
}: GuestEntryDialogProps) {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      setKeyboardHeight(Math.max(0, windowHeight - viewportHeight));
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    return () => window.visualViewport?.removeEventListener('resize', handleResize);
  }, [open]);

  const isNameValid = useMemo(() => {
    const trimmed = guestName.trim();
    // Allow any characters but require at least 2 for basic name validity
    // (Relaxed from a strict regex to support Hindi/other scripts)
    return trimmed.length >= 2;
  }, [guestName]);

  const isMobileValid = useMemo(
    () => isIndianMobileValid(guestMobile.trim()),
    [guestMobile]
  );

  const mobileErrorMsg = useMemo(
    () => (guestMobile.trim() ? validateIndianMobileMessage(guestMobile) : null),
    [guestMobile]
  );

  const isEmailValid = useMemo(() => {
    if (!guestEmail.trim()) return true; // Optional
    return guestEmail.toLowerCase().endsWith('@gmail.com') && guestEmail.length > 10;
  }, [guestEmail]);

  const isFormValid = isNameValid && isMobileValid && isEmailValid;
  const isBusy = isSubmitting || isVerifying;

  const handleInternalSubmit = async () => {
    if (!isFormValid || isBusy) return;
    onSubmit();
  };

  // ✅ Memoize style calculation for performance
  const dialogStyle = useMemo(() => ({
    paddingBottom: keyboardHeight > 0 ? `${Math.max(16, keyboardHeight - 20)}px` : '1rem',
  }), [keyboardHeight]);

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="border-none p-0 sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <div
          className="flex flex-col bg-white"
          style={dialogStyle}
        >
          {/* Header */}
          <DialogHeader className="relative border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white px-6 py-8 sm:px-6">
            <button
              onClick={onExit}
              className="absolute -top-2 -right-2 z-10 rounded-full bg-slate-100 p-2.5 text-slate-500 shadow-sm transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-90 sm:top-2 sm:right-2"
            >
              <X className="h-5 w-5 stroke-[2.5]" />
              <span className="sr-only">Close</span>
            </button>

            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Welcome to MPPSC 2026! 🚀
              </DialogTitle>
              <DialogDescription className="max-w-[280px] text-sm font-medium leading-relaxed text-slate-500 sm:max-w-none">
                Name and mobile help us show your detailed results.
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="flex-1 space-y-4 px-6 py-5 sm:px-6">

            {/* Name Field - Always Visible */}
            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                Full Name <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Enter your name"
                value={guestName}
                onChange={(e) => onNameChange(e.target.value)}
                disabled={isSubmitting || isVerifying}
                className={`h-11 border-slate-200 bg-white text-base font-medium shadow-sm transition-all focus:ring-2 ${
                  guestName.length > 0 && !isNameValid 
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                    : 'focus:border-indigo-500 focus:ring-indigo-200'
                }`}
                autoFocus
                autoComplete="name"
              />
              {guestName.length > 0 && !isNameValid && (
                <p className="animate-in fade-in-0 slide-in-from-top-1 text-[11px] font-bold text-red-500">
                  Please enter a valid name (min 2 letters).
                </p>
              )}
            </div>

            {/* Optional Fields - Appears only after valid name */}
            {isNameValid && (
              <div className="animate-in fade-in-50 slide-in-from-top-2 space-y-4 duration-300">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-1 text-sm font-semibold text-slate-900">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={guestMobile}
                      onChange={(e) => onMobileChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      disabled={isBusy}
                      className={`h-11 border-slate-200 bg-white text-base font-medium shadow-sm transition-all focus:ring-2 ${
                        guestMobile.length > 0 && !isMobileValid 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                          : 'focus:border-indigo-500 focus:ring-indigo-200'
                      }`}
                      autoComplete="tel"
                    />
                    {guestMobile.length > 0 && !isMobileValid && mobileErrorMsg && (
                      <p className="animate-in fade-in-0 slide-in-from-top-1 text-[11px] font-bold text-red-500">
                        {mobileErrorMsg}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="flex items-center justify-between text-[11px] font-bold tracking-wide text-slate-500 uppercase">
                      <span>Gmail (Optional)</span>
                      {guestEmail.length > 0 && (
                        <span className={isEmailValid ? 'text-emerald-600' : 'text-red-500'}>
                          {isEmailValid ? '✓ Valid' : 'Must end with @gmail.com'}
                        </span>
                      )}
                    </label>
                    <Input
                      type="email"
                      placeholder="yourname@gmail.com"
                      value={guestEmail}
                      onChange={(e) => onEmailChange(e.target.value)}
                      disabled={isBusy}
                      className={`h-11 border-slate-200 transition-all focus:ring-2 ${
                        guestEmail.length > 0 && !isEmailValid 
                          ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-red-100' 
                          : 'bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-indigo-200'
                      }`}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sticky Action Button - Always Visible Above Keyboard when fields shown */}
          {isNameValid && (
            <div className="animate-in slide-in-from-bottom-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:px-6">
              <Button
                onClick={handleInternalSubmit}
                disabled={!isFormValid || isBusy}
                className="h-12 w-full rounded-xl bg-slate-900 text-lg font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBusy ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" /> {isVerifying ? 'Verifying...' : 'Starting...'}
                  </>
                ) : (
                  'Start Test 🚀'
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

