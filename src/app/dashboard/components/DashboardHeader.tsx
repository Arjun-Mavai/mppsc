'use client';

import React from 'react';
import Image from 'next/image';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';
import { Crown, Sparkles, User } from 'lucide-react';
import { hasPreAccess, hasMainsAccess } from '@/lib/access-grants';

interface DashboardHeaderProps {
  user: {
    name: string | null;
    planTier: string | null;
    isSubscribed?: boolean | null;
    accessGrants?: any;
  };
  hasUnreadDoubts?: boolean;
}

import { hasUnreadDoubts as fetchUnreadDoubts } from '@/app/profile/actions';

export function DashboardHeader({ user, hasUnreadDoubts: initialUnreadDoubts }: DashboardHeaderProps) {
  const { language, hasUnreadDoubts, setHasUnreadDoubts } = useSettingsStore();
  const isHindi = language === 'hi';
  const router = useRouter();

  React.useEffect(() => {
    fetchUnreadDoubts().then(setHasUnreadDoubts).catch(() => {});
  }, [setHasUnreadDoubts]);

  const hasPre = hasPreAccess(user);
  const hasMains = hasMainsAccess(user);
  const isCombo = hasPre && hasMains;

  return (
    <div className="sticky top-6 z-50 mx-auto max-w-5xl px-4">
      <div className="flex h-16 items-center justify-between rounded-[2rem] border border-indigo-100/50 bg-white/80 px-6 shadow-sm backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="relative h-10 w-10 overflow-hidden rounded-full border border-indigo-100 shadow-inner">
            <Image src="/default-avatar.png" alt={user.name || 'User'} fill className="object-cover scale-150" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black tracking-tight text-indigo-600 shadow-sm border border-indigo-100">
                {isHindi ? 'नमस्ते' : 'Namaste'}
              </span>
              <span className="text-xs font-black tracking-tight text-slate-900">
                {user.name?.split(' ')[0]}
              </span>
            </div>
            <span className="mt-1 text-[8px] font-black tracking-[0.2em] text-slate-400 uppercase">
              {isHindi ? 'विद्यार्थी डैशबोर्ड' : 'Student Dashboard'}
            </span>
          </div>
        </div>

        {/* Reinforced Product Nature Badge */}
        <div className="hidden md:flex items-center gap-2 rounded-full bg-amber-500/10 px-4 py-1 text-[11px] font-black tracking-wide text-amber-800 border border-amber-500/20 shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
          <span>{isHindi ? 'इंटरैक्टिव लर्निंग प्लेटफॉर्म (नोट्स PDF लाइब्रेरी नहीं)' : 'Interactive Learning Platform (Not a PDF Library)'}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button 
              onClick={() => router.push('/profile')}
              className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
              title={isHindi ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}
            >
              {hasUnreadDoubts && (
                <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-red-500"></span>
                </span>
              )}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>

            {hasUnreadDoubts && (
              <div className="absolute right-0 top-[calc(100%+16px)] w-[280px] origin-top-right animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
                {/* Upward pointing arrow */}
                <div className="absolute -top-2 right-3.5 h-4 w-4 rotate-45 border-l border-t border-emerald-200 bg-white shadow-[-2px_-2px_4px_rgba(0,0,0,0.02)]"></div>
                
                {/* Popover Content */}
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-4 shadow-[0_10px_40px_-10px_rgba(16,185,129,0.2)]">
                  {/* Decorative background gradient */}
                  <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-emerald-500/10 blur-2xl"></div>
                  
                  <div className="relative flex gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-sm ring-1 ring-emerald-200/50">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-[13px] font-black text-slate-900 tracking-tight">
                        {isHindi ? `${user.name?.split(' ')[0] || 'नमस्ते'}, नया एक्सपर्ट रिप्लाई!` : `${user.name?.split(' ')[0] || 'Hi'}, New Expert Reply!`}
                      </h4>
                      <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-600">
                        {isHindi 
                          ? 'आपके द्वारा पूछे गए डाउट का जवाब आ गया है। यहाँ क्लिक करें और प्रोफ़ाइल में "My Doubts & Solutions" सेक्शन चेक करें।'
                          : 'An expert has answered your doubt. Click here and scroll to the "My Doubts & Solutions" section in your profile.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
