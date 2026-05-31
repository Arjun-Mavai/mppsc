'use client';

import React from 'react';
import { Zap, Crown, Clock, Users, Flame, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  type PricingData,
  PRICING_DEFAULTS,
  LITE_FEATURES,
  PRO_FEATURES,
  calcDiscount,
  calcMonthly,
} from '@/config/pricing';
import { PricingCard } from '@/components/PricingCard';
import { useQuery } from '@tanstack/react-query';
import { getPricingData } from '@/actions/pricing-actions';

export function PricingSection() {
  const { user: globalUser, language } = useSettingsStore();
  const router = useRouter();
  const hi = language === 'hi';

  // 🔒 Server Action + React Query (shared cache with /pricing page!)
  const { data: pricingData } = useQuery({
    queryKey: ['pricing', 'mppsc'],
    queryFn: () => getPricingData('mppsc'),
    staleTime: 5 * 60 * 1000,
  });

  if (globalUser?.isSubscribed) return null;

  const p = pricingData?.pricing ?? PRICING_DEFAULTS;

  const liteDiscount = calcDiscount(p.litePrice, p.liteOriginalPrice);
  const proDiscount = calcDiscount(p.proPrice, p.proOriginalPrice);
  const liteMonthly = calcMonthly(p.litePrice, p.liteMonths);
  const proMonthly = calcMonthly(p.proPrice, p.proMonths);

  return (
    <section id="pricing" className="relative bg-slate-50 py-12 sm:py-20">
      <div className="absolute top-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <h2 className="mb-2 text-center text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {hi ? 'अपना प्लान चुनें' : 'Choose Your Plan'}
        </h2>
        <p className="mb-4 text-center text-sm font-medium text-slate-500">
          {hi ? 'परीक्षा तक पूरी तैयारी' : 'Complete preparation until the exam'}
        </p>

        {/* FOMO badge - "first 100 students" with joined count */}
        <div className="mb-8 flex justify-center">
          <div className="relative inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-tight">
              {hi ? 'अर्ली बर्ड ऑफर — MPPSC 2027 🚀' : 'Early Bird Offer — MPPSC 2027 🚀'}
            </span>
          </div>
        </div>

        {/* Pricing Cards — same as /pricing page */}
        <div className="mx-auto grid max-w-md grid-cols-1 gap-5">
          <PricingCard
            planType="pro"
            pricing={p}
            features={PRO_FEATURES}
            language={language}
            onBuy={() => router.push('/pricing')}
            href="/pricing"
            isPopular
          />
        </div>

        {/* Trust signals */}
        <div className="mt-8 flex items-center justify-center gap-2">
          <Shield className="h-4 w-4 text-slate-400" />
          <p className="text-xs font-medium text-slate-400">
            {hi
              ? 'सुरक्षित भुगतान • कोई ऑटो-रिन्यूअल नहीं • RazorPay से एक्टिवेट'
              : 'Secure Payment • No Auto-Renewal • Activate via RazorPay'}
          </p>
        </div>
      </div>
    </section>
  );
}
