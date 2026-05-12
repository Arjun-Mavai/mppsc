'use client';

/**
 * Mains vault pitch inside SyllabusLockMainsModal — mirrors PremiumMarketing shell,
 * prices + bullets from `getPricingData('mppsc')` (DB + merged defaults).
 */
import { Users, Flame, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettingsStore } from '@/store/useSettingsStore';
import { PRICING_DEFAULTS, type PlanFeatureWithIcon } from '@/config/pricing';
import { PricingCard } from '@/components/PricingCard';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { useQuery } from '@tanstack/react-query';
import { getPricingData } from '@/actions/pricing-actions';
import { DEFAULT_MPPSC_PRODUCT_COPY } from '@/config/mppsc-product-copy';

interface MainsPremiumMarketingProps {
  onClose?: () => void;
}

export function MainsPremiumMarketing({ onClose }: MainsPremiumMarketingProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const { data: pricingData, isLoading } = useQuery({
    queryKey: ['pricing', 'mppsc'],
    queryFn: async () => await getPricingData('mppsc'),
    staleTime: 5 * 60 * 1000,
  });

  const p = pricingData?.pricing ?? PRICING_DEFAULTS;
  const mppscCopy = pricingData?.mppscProductCopy ?? DEFAULT_MPPSC_PRODUCT_COPY;

  const mainsFeatures: PlanFeatureWithIcon[] = mppscCopy.mains.bulletsEn.map((en, i) => ({
    en,
    hi: mppscCopy.mains.bulletsHi[i] ?? en,
    icon: 'Target',
  }));

  if (isLoading) {
    return (
      <div className="relative flex min-h-[420px] flex-col items-center bg-slate-50 px-4 py-8 md:p-10">
        <Skeleton className="mb-6 h-9 w-3/4 max-w-md rounded-lg" />
        <Skeleton className="mb-10 h-4 w-2/3 max-w-sm rounded" />
        <Skeleton className="h-[440px] w-full max-w-md rounded-2xl" />
        <DialogPrimitive.Close className="absolute top-2 right-2 z-50 rounded-full border-2 border-emerald-100 bg-white p-2 text-emerald-600 shadow-sm transition-all hover:bg-emerald-50">
          <X className="h-6 w-6" strokeWidth={3} />
        </DialogPrimitive.Close>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in zoom-in-95 relative flex flex-col items-center bg-slate-50 px-4 py-6 text-center duration-200 md:p-10">
      <Badge className="mb-4 border-emerald-200 bg-emerald-50 px-4 py-1.5 text-emerald-800 md:mb-5">
        {hi ? 'MPPSC मेंस लाइब्रेरी' : 'MPPSC Mains Library'}
      </Badge>

      <h2 className="font-display mb-3 max-w-xl text-2xl leading-tight font-black tracking-tight text-slate-900 md:text-4xl">
        {hi ? (
          <>
            <span className="text-emerald-700">PYQ-फोकस्ड</span> सिलेबस<br />
            गहरी समझ के लिए
          </>
        ) : (
          <>
            <span className="text-emerald-700">PYQ-focused</span> Syllabus<br />
            for Deep Understanding
          </>
        )}
      </h2>
      <p className="mx-auto mb-8 max-w-lg px-2 text-sm font-medium text-slate-600 md:text-base">
        {hi
          ? 'सिलेबस के प्रत्येक टॉपिक पर 2020-2024 (5 वर्ष) के संपूर्ण आधिकारिक मुख्य परीक्षा (Mains) PYQs के विस्तृत विश्लेषणात्मक व द्विभाषी मॉडल उत्तर।'
          : 'Complete official Mains PYQs from 2020 to 2024 (5 years) mapped to every syllabus topic with deep analytical bilingual model answers.'}
      </p>

      <div className="mb-8 flex justify-center">
        <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
          <Flame className="h-3.5 w-3.5 text-red-500" />
          <span className="text-xs font-semibold text-amber-800">
            {hi ? p.urgencyTextHi : p.urgencyText}
          </span>
          <Badge className="h-5 border-emerald-200 bg-emerald-100 px-1.5 py-0 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100">
            <Users className="mr-0.5 h-2.5 w-2.5" />
            {p.studentsBought ?? PRICING_DEFAULTS.studentsBought} joined
          </Badge>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md px-0 md:px-4">
        <PricingCard
          planType="mains"
          pricing={p}
          features={mainsFeatures}
          language={language}
          onBuy={() => onClose?.()}
          href="/pricing?need=mains"
        />
        <p className="mt-4 text-center text-xs text-slate-500">
          {hi ? (
            <>
              प्री + मेंस एक साथ?{' '}
              <a href="/pricing" onClick={() => onClose?.()} className="font-bold text-emerald-700 underline underline-offset-2">
                प्राइसिंग पर कॉम्बो देखें
              </a>
            </>
          ) : (
            <>
              Want Pre + Mains together?{' '}
              <a href="/pricing" onClick={() => onClose?.()} className="font-bold text-emerald-700 underline underline-offset-2">
                See the combo on pricing
              </a>
            </>
          )}
        </p>
      </div>

      <DialogPrimitive.Close className="absolute top-2 right-2 z-50 rounded-full border-2 border-emerald-100 bg-white p-2 text-emerald-600 shadow-sm transition-all hover:scale-110 hover:bg-emerald-50 active:scale-95">
        <X className="h-6 w-6" strokeWidth={3} />
      </DialogPrimitive.Close>
    </div>
  );
}
