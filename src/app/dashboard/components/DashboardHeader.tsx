'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
  user: {
    name: string | null;
    planTier: string | null;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { language } = useSettingsStore();
  const isHindi = language === 'hi';
  const router = useRouter();

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
          {user.planTier === 'pro' ? (
            <div className="group relative flex items-center gap-2 overflow-hidden rounded-xl border border-amber-200 p-[1px] shadow-sm">
              <div className="absolute inset-0 animate-[shimmer_3s_linear_infinite] bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
              <div className="relative flex items-center gap-2 rounded-[11px] bg-white px-3 py-1.5 text-[8px] font-black tracking-[0.2em] text-amber-700 uppercase">
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-50" />
                PRO
              </div>
            </div>
          ) : (
            <Badge variant="outline" className="h-7 rounded-lg border-slate-200 bg-slate-50 text-[8px] font-black tracking-widest text-slate-500 uppercase">
              {user.planTier || 'Free'}
            </Badge>
          )}
          
          <div className="h-6 w-px bg-slate-100" />
          
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
