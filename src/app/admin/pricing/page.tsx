'use client';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 ADMIN PRICING — Update prices from dashboard, no deploy needed
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Mobile-first card layout. Changes reflect immediately on /pricing.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, IndianRupee, Save, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { type PricingData, PRICING_DEFAULTS } from '@/config/pricing';
import { API } from '@/config/endpoints';

type ExamType = 'upsc' | 'mppsc' | 'mppolice';

export default function AdminPricingPage() {
  const [activeExam, setActiveExam] = useState<ExamType>('mppsc');
  const [data, setData] = useState<PricingData>(PRICING_DEFAULTS);
  /** Only sent for `examType === 'mppsc'` — JSON merged with defaults in-app. */
  const [mppscProductCopyJson, setMppscProductCopyJson] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPricing = async (exam: ExamType) => {
    setLoading(true);
    try {
      const res = await fetch(`${API.PRICING}?examType=${exam}`, { cache: 'no-store' });
      const json = await res.json();
      if (json.pricing) {
        // Remove examType from data if it exists to match PricingData interface
        const { examType: _, ...cleanPricing } = json.pricing;
        setData({ ...PRICING_DEFAULTS, ...cleanPricing });
      }
      const rawCopy = typeof json.mppscProductCopyJson === 'string' ? json.mppscProductCopyJson : '';
      setMppscProductCopyJson(exam === 'mppsc' ? rawCopy : '');
    } catch {
      setData(PRICING_DEFAULTS);
      setMppscProductCopyJson('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPricing(activeExam);
  }, [activeExam]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(API.PRICING, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          examType: activeExam,
          ...(activeExam === 'mppsc' ? { mppscProductCopyJson: mppscProductCopyJson || null } : {}),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(json.message || `Pricing updated for ${activeExam.toUpperCase()}!`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all text-sm bg-white';
  const labelClass = 'text-xs font-semibold text-slate-600 uppercase tracking-wider';

  const updateField = (key: keyof PricingData, value: string | number) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold md:text-2xl">
            <IndianRupee className="h-5 w-5 text-emerald-600" />
            Pricing Manager
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Prices change karo — turant /pricing par reflect hoga
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPricing(activeExam)}
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* ── Exam Tabs ──────────────────────────────────────── */}
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
        {(['mppsc', 'upsc', 'mppolice'] as const).map((exam) => (
          <button
            key={exam}
            onClick={() => setActiveExam(exam)}
            className={`flex-1 rounded-lg py-2 text-xs font-bold uppercase tracking-wider transition-all ${
              activeExam === exam ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {exam}
          </button>
        ))}
      </div>

      {/* ── Lite Plan Card ─────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-800">📖 Lite Plan</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelClass}>Current Price (₹)</label>
            <input
              type="number"
              value={data.litePrice}
              onChange={(e) => updateField('litePrice', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Original Price (₹)</label>
            <input
              type="number"
              value={data.liteOriginalPrice}
              onChange={(e) => updateField('liteOriginalPrice', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelClass}>Validity Text</label>
            <input
              type="text"
              value={data.liteValidityText}
              onChange={(e) => updateField('liteValidityText', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Duration (months)</label>
            <input
              type="number"
              value={data.liteMonths}
              onChange={(e) => updateField('liteMonths', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Pro Plan Card ──────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border-2 border-slate-800 bg-white p-4 shadow-sm md:p-6">
        <h2 className="flex items-center gap-2 font-bold text-slate-800">👑 Pro Plan</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelClass}>Current Price (₹)</label>
            <input
              type="number"
              value={data.proPrice}
              onChange={(e) => updateField('proPrice', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Original / Strike (₹)</label>
            <input
              type="number"
              value={data.proOriginalPrice}
              onChange={(e) => updateField('proOriginalPrice', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelClass}>Validity Text</label>
            <input
              type="text"
              value={data.proValidityText}
              onChange={(e) => updateField('proValidityText', e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Duration (months)</label>
            <input
              type="number"
              value={data.proMonths}
              onChange={(e) => updateField('proMonths', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <span className="text-slate-400 line-through">₹{data.proOriginalPrice}</span>
          <span className="ml-2 text-xl font-black text-slate-900">₹{data.proPrice}</span>
          <span className="ml-2 text-xs font-bold text-emerald-600">
            {Math.round((1 - data.proPrice / data.proOriginalPrice) * 100)}% OFF
          </span>
          <span className="ml-2 text-xs text-slate-400">
            ~ ₹{Math.round(data.proPrice / data.proMonths)}/mo • {data.proMonths} months
          </span>
        </div>
      </div>

      {/* ── Mains + Combo (MPPSC only; ignored for UPSC / MP Police saves) ── */}
      {activeExam === 'mppsc' && (
        <>
          <div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-sm md:p-6">
            <h2 className="font-bold text-emerald-900">📗 Mains vault SKU</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Price (₹)</label>
                <input
                  type="number"
                  value={data.mainsPrice}
                  onChange={(e) => updateField('mainsPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Strike (₹)</label>
                <input
                  type="number"
                  value={data.mainsOriginalPrice}
                  onChange={(e) => updateField('mainsOriginalPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Validity text</label>
                <input
                  type="text"
                  value={data.mainsValidityText}
                  onChange={(e) => updateField('mainsValidityText', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Months</label>
                <input
                  type="number"
                  value={data.mainsMonths}
                  onChange={(e) => updateField('mainsMonths', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-sm md:p-6">
            <h2 className="font-bold text-amber-950">🎁 Combo SKU (Pre + Mains)</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Price (₹)</label>
                <input
                  type="number"
                  value={data.comboPrice}
                  onChange={(e) => updateField('comboPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Strike (₹)</label>
                <input
                  type="number"
                  value={data.comboOriginalPrice}
                  onChange={(e) => updateField('comboOriginalPrice', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className={labelClass}>Validity text</label>
                <input
                  type="text"
                  value={data.comboValidityText}
                  onChange={(e) => updateField('comboValidityText', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1">
                <label className={labelClass}>Months</label>
                <input
                  type="number"
                  value={data.comboMonths}
                  onChange={(e) => updateField('comboMonths', Number(e.target.value))}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-indigo-200 bg-white p-4 shadow-sm md:p-6">
            <h2 className="font-bold text-slate-800">✉️ MPPSC copy JSON (pricing + thank-you + email)</h2>
            <p className="text-[11px] leading-relaxed text-slate-500">
              Optional partial JSON: merge keys{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">{'{ pre, mains, combo }'}</code>{' '}
              with shipped defaults (<code className="rounded bg-slate-100 px-1 py-0.5">
                bulletsEn
              </code>
              , <code className="rounded bg-slate-100 px-1 py-0.5">thankYou*</code>,{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">email*</code>). Wrong JSON safely
              falls back server-side — UPSC/M Police rows never read this column.
            </p>
            <textarea
              value={mppscProductCopyJson}
              onChange={(e) => setMppscProductCopyJson(e.target.value)}
              spellCheck={false}
              placeholder='{ "mains": { "bulletsEn": ["..."] } }'
              rows={12}
              className="font-mono w-full rounded-xl border border-slate-200 p-3 text-xs leading-relaxed focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </>
      )}

      {/* ── Upgrade Pricing Card ───────────────────────────── */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="font-bold text-slate-800">🔄 Upgrade (Lite → Pro)</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className={labelClass}>Upgrade Price (₹)</label>
            <input
              type="number"
              value={data.upgradePrice}
              onChange={(e) => updateField('upgradePrice', Number(e.target.value))}
              className={inputClass}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Original (₹)</label>
            <input
              type="number"
              value={data.upgradeOriginalPrice}
              onChange={(e) => updateField('upgradeOriginalPrice', Number(e.target.value))}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* ── Urgency Text ───────────────────────────────────── */}
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h2 className="font-bold text-slate-800">🔥 Urgency Banner</h2>
        <div className="space-y-1">
          <label className={labelClass}>Students Bought (FOMO Number)</label>
          <input
            type="number"
            value={data.studentsBought}
            onChange={(e) => updateField('studentsBought', Number(e.target.value))}
            className={inputClass}
          />
          <p className="text-[11px] text-slate-400">
            Ye number pricing page par dikhega — &quot;23 students already joined&quot;
          </p>
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Urgency Text (English)</label>
          <input
            type="text"
            value={data.urgencyText}
            onChange={(e) => updateField('urgencyText', e.target.value)}
            className={inputClass}
          />
        </div>
        <div className="space-y-1">
          <label className={labelClass}>Urgency Text (Hindi)</label>
          <input
            type="text"
            value={data.urgencyTextHi}
            onChange={(e) => updateField('urgencyTextHi', e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* ── Save Button ────────────────────────────────────── */}
      <Button
        onClick={handleSave}
        disabled={saving}
        className="h-12 w-full bg-slate-900 font-bold text-white hover:bg-slate-800"
      >
        {saving ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" /> Save Pricing
          </>
        )}
      </Button>
    </div>
  );
}
