'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Mail,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { getPricingData } from '@/actions/pricing-actions';
import {
  DEFAULT_MPPSC_PRODUCT_COPY,
  paymentLabelToMppscSegment,
} from '@/config/mppsc-product-copy';
import { useSettingsStore } from '@/store/useSettingsStore';
import { cn } from '@/lib/utils';
import { safeGetSessionStorage, safeRemoveSessionStorage } from '@/lib/safe-session-storage';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const plan = searchParams.get('plan');
  const skuParam = searchParams.get('sku');
  const email = searchParams.get('email');
  const name = searchParams.get('name') || '';
  const type = searchParams.get('type'); // 'upgrade' or null
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const { data: pricingPayload } = useQuery({
    queryKey: ['pricing', 'mppsc'],
    queryFn: async () => await getPricingData('mppsc'),
    staleTime: 5 * 60 * 1000,
  });

  const copyPack = pricingPayload?.mppscProductCopy ?? DEFAULT_MPPSC_PRODUCT_COPY;

  const inferSku =
    (skuParam && ['lite', 'pro', 'upgrade', 'mains', 'combo'].includes(skuParam) && skuParam) ||
    (type === 'upgrade' ? 'upgrade' : '') ||
    (plan === 'lite' ? 'lite' : plan === 'pro' ? 'pro' : plan === 'free' ? 'mains' : 'pro');

  const seg = paymentLabelToMppscSegment(inferSku);
  const block = copyPack[seg];

  // 🔒 Step 1: Security Redirection Check
  useEffect(() => {
    const isFreshPayment =
      typeof window !== 'undefined' && safeGetSessionStorage('payment_success_fresh');
    const allowedSku =
      skuParam && ['lite', 'pro', 'upgrade', 'mains', 'combo'].includes(skuParam);
    const hasValidParams =
      Boolean(email) &&
      (Boolean(plan && plan !== 'free') || Boolean(type === 'upgrade') || Boolean(allowedSku));

    if (!isFreshPayment && !hasValidParams) {
      console.warn('Unauthorized access to thank-you page or missing data');
      router.replace('/');
      return;
    }

    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') {
        safeRemoveSessionStorage('payment_success_fresh');
      }
    }, 1000);

    if (type === 'upgrade') {
      const upgradeTimer = setTimeout(() => {
        router.push('/syllabus/quiz/topic');
      }, 3500);
      return () => {
        clearTimeout(timer);
        clearTimeout(upgradeTimer);
      };
    }

    return () => clearTimeout(timer);
  }, [email, plan, skuParam, type, router]);

  const firstName = name.split(' ')[0] || 'Student';
  const isUpgrade = type === 'upgrade';

  const planColor =
    seg === 'mains' ? 'text-emerald-700' : seg === 'combo' ? 'text-amber-700' : 'text-amber-700';
  const planBg =
    seg === 'mains'
      ? 'bg-emerald-50 border-emerald-200'
      : seg === 'combo'
        ? 'bg-amber-50 border-amber-200'
        : 'bg-amber-50 border-amber-200';

  const planBadge = hi ? block.thankYouBadgeHi : block.thankYouBadgeEn;
  const headLine = isUpgrade ? (hi ? 'अपग्रेड सफल!' : 'Upgrade Successful!') : hi ? block.thankYouHeadlineHi : block.thankYouHeadlineEn;
  const subLine = isUpgrade
    ? hi
      ? 'आपके टेस्ट सीरीज़ पर वापस भेज रहे हैं…'
      : 'Redirecting to your dashboard...'
    : hi
      ? block.thankYouSubtitleHi
      : block.thankYouSubtitleEn;

  const featureLines = hi ? block.thankYouFeatureLinesHi : block.thankYouFeatureLinesEn;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 px-6 py-10 text-center text-white">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-8 h-16 w-16 rounded-full border-2 border-white" />
              <div className="absolute right-12 bottom-2 h-10 w-10 rounded-full border-2 border-white" />
              <div className="absolute top-8 right-6 h-6 w-6 rounded-full bg-white" />
            </div>

            <div className="relative">
              <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30 backdrop-blur-sm">
                <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{headLine}</h1>
              <p className="mt-1 text-sm text-emerald-100">
                {isUpgrade
                  ? hi
                    ? 'टेस्ट सीरीज़ पर जा रहे हैं…'
                    : 'Taking you to practice'
                  : hi
                    ? 'लेन-देन सत्यापित'
                    : 'Transaction verified & secured'}
              </p>
            </div>
          </div>

          <div className="space-y-5 px-6 py-6">
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900">
                {isUpgrade
                  ? hi
                    ? `प्रो में स्वागत, ${firstName}!`
                    : `Welcome to Pro, ${firstName}!`
                  : hi
                    ? `धन्यवाद, ${firstName}!`
                    : `Thank you, ${firstName}!`}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                <span className={cn('font-bold', planColor)}>{planBadge}</span>
                {!isUpgrade ? (hi ? ' — सक्रिय।' : ' is live.') : null}
              </p>
              <p className="mt-2 text-sm text-slate-600">{subLine}</p>
              {isUpgrade && (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  {hi ? 'टेस्ट सीरीज़ पर…' : 'Redirecting to Test Series...'}
                </div>
              )}
            </div>

            {!isUpgrade && (
              <div className="space-y-3 rounded-xl bg-slate-900 p-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {hi ? 'ईमेल चेक करें' : 'Check Your Email'}
                    </p>
                    <p className="text-xs text-slate-300">
                      {hi ? 'पासवर्ड सेट करके आगे बढ़ें' : 'Set your password to continue'}
                    </p>
                  </div>
                </div>
                {email && (
                  <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                    <span className="text-xs text-slate-400">{hi ? 'भेजा गया:' : 'Sent to:'}</span>
                    <span className="truncate text-sm font-medium text-white">{email}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Shield className="h-3 w-3" />
                  <span>
                    {hi
                      ? 'लिंक 1 घंटे में समाप्त • स्पैम फ़ोल्डर भी देखें'
                      : 'Link expires in 1 hour • Check spam folder too'}
                  </span>
                </div>
              </div>
            )}

            {!isUpgrade && (
              <div className="space-y-2">
                <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                  {hi ? 'अगले कदम' : 'Next Steps'}
                </p>
                <div className="space-y-2.5">
                  {(hi
                    ? [
                        { step: '1', text: 'हमारा ईमेल खोलें' },
                        { step: '2', text: '"Set Your Password" पर क्लिक करें' },
                        { step: '3', text: 'मज़बूत पासवर्ड बनाएँ' },
                        { step: '4', text: 'लॉगिन कर अभ्यास शुरू करें' },
                      ]
                    : [
                        { step: '1', text: 'Open the email we just sent' },
                        { step: '2', text: 'Click "Set Your Password"' },
                        { step: '3', text: 'Create a strong password' },
                        { step: '4', text: 'Login & start practicing!' },
                      ]
                  ).map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                        {item.step}
                      </div>
                      <span className="text-sm text-slate-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reinforce Product Understanding / Expectation Setting */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-slate-800">
              <p className="mb-1 text-xs font-bold text-amber-900">
                {hi ? '📌 कृपया याद रखें (Important Recall)' : '📌 Please Remember'}
              </p>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {hi ? (
                  <>
                    यह प्लेटफ़ॉर्म <strong>स्मार्ट लर्निंग, PYQs, अभ्यास और वैल्यू एडिशन</strong> पर केंद्रित है।
                    यह पारंपरिक <strong>PDF नोट्स या किताबों की लाइब्रेरी नहीं है</strong>।
                  </>
                ) : (
                  <>
                    This platform focuses on <strong>Smart Learning, PYQs, Practice, and Value Addition</strong>.
                    It is <strong>NOT a PDF notes/printed book library</strong>.
                  </>
                )}
              </p>
            </div>

            <div className={`rounded-xl border p-4 ${planBg}`}>
              <p className="mb-3 text-xs font-bold tracking-wider text-slate-500 uppercase">
                {hi ? 'आपको क्या मिला' : 'What you unlocked'}
              </p>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {featureLines.map((text) => (
                  <div key={text} className="flex items-start gap-2">
                    <CheckCircle2 className={cn('mt-0.5 h-3.5 w-3.5 shrink-0', planColor)} />
                    <span className="text-xs leading-tight text-slate-700">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          {isUpgrade ? (
            <Button
              asChild
              className="h-11 w-full bg-slate-900 font-semibold text-white hover:bg-slate-800"
            >
              <Link href="/syllabus/quiz/topic">
                {hi ? 'अभ्यास शुरू करें' : 'Start Practicing'}{' '}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="outline"
                className="h-11 flex-1 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Link href="/">{hi ? 'होम' : 'Go to Home'}</Link>
              </Button>
              <Button
                asChild
                className="h-11 flex-1 bg-slate-900 font-semibold text-white hover:bg-slate-800"
              >
                <Link href="/login">
                  {hi ? 'लॉगिन' : 'Login Now'} <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>

        <p className="px-4 text-center text-xs text-slate-400">
          &ldquo;सफलता उन्हें मिलती है जो मेहनत करते हैं&rdquo; — Your MPPSC journey starts now! 🚀
        </p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-100 border-t-emerald-500" />
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
}
