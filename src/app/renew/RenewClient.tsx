'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚡ RENEWAL CLIENT PAGE — Re-uses PaymentModal & PricingCard
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Clean, minimal UI specifically built for plan renewals.
// Shows explicit expiry state and 1-click renewal triggering Razorpay.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState } from 'react';
import { RefreshCw, Shield, Sparkles, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { PaymentModal } from '@/components/payment/PaymentModal';
import { PricingCard } from '@/components/PricingCard';
import { PRO_FEATURES } from '@/config/pricing';
import { useSettingsStore } from '@/store/useSettingsStore';
import { getPlanDisplayName } from '@/lib/access-grants';
import type { SubscriptionStatus } from '@/lib/subscription-status';

interface RenewClientProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
    planTier?: string | null;
    accessExpiresAt?: Date | number | string | null;
  } | null;
  statusInfo: SubscriptionStatus;
  pricing: any;
}

export function RenewClient({ user, statusInfo, pricing }: RenewClientProps) {
  const { language } = useSettingsStore();
  const hi = language === 'hi';

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<{
    planType: 'lite' | 'pro' | 'upgrade' | 'mains' | 'combo';
    name: string;
  }>({
    planType: 'combo',
    name: `Pre + Mains Combo Special Renewal — ₹499`,
  });

  // Active Tab state — DEFAULT IS ALWAYS COMBO ('combo')
  const [activeTab, setActiveTab] = useState<'combo' | 'pro' | 'mains'>('combo');

  const comboPrice = pricing.renewalComboPrice || pricing.comboPrice || 499;
  const comboOriginalPrice = pricing.renewalComboOriginalPrice || 599;
  const proPrice = pricing.renewalProPrice || pricing.proPrice || 299;
  const proOriginalPrice = pricing.renewalProOriginalPrice || 999;
  const mainsPrice = pricing.renewalMainsPrice || 399;
  const mainsOriginalPrice = pricing.renewalMainsOriginalPrice || 1499;

  const handleRenewClick = (planType: 'pro' | 'mains' | 'combo') => {
    let name = `Pro Plan Renewal — ₹${proPrice}`;
    if (planType === 'combo') name = `Pre + Mains Combo Special Renewal — ₹${comboPrice}`;
    if (planType === 'mains') name = `Mains Plan Renewal — ₹${mainsPrice}`;

    setSelectedPlan({ planType, name });
    setShowPaymentModal(true);
  };

  const isExpired = statusInfo.isExpired;

  return (
    <div className="min-h-screen bg-[#fffdfa] font-sans pt-24 pb-20 selection:bg-amber-100 selection:text-amber-900">
      <div className="mx-auto max-w-4xl px-4">
        
        {/* ── Status Header Card ──────────────────────────────── */}
        <div className="mb-10 overflow-hidden rounded-3xl border border-amber-200/70 bg-gradient-to-b from-amber-50/90 via-white to-amber-50/20 p-6 md:p-8 shadow-xl shadow-amber-500/5 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-black text-amber-800 uppercase tracking-wider border border-amber-500/20">
                {isExpired ? (
                  <>
                    <AlertTriangle size={14} className="text-amber-600 animate-pulse" />
                    {hi ? 'एक्सेस समाप्त (Access Expired)' : 'Access Expired'}
                  </>
                ) : (
                  <>
                    <Clock size={14} className="text-amber-600" />
                    {hi ? `विशेष रिन्यूअल केंद्र (${statusInfo.daysLeft} दिन शेष)` : `Special Renewal Hub (${statusInfo.daysLeft} Days Left)`}
                  </>
                )}
              </div>

              <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">
                {isExpired ? (
                  hi ? 'आपका 6-महीने का प्लान समाप्त हो चुका है' : 'Your 6-Month Plan Has Expired'
                ) : (
                  hi ? 'अपना प्लान 6 महीने आगे बढ़ाएं' : 'Extend Your Plan by 6 Months'
                )}
              </h1>

              <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-2xl">
                {isExpired ? (
                  hi
                    ? 'अपनी MPPSC तैयारी बिना किसी रुकावट के जारी रखने के लिए तुरंत अपना सब्सक्रिप्शन रिन्यू करें। आपका पिछला रिकॉर्ड और प्रोग्रेस 100% सुरक्षित है।'
                    : 'Renew your subscription now to continue uninterrupted access to PYQs, model answers, tests, and syllabus clarity. Your progress is 100% saved.'
                ) : (
                  hi
                    ? 'समय से पहले रिन्यू करने पर आपके बचे हुए दिन भी पूरी तरह सुरक्षित रहेंगे और नया 6-महीने का समय आपकी पुरानी एक्सपायरी से आगे जुड़ जाएगा।'
                    : 'Renew early to preserve your remaining active days. Your new 6-month validity will seamlessly add on top of your existing expiry date.'
                )}
              </p>
            </div>
          </div>

          {/* User Account Bar */}
          {user && (
            <div className="mt-6 border-t border-amber-200/60 pt-4 flex flex-wrap items-center justify-between text-xs text-slate-500 font-semibold gap-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Account: <strong className="text-slate-800">{user.email}</strong></span>
              </div>

              <div className="flex items-center gap-2 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 text-amber-900">
                <span>{hi ? 'वर्तमान प्लान:' : 'Current Plan:'}</span>
                <strong className="text-slate-900 font-black">
                  {getPlanDisplayName(user)}
                </strong>
              </div>

              <div>
                {hi ? 'स्थिति:' : 'Status:'} <span className="font-bold text-amber-700 capitalize">{statusInfo.status.replace('_', ' ')}</span>
              </div>
            </div>
          )}
        </div>

        {/* ── Tab Switcher Pricing Section ───────────────────────────── */}
        <div className="mb-12">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">
              {hi ? 'अपना रिन्यूअल प्लान चुनें' : 'Select Your Renewal Plan'}
            </h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1.5">
              {hi ? '1-क्लिक रेज़रपे पेमेंट • INSTANT एक्टिवेशन • कोई ऑटो-कटिंग नहीं' : '1-Click Razorpay Payment • Instant Activation • No Auto Debit'}
            </p>
          </div>

          {/* Tab Switcher Pills */}
          <div className="mx-auto max-w-lg mb-8 p-1.5 bg-slate-100 rounded-2xl flex items-center gap-1 border border-slate-200 shadow-inner">
            
            {/* TAB 1: Combo Plan (DEFAULT ACTIVE) */}
            <button
              type="button"
              onClick={() => setActiveTab('combo')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'combo'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles size={14} />
              <span>{hi ? 'कॉम्बो ऑफर (Combo)' : 'Combo Offer'}</span>
            </button>

            {/* TAB 2: Prelims Pro */}
            <button
              type="button"
              onClick={() => setActiveTab('pro')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'pro'
                  ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{hi ? 'प्रिलिम्स (Prelims)' : 'Prelims Pro'}</span>
            </button>

            {/* TAB 3: Mains Pro */}
            <button
              type="button"
              onClick={() => setActiveTab('mains')}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs md:text-sm font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'mains'
                  ? 'bg-slate-900 text-white shadow-md scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <span>{hi ? 'मेन्स (Mains)' : 'Mains Pro'}</span>
            </button>
          </div>

          {/* Active Tab Card Content */}
          <div className="mx-auto max-w-lg">
            
            {/* 1. COMBO PLAN ACTIVE CARD */}
            {activeTab === 'combo' && (
              <div className="relative rounded-3xl border-2 border-amber-500 bg-gradient-to-b from-amber-50/70 via-white to-amber-50/20 p-6 md:p-8 shadow-xl">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 text-[10px] font-black uppercase text-slate-950 shadow-md tracking-wider flex items-center gap-1">
                  <Sparkles size={12} />
                  {hi ? 'विशेष रिन्यूअल ऑफर (BEST VALUE)' : 'SPECIAL RENEWAL OFFER'}
                </div>

                <div className="space-y-4 pt-2 text-center">
                  <div className="inline-block rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-black text-amber-800 uppercase tracking-wider">
                    {hi ? 'प्रिलिम्स + मेन्स सम्पूर्ण एक्सेस (6 महीने)' : 'Pre + Mains Complete Access (6 Months)'}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl md:text-3xl font-black text-slate-900">Combo Renewal Package</h3>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      {hi ? 'Prelims & Mains Vault — 6 महीने की वैधता' : 'Prelims & Mains Vault — 6 Months Validity'}
                    </p>
                  </div>

                  {/* Strikethrough Pricing: Originally ₹599 -> Now ₹499 */}
                  <div className="py-3 flex items-center justify-center gap-3">
                    <span className="text-4xl md:text-5xl font-black text-slate-900">₹{comboPrice}</span>
                    <div className="flex flex-col items-start">
                      <span className="text-base text-slate-400 font-bold line-through">₹{comboOriginalPrice}</span>
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {hi ? `₹${comboOriginalPrice - comboPrice} की छूट` : `SAVE ₹${comboOriginalPrice - comboPrice}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRenewClick('combo')}
                    className="w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-4 text-base md:text-lg shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} />
                    {hi ? `कॉम्बो रिन्यू करें — ₹${comboPrice}` : `Renew Combo Offer — ₹${comboPrice}`}
                  </button>
                </div>
              </div>
            )}

            {/* 2. PRELIMS PRO ACTIVE CARD */}
            {activeTab === 'pro' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-lg text-center space-y-4">
                <div className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {hi ? 'प्रारंभिक परीक्षा (Prelims Vault Only)' : 'Prelims Vault Only'}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Prelims Pro</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {hi ? '6 महीने का प्रिलिम्स एक्सेस' : '6-Month Prelims Access'}
                  </p>
                </div>
                <div className="py-2">
                  <span className="text-4xl font-black text-slate-900">₹{proPrice}</span>
                  <span className="text-xs text-slate-400 font-semibold ml-2">/ 6 {hi ? 'महीने' : 'Months'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRenewClick('pro')}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 text-base shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {hi ? `प्रिलिम्स रिन्यू करें — ₹${proPrice}` : `Renew Prelims — ₹${proPrice}`}
                </button>
              </div>
            )}

            {/* 3. MAINS PRO ACTIVE CARD */}
            {activeTab === 'mains' && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-lg text-center space-y-4">
                <div className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {hi ? 'मुख्य परीक्षा (Mains Vault Only)' : 'Mains Vault Only'}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Mains Pro</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {hi ? '6 महीने का मेन्स मॉडल आंसर्स एक्सेस' : '6-Month Mains Model Answers Access'}
                  </p>
                </div>
                <div className="py-2">
                  <span className="text-4xl font-black text-slate-900">₹{mainsPrice}</span>
                  <span className="text-xs text-slate-400 font-semibold ml-2">/ 6 {hi ? 'महीने' : 'Months'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRenewClick('mains')}
                  className="w-full rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 text-base shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {hi ? `मेन्स रिन्यू करें — ₹${mainsPrice}` : `Renew Mains — ₹${mainsPrice}`}
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Trust Signals */}
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <Shield className="h-4 w-4" />
          <p className="text-xs font-semibold">
            {hi
              ? '1-क्लिक रेज़रपे पेमेंट • instant एक्टिवेशन • कोई ऑटो-कटिंग नहीं'
              : '1-Click Razorpay Payment • Instant Activation • No Auto Debit'}
          </p>
        </div>

      </div>

      {/* Payment Modal Integration */}
      <PaymentModal
        open={showPaymentModal}
        onOpenChange={setShowPaymentModal}
        planType={selectedPlan.planType}
        planName={selectedPlan.name}
      />
    </div>
  );
}
