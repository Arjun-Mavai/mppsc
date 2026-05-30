'use client';

import React from 'react';
import {
  CheckCircle2,
  Zap,
  Crown,
  Clock,
  Star,
  BadgeCheck,
  LucideIcon,
  Sparkles,
  Target,
  BookOpen,
  BarChart3,
  FileText,
  History,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { type PricingData, calcDiscount, calcMonthly, PlanFeatureWithIcon } from '@/config/pricing';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { trackAction } from '@/lib/analytics/track';
import { ChevronDown } from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Target,
  BookOpen,
  Sparkles,
  FileText,
  Clock,
  Zap,
  BarChart3,
  History,
  CheckCircle2,
  Star,
  BadgeCheck,
};

interface PricingCardProps {
  planType: 'lite' | 'pro' | 'upgrade' | 'mains' | 'combo';
  pricing: PricingData;
  features: PlanFeatureWithIcon[];
  language: 'en' | 'hi';
  onBuy: () => void;
  isPopular?: boolean;
  href?: string;
}

export function PricingCard({
  planType,
  pricing,
  features,
  language,
  onBuy,
  isPopular,
  href,
}: PricingCardProps) {
  const hi = language === 'hi';
  const p = pricing;

  // Calculate dynamic values
  const isLite = planType === 'lite';
  const isPro = planType === 'pro';
  const isUpgrade = planType === 'upgrade';
  const isMains = planType === 'mains';
  const isCombo = planType === 'combo';
  const isProShell = isPro || isUpgrade || isMains || isCombo;

  const price = isLite
    ? p.litePrice
    : isPro
      ? p.proPrice
      : isUpgrade
        ? p.upgradePrice
        : isMains
          ? p.mainsPrice
          : isCombo
            ? p.comboPrice
            : 0;
  const originalPrice = isLite
    ? p.liteOriginalPrice
    : isPro
      ? p.proOriginalPrice
      : isUpgrade
        ? p.upgradeOriginalPrice
        : isMains
          ? p.mainsOriginalPrice
          : isCombo
            ? p.comboOriginalPrice
            : 0;
  const discount = calcDiscount(price, originalPrice);
  const months = isLite
    ? p.liteMonths
    : isPro
      ? p.proMonths
      : isUpgrade
        ? 1
        : isMains
          ? p.mainsMonths
          : isCombo
            ? p.comboMonths
            : 1;
  const monthly = calcMonthly(price, months);
  const validityText = isLite
    ? p.liteValidityText
    : isPro
      ? p.proValidityText
      : isUpgrade
        ? p.proValidityText
        : isMains
          ? p.mainsValidityText
          : isCombo
            ? p.comboValidityText
            : p.proValidityText;

  // Card shell: Pro card look; mains = emerald border; combo = slightly deeper amber border
  const cardClasses = cn(
    'relative flex flex-col h-full transition-all duration-300',
    isLite
      ? 'border border-amber-100 shadow-sm hover:shadow-md'
      : isMains
        ? 'border-2 border-amber-500 shadow-[0_20px_50px_rgba(245,158,11,0.15)] overflow-hidden scale-[1.02] z-10'
        : isCombo
          ? 'border-2 border-amber-600 shadow-[0_20px_50px_rgba(245,158,11,0.15)] overflow-hidden scale-[1.02] z-10'
          : isPro || isUpgrade
            ? 'border-2 border-amber-500 shadow-[0_20px_50px_rgba(245,158,11,0.15)] overflow-hidden scale-[1.02] z-10'
            : 'border border-amber-100 shadow-sm hover:shadow-md'
  );

  const titleIcon = isLite ? (
    <Zap className="h-5 w-5 text-amber-500" />
  ) : isMains ? (
    <BookOpen className="h-5 w-5 text-amber-600" />
  ) : isCombo || isPro ? (
    <Crown className="h-5 w-5 text-amber-600" />
  ) : (
    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
  );
  const title = isLite
    ? 'Lite'
    : isPro
      ? 'MPPSC Prelims Mastery'
      : isMains
        ? hi
          ? 'PYQ-फोकस्ड सिलेबस गहरी समझ के लिए'
          : 'PYQ-focused syllabus for deep understanding'
        : isCombo
          ? 'MPPSC Complete Preparation System'
          : hi
            ? 'प्रो में अपग्रेड'
            : 'Upgrade to Pro';
  const subtitle = isLite
    ? hi
      ? 'तैयारी का पहला मजबूत कदम'
      : 'The perfect first step'
    : isPro
      ? hi
        ? 'तैयारी में भटकाव कम करें। परीक्षा की वास्तविक मांग समझें।'
        : 'Reduce deviation in preparation. Grasp the real demand of the exam.'
      : isMains
        ? hi
          ? 'क्या पढ़ना है, कितना पढ़ना है और उत्तर में कैसे उपयोग करना है।'
          : 'What to study, how much to study, and how to use it in answers.'
        : isCombo
          ? hi
            ? 'Prelims से Mains तक एक ही तैयारी प्रणाली'
            : 'Prelims to Mains, one unified preparation system'
          : hi
            ? 'लाइट से प्रो — सिर्फ़ अंतर भरें'
            : 'Lite → Pro — Just pay the difference';

  const featureIconTone = isLite
    ? 'text-amber-500'
    : 'text-amber-600';

  return (
    <div className="group relative h-full">
      {(isPro || isUpgrade || isCombo) && (
        <div className="absolute -inset-0.5 animate-pulse rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-20 blur-md" />
      )}
      {isMains && (
        <div className="absolute -inset-0.5 animate-pulse rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 opacity-20 blur-md" />
      )}

      <Card className={cn(cardClasses, 'bg-white')}>
        {/* Most Popular Badge */}
        {isPopular && (isPro || isCombo) && (
          <div className="absolute top-0 right-0 z-20 rounded-bl-lg bg-amber-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
            {hi ? 'सबसे लोकप्रिय' : 'MOST POPULAR'}
          </div>
        )}
        {isUpgrade && (
          <div className="absolute top-0 right-0 z-20 rounded-bl-lg bg-orange-600 px-4 py-1.5 text-[10px] font-black tracking-widest text-white uppercase">
            {hi ? 'खास ऑफर' : 'SPECIAL OFFER'}
          </div>
        )}

        <CardContent className="relative z-10 flex h-full flex-col p-6 md:p-8">
          {/* Header Block */}
          <div className="mb-5">
            {isPro && (
              <div className="mb-3 rounded-xl bg-red-50/70 border border-red-200/50 p-3 text-xs font-semibold text-red-800 leading-relaxed shadow-sm">
                {hi 
                  ? '⚠️ अधिकांश छात्र सब कुछ पढ़ने की कोशिश करते हैं। सफल अभ्यर्थी प्राथमिकताएँ तय करते हैं।' 
                  : '⚠️ Most students try to read everything. Successful candidates set priorities.'}
              </div>
            )}
            {isMains && (
              <div className="mb-3 rounded-xl bg-amber-50/70 border border-amber-200/50 p-3 text-xs font-semibold text-amber-900 leading-relaxed shadow-sm">
                {hi 
                  ? '💡 अधिकांश छात्र उत्तर याद करते हैं। सफल अभ्यर्थी प्रश्न की मांग समझते हैं।' 
                  : '💡 Most students memorize answers. Successful candidates understand the question\'s demand.'}
              </div>
            )}
            <div className="mb-1 flex items-center gap-2">
              {titleIcon}
              <h3
                className={cn(
                  'text-xl font-bold',
                  isPro || isUpgrade || isCombo || isMains ? 'text-amber-900' : 'text-slate-900'
                )}
              >
                {title}
              </h3>
              {isLite && (
                <Badge className="border-orange-200 bg-orange-100 px-2 py-0.5 text-[10px] font-black text-orange-700">
                  LIMITED
                </Badge>
              )}
            </div>
            <p
              className={cn(
                'text-sm font-medium',
                isPro || isUpgrade || isCombo || isMains
                  ? 'text-amber-700/80'
                  : 'text-slate-500'
              )}
            >
              {subtitle}
            </p>
          </div>

          {/* Price Block */}
          <div className="mb-5">
            { (isPro || isMains || isCombo) ? (
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                  🔥 Founding Batch Price
                </span>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-4xl font-black tracking-tighter text-slate-900">₹{price}</span>
                  <span className="relative inline-flex items-center">
                    <span className="absolute inset-[-2] rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-[1px]" />
                    <span className="relative rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                      {hi
                        ? `लगभग ₹${Math.round(monthly)}/माह`
                        : `~₹${Math.round(monthly)}/month`}
                    </span>
                  </span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-slate-400 line-through">₹{originalPrice}</span>
                  <span className="text-4xl font-black tracking-tighter text-slate-900">₹{price}</span>
                  {isUpgrade && (
                    <Badge className="ml-2 border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                      {hi ? `बचत ₹${originalPrice - price}` : `SAVE ₹${originalPrice - price}`}
                    </Badge>
                  )}
                </div>

                {!isUpgrade && (
                  <div className="mt-2 flex items-center gap-3">
                    <Badge className="border-emerald-200 bg-emerald-50 text-xs font-bold text-emerald-700">
                      {discount}% OFF
                    </Badge>
                    <span className="relative inline-flex items-center">
                      <span className="absolute inset-[-2] rounded-full bg-gradient-to-r from-red-500 via-pink-500 to-green-500 p-[1.5px]" />
                      <span className="relative rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-slate-800">
                        {hi ? `लगभग ₹${monthly}/mo` : `Effective ₹${monthly}/mo`}
                      </span>
                    </span>
                  </div>
                )}
              </>
            )}

            <p className="mt-2.5 flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="h-3 w-3" />
              {hi ? `एक बार भुगतान • ${validityText}` : `One-time payment • ${validityText}`}
            </p>
          </div>

          <div className="mb-5 h-px w-full bg-slate-100" />

          {/* Features List */}
          <ul className="mb-8 flex-1 space-y-3.5 text-left">
            {features.map((f, i) => (
              <FeatureItem 
                key={f.en} 
                f={f} 
                i={i} 
                isLite={isLite} 
                isProShell={isProShell} 
                isUpgrade={isUpgrade} 
                featureIconTone={featureIconTone} 
                language={language}
              />
            ))}
            {/* Validity Item if not in features already */}
            {/* {!isUpgrade && (
              <li
                className={cn(
                  'flex items-start gap-3 text-sm font-medium',
                  isProShell ? 'text-slate-900' : 'text-slate-700'
                )}
              >
                <Clock
                  className={cn(
                    'mt-0.5 h-4.5 w-4.5 shrink-0',
                    isLite ? 'text-blue-500' : featureIconTone
                  )}
                />
                <span>
                  {hi ? (isLite ? '6 महीने तक वैध' : validityText) : validityText}
                </span>
              </li>
            )} */}
          </ul>

          {/* Sample Material Link Above Button */}
          {isPro && (
            <div className="mb-3.5 text-center">
              <Link 
                href="/open/2026-mppsc-prelims" 
                onClick={() => trackAction('🔍 Clicked Prelims Sample Material Link from PricingCard')}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors underline decoration-slate-300 hover:decoration-amber-500 underline-offset-4"
              >
                {hi ? '🔓 खरीदने से पहले नमूना सामग्री देखें' : '🔓 View Sample Material Before Buying'}
              </Link>
            </div>
          )}
          {isMains && (
            <div className="mb-3.5 text-center">
              <Link 
                href="/open/mains-demo" 
                onClick={() => trackAction('🔍 Clicked Mains Sample Answers Link from PricingCard')}
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-amber-700 transition-colors underline decoration-slate-300 hover:decoration-amber-500 underline-offset-4"
              >
                {hi ? '🔓 खरीदने से पहले नमूना उत्तर देखें' : '🔓 View Sample Answers Before Buying'}
              </Link>
            </div>
          )}

          {/* Action Button */}
          {href ? (
            <motion.div whileTap={{ scale: 0.96 }} className="w-full">
              <Button
                asChild
                variant={isLite ? 'outline' : 'default'}
                className={cn(
                  'h-12 w-full rounded-xl font-bold transition-all',
                  isLite &&
                    'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900',
                  (isProShell && !isMains) &&
                    'bg-slate-950 text-white shadow-lg shadow-amber-900/20 hover:bg-black border border-amber-500/30',
                  isMains &&
                    'bg-slate-950 text-white shadow-lg shadow-amber-900/20 hover:bg-black border border-amber-500/30'
                )}
              >
                <Link href={href} prefetch={true} onClick={onBuy}>
                  {isLite
                    ? hi
                      ? 'लाइट के साथ शुरुआत करें'
                      : 'Start with Lite Access'
                    : isUpgrade
                      ? hi
                        ? 'प्रो में अपग्रेड करें'
                        : 'Upgrade to Prelims Mastery'
                      : isMains
                        ? hi
                          ? '✍️ उत्तर लेखन प्रणाली शुरू करें'
                          : '✍️ Start Answer Writing'
                        : isCombo
                          ? hi
                            ? 'MPPSC Complete Access Unlock करें'
                            : 'Unlock MPPSC Complete Access'
                          : hi
                            ? '🚀 तैयारी शुरू करें'
                            : '🚀 Start Preparation'}
                </Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div whileTap={{ scale: 0.96 }} className="w-full">
              <Button
                onClick={onBuy}
                variant={isLite ? 'outline' : 'default'}
                className={cn(
                  'h-12 w-full rounded-xl font-bold transition-all',
                  isLite &&
                    'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900',
                  (isProShell && !isMains) &&
                    'bg-slate-950 text-white shadow-lg shadow-amber-900/20 hover:bg-black border border-amber-500/30',
                  isMains &&
                    'bg-slate-950 text-white shadow-lg shadow-amber-900/20 hover:bg-black border border-amber-500/30'
                )}
              >
                {isLite
                  ? hi
                    ? 'लाइट के साथ शुरुआत करें'
                    : 'Start with Lite Access'
                  : isUpgrade
                    ? hi
                      ? 'प्रो में अपग्रेड करें'
                      : 'Upgrade to Prelims Mastery'
                    : isMains
                      ? hi
                        ? '✍️ उत्तर लेखन प्रणाली शुरू करें'
                        : '✍️ Start Answer Writing'
                      : isCombo
                        ? hi
                          ? 'MPPSC Complete Access Unlock करें'
                          : 'Unlock MPPSC Complete Access'
                        : hi
                          ? '🚀 तैयारी शुरू करें'
                          : '🚀 Start Preparation'}
              </Button>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureItem({ 
  f, 
  i, 
  isLite, 
  isProShell, 
  isUpgrade, 
  featureIconTone, 
  language 
}: { 
  f: PlanFeatureWithIcon; 
  i: number; 
  isLite: boolean; 
  isProShell: boolean; 
  isUpgrade: boolean; 
  featureIconTone: string; 
  language: 'en' | 'hi';
}) {
  const [expanded, setExpanded] = React.useState(false);
  const hi = language === 'hi';
  const text = hi ? f.hi : f.en;
  
  /**
   * Split logic: 
   * We look for " — " (em-dash with space) or " - " (hyphen with space).
   * This avoids splitting hyphenated words like "Double-Style".
   */
  const separatorRegex = /\s+[\u2014-]\s+/;
  const parts = text.split(separatorRegex);
  const hasDetails = parts.length > 1;

  let headline = parts[0] || '';
  let details = parts.slice(1).join(' — ');

  /**
   * User Exception: If we have multiple dashes (e.g. Double-Style - Variations — Detail),
   * we might want to include the first dash in the headline if it was a false positive.
   * But with the improved regex above, "Double-Style" won't split.
   * However, the user specifically asked: "agar two dash h to fisrt skip karna h".
   */
  if (parts.length > 2) {
    headline = `${parts[0]} — ${parts[1]}`;
    details = parts.slice(2).join(' — ');
  }

  const IconComp = ICON_MAP[f.icon || ''] || CheckCircle2;

  return (
    <li
      className={cn(
        'group/feat flex flex-col gap-1',
        hasDetails && 'cursor-pointer select-none'
      )}
      onClick={() => hasDetails && setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3">
        <IconComp
          className={cn(
            'mt-0.5 h-4 w-4 shrink-0 transition-transform duration-300',
            isLite ? 'text-amber-500' : featureIconTone,
            expanded && 'scale-110'
          )}
        />
        <div className="flex flex-1 flex-col gap-0.5 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={cn(
              'text-[13.5px] font-semibold leading-snug',
              isProShell ? 'text-slate-900' : 'text-slate-700',
              isProShell && !isUpgrade && i === 0 && 'font-bold'
            )}>
              {headline}
            </span>
            {hasDetails && (
              <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover/feat:opacity-100">
                {!expanded && (
                  <motion.div 
                    animate={{ y: [0, -2, 0] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="flex items-center gap-1"
                  >
                    <span className="text-[9px] font-bold uppercase tracking-tight text-slate-400">
                      {hi ? 'देखें' : 'More'}
                    </span>
                    <Sparkles className="h-2.5 w-2.5 text-amber-500" />
                  </motion.div>
                )}
                <ChevronDown className={cn(
                  'h-3.5 w-3.5 text-slate-400 transition-transform duration-300',
                  expanded && 'rotate-180'
                )} />
              </div>
            )}
          </div>
          
          <AnimatePresence>
            {expanded && hasDetails && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="pb-1 text-[12.5px] font-medium leading-relaxed text-slate-500/90 italic">
                  {details}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </li>
  );
}
