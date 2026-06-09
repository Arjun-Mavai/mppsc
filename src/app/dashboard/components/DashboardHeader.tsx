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
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const router = useRouter();

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

        <div className="flex items-center gap-4">
          {/* Moved Status Badges to Top Right */}
          <div className="hidden sm:flex items-center">
            {isCombo ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
                <Crown size={12} className="text-amber-400 fill-amber-400/20 shrink-0" />
                <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 bg-clip-text text-transparent">
                  COMBO MEMBER
                </span>
              </div>
            ) : hasMains ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
                <Crown size={12} className="text-emerald-400 fill-emerald-400/20 shrink-0" />
                <span className="bg-gradient-to-r from-emerald-300 via-teal-400 to-emerald-300 bg-clip-text text-transparent">
                  MAINS ACCESS
                </span>
              </div>
            ) : hasPre ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
                <Sparkles size={12} className="text-amber-400 fill-amber-400/20 shrink-0" />
                <span className="bg-gradient-to-r from-amber-300 via-orange-400 to-amber-300 bg-clip-text text-transparent">
                  PRELIMS ACCESS
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-slate-500 border border-slate-200">
                <User size={12} className="text-slate-500 shrink-0" />
                <span>FREE LEARNER</span>
              </div>
            )}
          </div>
          
          <div className="h-6 w-px bg-slate-100 hidden sm:block" />
          
          <button 
            onClick={() => router.push('/profile')}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-900 active:scale-90"
            title={isHindi ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
