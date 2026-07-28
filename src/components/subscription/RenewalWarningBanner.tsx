'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚠️ RENEWAL WARNING BANNER — Top fixed persistent alert
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Shows up strictly on /dashboard and /profile when user has <= 10 days remaining.
// Clicking "Renew Now" redirects to the /renew page.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

interface RenewalWarningBannerProps {
  daysLeft: number;
  userEmail?: string;
}

export function RenewalWarningBanner({ daysLeft }: RenewalWarningBannerProps) {
  const pathname = usePathname();
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  // 1. Strictly show ONLY on /dashboard and /profile pages (and sub-routes)
  const isTargetRoute = pathname?.startsWith('/dashboard') || pathname?.startsWith('/profile');
  if (!isTargetRoute) {
    return null;
  }

  // 2. Only active when 1 <= daysLeft <= 10
  if (daysLeft > 10 || daysLeft <= 0) {
    return null;
  }

  return (
    <div className="relative z-40 bg-slate-950/95 text-slate-100 border-b border-amber-500/30 px-4 py-2.5 shadow-xl backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs md:text-sm font-semibold">
        
        {/* Alert Message */}
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Clock size={13} className="animate-pulse text-amber-400" />
          </div>
          <p className="text-[11px] sm:text-sm text-slate-200 leading-tight whitespace-normal sm:truncate">
            {hi ? (
              <>
                <span className="font-extrabold text-amber-400">विशेष ऑफर:</span> प्लान <span className="font-extrabold text-white underline underline-offset-2 decoration-amber-400/60">{daysLeft} {daysLeft === 1 ? 'दिन' : 'दिनों'}</span> में समाप्त हो रहा है!
              </>
            ) : (
              <>
                <span className="font-extrabold text-amber-400">Special Offer:</span> Plan expires in <span className="font-extrabold text-white underline underline-offset-2 decoration-amber-400/60">{daysLeft} {daysLeft === 1 ? 'day' : 'days'}</span>!
              </>
            )}
          </p>
        </div>

        {/* Action Link to /renew */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/renew"
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 px-4 py-1 text-xs font-black transition-all hover:scale-105 active:scale-95 shadow-md shadow-amber-500/20 cursor-pointer"
          >
            <span>{hi ? 'अभी रिन्यू करें' : 'Renew Now'}</span>
            <ArrowRight size={13} />
          </Link>

          {/* Close button commented out for persistent urgency
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            title="Dismiss"
          >
            <X size={16} />
          </button>
          */}
        </div>
      </div>
    </div>
  );
}

