/**
 * Quick regression checks for `resolveVerifiedPayment` (run in CI or locally).
 * Usage: npx tsx scripts/test-payment-resolve.ts
 */
import { PRICING_DEFAULTS } from '../src/config/pricing';
import { resolveVerifiedPayment } from '../src/lib/payment-access-resolve';
import { listPricingAmountCollisions } from '../src/lib/plan-security';

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(msg);
}

const pricing = PRICING_DEFAULTS;
const paise = (r: number) => r * 100;

const collisions = listPricingAmountCollisions(pricing);
if (collisions.length > 0) {
  // pro vs upgrade same ₹ is OK if notes.planType is set; admin should still prefer distinct amounts.
  // eslint-disable-next-line no-console
  console.warn('[test-payment-resolve] Shared paise between SKUs:', collisions.join('; '));
}

// Pro — new user, full Prelims
let r = resolveVerifiedPayment(
  paise(pricing.proPrice),
  'pro',
  pricing,
  null,
  'free'
);
assert(r.allowedAmount && r.planTier === 'pro' && r.accessGrants.includes('mppsc_pre'), 'pro new user');

// Mains only — new user
r = resolveVerifiedPayment(
  paise(pricing.mainsPrice),
  'mains',
  pricing,
  null,
  'free'
);
assert(
  r.allowedAmount && r.accessGrants.length === 1 && r.accessGrants[0] === 'mppsc_mains',
  'mains standalone'
);

// Mains — already has Pre (pro)
r = resolveVerifiedPayment(
  paise(pricing.mainsPrice),
  'mains',
  pricing,
  ['mppsc_pre'],
  'pro'
);
assert(
  r.allowedAmount && r.accessGrants.includes('mppsc_mains') && r.accessGrants.includes('mppsc_pre'),
  'mains addon server-side'
);

// Combo
r = resolveVerifiedPayment(
  paise(pricing.comboPrice),
  'combo',
  pricing,
  null,
  'free'
);
assert(
  r.allowedAmount && r.accessGrants.includes('mppsc_pre') && r.accessGrants.includes('mppsc_mains'),
  'combo'
);

// Tamper: wrong note for amount
r = resolveVerifiedPayment(
  paise(pricing.mainsPrice),
  'combo',
  pricing,
  null,
  'free'
);
assert(!r.allowedAmount, 'reject mismatched planType vs amount');

// eslint-disable-next-line no-console
console.log('ok: payment resolve tests passed');
