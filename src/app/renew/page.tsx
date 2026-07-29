import { verifyAuth } from '@/lib/auth';
import { getSubscriptionStatus } from '@/lib/subscription-status';
import { RenewClient } from './RenewClient';
import { getPricingData } from '@/actions/pricing-actions';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Renew Plan | MPPSC Platform',
  description: 'Renew your 6-Month MPPSC Preparation Plan to continue seamless access to PYQ model answers, tests, and syllabus clarity.',
};

export default async function RenewPage() {
  const user = await verifyAuth();
  
  // 1. Unauthenticated users -> redirect to login
  if (!user) {
    redirect('/login?redirectTo=/renew');
  }

  const statusInfo = getSubscriptionStatus(user);

  // 2. 🛡️ SECURITY GUARD: Only allow users whose plan is expiring soon (<= 10 days) or already expired!
  // Active users with > 10 days left are safely redirected to /dashboard.
  const isExpiringSoon = statusInfo.daysLeft !== null && statusInfo.daysLeft <= 10;
  const isExpired = statusInfo.isExpired;

  if (!isExpiringSoon && !isExpired) {
    redirect('/dashboard');
  }

  // 3. Fetch pricing config dynamically from database
  let pricing = {
    ...PRICING_DEFAULTS,
    renewalProPrice: 299,
    renewalProOriginalPrice: 999,
    renewalMainsPrice: 399,
    renewalMainsOriginalPrice: 1499,
    renewalComboPrice: 499, // Special renewal offer: ₹499 (originally ₹599)
    renewalComboOriginalPrice: 599,
  };

  try {
    const data = await getPricingData('mppsc');
    if (data?.pricing) {
      pricing = {
        ...pricing,
        ...data.pricing,
        renewalMainsPrice: data.pricing.renewalMainsPrice || 399,
        renewalComboPrice: data.pricing.renewalComboPrice || 499,
        renewalComboOriginalPrice: data.pricing.renewalComboOriginalPrice || 599,
      };
    }
  } catch (error) {
    // Graceful fallback to defaults
  }

  return (
    <RenewClient
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        planTier: user.planTier,
        accessExpiresAt: user.accessExpiresAt,
      }}
      statusInfo={statusInfo}
      pricing={pricing}
    />
  );
}
