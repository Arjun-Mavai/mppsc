/**
 * ⚡ SUBSCRIPTION STATUS RESOLVER UTILITY
 * 
 * Yeh utility user ki planTier aur accessExpiresAt time ko dekh kar
 * fast status calculate karti hai:
 *   1. 'free'          - Free user (no paid plan or no expiry)
 *   2. 'expired'       - Ex-paid user jinki accessExpiresAt date beet chuki hai (Requires Renewal)
 *   3. 'expiring_soon' - Active user jinki expiry date me 10 din ya usse kam bache hain
 *   4. 'active'        - Active user (valid plan with > 10 days remaining)
 */

export interface SubscriptionStatus {
  /** Overall subscription status badge */
  status: 'active' | 'expiring_soon' | 'expired' | 'free';
  /** Number of days remaining until expiry (positive if active, 0 or negative if expired, null if free) */
  daysLeft: number | null;
  /** True if user had a paid plan but accessExpiresAt is in the past */
  isExpired: boolean;
  /** True if daysLeft <= 10 and daysLeft > 0 (shows persistent warning banner) */
  isExpiringSoon: boolean;
  /** True if user should be redirected to /renew page upon login */
  requiresRenewalRedirect: boolean;
}

export function getSubscriptionStatus(user: {
  planTier?: string | null;
  isSubscribed?: boolean | null;
  accessExpiresAt?: Date | number | string | null;
}): SubscriptionStatus {
  // If user has no accessExpiresAt set, they are a pure free user with no expiration history
  if (!user || !user.accessExpiresAt) {
    return {
      status: 'free',
      daysLeft: null,
      isExpired: false,
      isExpiringSoon: false,
      requiresRenewalRedirect: false,
    };
  }

  const nowMs = Date.now();
  const expiryMs = new Date(user.accessExpiresAt).getTime();

  // Invalid date fallback
  if (isNaN(expiryMs)) {
    return {
      status: 'free',
      daysLeft: null,
      isExpired: false,
      isExpiringSoon: false,
      requiresRenewalRedirect: false,
    };
  }

  const diffMs = expiryMs - nowMs;

  // 🔴 Expired paid user (accessExpiresAt is in the past)
  if (diffMs <= 0) {
    return {
      status: 'expired',
      daysLeft: 0,
      isExpired: true,
      isExpiringSoon: false,
      requiresRenewalRedirect: true,
    };
  }

  // Calculate remaining days (rounded up)
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  // 🟡 Active user within 10 days of expiry
  if (daysLeft <= 10) {
    return {
      status: 'expiring_soon',
      daysLeft,
      isExpired: false,
      isExpiringSoon: true,
      requiresRenewalRedirect: false,
    };
  }

  // 🟢 Normal active paid user
  return {
    status: 'active',
    daysLeft,
    isExpired: false,
    isExpiringSoon: false,
    requiresRenewalRedirect: false,
  };
}
