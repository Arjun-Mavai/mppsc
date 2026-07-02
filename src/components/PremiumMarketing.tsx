'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🏠 HOME PAGE PRICING — Dynamic from /api/pricing, same DB as /pricing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Admin changes prices in dashboard → reflects here instantly.
// All ₹ amounts are dynamic — no hardcoded prices.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
import { Star, Flame, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { type PricingData, LITE_FEATURES, PRO_FEATURES, PRICING_DEFAULTS } from '@/config/pricing';
import { PricingCard } from '@/components/PricingCard';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { getPricingData } from '@/actions/pricing-actions';

interface PremiumMarketingProps {
  onUnlock: (amount: number) => void;
}

export function PremiumMarketing({ onUnlock }: PremiumMarketingProps) {
  const { language, user } = useSettingsStore();
  const hi = language === 'hi';
  const isLiteUser = user?.planTier === 'lite';
  const router = useRouter();

  // 🔒 Dynamic pricing — Server Action + React Query (no API visible!)
  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing', 'mppsc'],
    queryFn: () => getPricingData('mppsc'),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });

  const p = pricingData?.pricing ?? PRICING_DEFAULTS;

  // Loading Skeleton State
  if (isLoading) {
    if (isLiteUser) {
      return (
        <div className="animate-in fade-in zoom-in-95 relative flex min-h-[500px] flex-col items-center justify-center bg-slate-50 p-4 duration-200 md:p-8">
          <Skeleton className="mb-6 h-6 w-32 rounded-full" />
          <Skeleton className="mb-4 h-10 w-3/4 max-w-sm" />
          <Skeleton className="mb-8 h-4 w-full max-w-md" />
          <Skeleton className="h-[200px] w-full max-w-md rounded-xl" />
          <DialogPrimitive.Close className="absolute top-2 right-2 p-2">
            <X className="h-6 w-6 text-slate-300" />
          </DialogPrimitive.Close>
        </div>
      );
    }

    return (
      <div className="animate-in fade-in zoom-in-95 relative flex flex-col items-center bg-slate-50 px-4 py-6 duration-200 md:p-8">
        <Skeleton className="mb-4 h-10 w-3/4 max-w-lg" />
        <Skeleton className="mb-8 h-4 w-1/2 max-w-md" />

        <div className="mb-8 flex justify-center">
          <Skeleton className="h-8 w-48 rounded-full" />
        </div>

        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <Skeleton className="h-[450px] w-full rounded-2xl" />
          <Skeleton className="h-[450px] w-full rounded-2xl" />
        </div>

        <DialogPrimitive.Close className="absolute top-0 right-0 p-2">
          <X className="h-6 w-6 text-slate-300" />
        </DialogPrimitive.Close>
      </div>
    );
  }

  // Lite user ko Pro upgrade dikhao — dynamic price
  if (isLiteUser) {
    return (
      <div className="relative flex min-h-[500px] flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100/50 to-slate-50 p-4 text-center duration-200 md:p-8">
        <Badge className="mb-4 cursor-default border-amber-200 bg-amber-100 px-3 py-1 text-amber-700 transition-colors hover:bg-amber-200 md:mb-6">
          <Star className="mr-1 h-3 w-3 fill-current" />
          {hi ? 'अपग्रेड उपलब्ध है' : 'UPGRADE AVAILABLE'}
        </Badge>

        <h2 className="font-display mb-2 text-3xl font-extrabold text-slate-900 md:text-4xl">
          {hi ? 'अपनी तैयारी को' : 'Supercharge Your'} <br />
          <span className="bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
            {hi ? 'अगले स्तर पर ले जाएं' : 'Preparation'}
          </span>
        </h2>

        <p className="mx-auto mb-6 max-w-md text-lg leading-relaxed text-slate-500">
          {hi
            ? `प्रो प्लान पर अपग्रेड करें और अनलिमिटेड क्विज़, टेस्ट और स्मार्ट एनालिसिस अनलॉक करें। केवल ₹${p.upgradePrice} में।`
            : `Upgrade to Pro and unlock Unlimited Quizzes, Tests, and Smart Analytics. Just pay the difference.`}
        </p>

        {/* Plan Toggles inside Lock Modal */}
        <div className="mb-6 w-full max-w-xs flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            className="flex-1 rounded-lg py-2 text-center text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm transition-all"
          >
            {hi ? 'प्री' : 'Pre'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/pricing?need=mains#plans')}
            className="flex-1 rounded-lg py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all"
          >
            {hi ? 'मेन्स' : 'Mains'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/pricing?need=combo#plans')}
            className="flex-1 rounded-lg py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all"
          >
            {hi ? 'कॉम्बो' : 'Combo'}
          </button>
        </div>

        <div className="group relative w-full max-w-md">
          <PricingCard
            planType="upgrade"
            pricing={p}
            features={PRO_FEATURES}
            language={language}
            onBuy={() => onUnlock(p.upgradePrice)}
            href="/pricing"
          />
        </div>

        {/* Manual Dismiss - Top Right Icon */}
        <DialogPrimitive.Close className="absolute top-2 right-2 z-50 rounded-full border-2 border-rose-100 bg-white p-2 text-rose-500 shadow-sm transition-all hover:scale-110 hover:bg-rose-50 hover:text-rose-600 active:scale-95">
          <X className="h-6 w-6" strokeWidth={3} />
        </DialogPrimitive.Close>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 relative flex flex-col items-center bg-slate-50 px-4 py-6 text-center duration-200 md:p-8">
      {/* Header */}
      <h2 className="font-display mb-3 text-2xl leading-tight font-black tracking-tighter text-slate-900 uppercase md:text-5xl">
        {hi ? 'तैयारी शुरू नहीं, सही दिशा में शुरू करें।' : "Don't just start preparation, start in the right direction."}
      </h2>
      <p className="mx-auto mb-6 max-w-lg px-4 text-sm font-medium text-slate-500 md:text-lg">
        {hi ? 'सिलेबस की सही दिशा पहचानें और परीक्षा के वास्तविक स्वरूप को समझें।' : 'Identify the correct path of the syllabus and grasp the real form of the exam.'}
      </p>

      {/* Plan Toggles inside Lock Modal */}
      <div className="mb-6 w-full max-w-xs flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        <button
          type="button"
          className="flex-1 rounded-lg py-2 text-center text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white shadow-sm transition-all"
        >
          {hi ? 'प्री' : 'Pre'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/pricing?need=mains#plans')}
          className="flex-1 rounded-lg py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all"
        >
          {hi ? 'मेन्स' : 'Mains'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/pricing?need=combo#plans')}
          className="flex-1 rounded-lg py-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-all"
        >
          {hi ? 'कॉम्बो' : 'Combo'}
        </button>
      </div>

      {/* FOMO — first 100 students with joined count badge */}
      <div className="mb-8 flex justify-center">
        <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-tight">
            {hi ? 'अर्ली बर्ड ऑफर — MPPSC 2027 🚀' : 'Early Bird Offer — MPPSC 2027 🚀'}
          </span>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-6 px-0 md:gap-8 md:px-4">
        <PricingCard
          planType="pro"
          pricing={p}
          features={PRO_FEATURES}
          language={language}
          onBuy={() => onUnlock(p.proPrice)}
          href="/pricing"
          isPopular
        />
      </div>

      {/* Manual Dismiss - Top Right Icon */}
      <DialogPrimitive.Close className="absolute top-2 right-2 z-50 rounded-full border-2 border-rose-100 bg-white p-2 text-rose-500 shadow-sm transition-all hover:scale-110 hover:bg-rose-50 hover:text-rose-600 active:scale-95">
        <X className="h-6 w-6" strokeWidth={3} />
      </DialogPrimitive.Close>
    </div>
  );
}
