// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🛡️ ACCESS CONTROL SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// ✅ SINGLE SOURCE OF TRUTH: `accessGrants` column
//
// accessGrants decide karta hai ki user kya dekh sakta hai:
//   - ['mppsc_pre']               → Pre Syllabus + Quiz + Tests sab open (= pro tier)
//   - ['mppsc_pre', 'mppsc_mains']→ Pre + Mains dono open         (= pro tier)
//   - ['mppsc_mains']             → Sirf Mains vault, Pre locked   (= free tier for Pre)
//   - []                          → Nothing paid, Free user
//
// plan_tier (lite | pro | mains | combo) is ONLY kept for:
//   1. Legacy users who bought before accessGrants column existed
//   2. Analytics / admin display
//
// DO NOT add new access logic based on plan_tier. Use accessGrants.
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { mppscUsers, tests, syllabusTopics } from '@/db/schema';
import { hasPreAccess } from '@/lib/access-grants';
import { PLAN_LIMITS } from '@/config/plans';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 TYPE DEFINITIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type Test = typeof tests.$inferSelect;
export type Topic = typeof syllabusTopics.$inferSelect;

/**
 * Plan Tiers — used internally for content-flag matching (isFreeAccess / isLiteAccess / isProAccess).
 * - 'free'  → no paid grant (unsubscribed, or mains-only user visiting Pre syllabus)
 * - 'lite'  → legacy lite plan (has mppsc_pre, limited tests) — kept for backward compat
 * - 'pro'   → has mppsc_pre grant — full Pre access
 * - 'guest' → not logged in
 */
export type PlanTier = 'free' | 'lite' | 'pro';

/**
 * AccessControlUser — minimal shape accepted by all access functions.
 * Accepts both DB row shape and client/store shape.
 */
export interface AccessControlUser {
  role?: string | null;
  isSubscribed?: boolean | null;
  is_subscribed?: boolean | null;
  planTier?: string | null;
  plan_tier?: string | null;
  /** access_grants column — array or JSON string of grant slugs */
  accessGrants?: unknown;
  access_grants?: unknown; // DB snake_case variant
}

export type User = typeof mppscUsers.$inferSelect | AccessControlUser | null;

export interface AccessResult {
  allowed: boolean;
  reason?: string;
  requiresUpgrade?: boolean;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔍 TIER DETECTION — Grant-based, plan_tier is only a fallback hint
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * getUserTier — returns effective tier for Pre-Syllabus content gating.
 *
 * Logic (in order):
 * 1. No user → 'guest'
 * 2. Admin   → 'pro' (bypass everything)
 * 3. Has `mppsc_pre` grant (via accessGrants OR legacy plan_tier fallback) → 'pro'
 * 4. Has no Pre grant but is subscribed (mains-only) → 'free' (locked for Pre content)
 * 5. Not subscribed → 'free'
 *
 * Why grant-based?
 * - combo / pro / lite / mains are just SKU labels — their actual entitlement lives in accessGrants.
 * - A user with plan_tier='mains' should NOT get Pre access.
 * - A user with plan_tier='combo' SHOULD get Pre access (has mppsc_pre in grants).
 * - effectiveAccessGrants() handles legacy users (plan_tier only, no grants column) gracefully.
 */
export function getUserTier(user: AccessControlUser | null): PlanTier | 'guest' {
  if (!user) return 'guest';

  if (user.role === 'admin') return 'pro';

  // Merge both accessGrants and access_grants (DB vs client shape)
  const userForGrants = {
    accessGrants: (user as any).accessGrants ?? (user as any).access_grants ?? null,
    planTier: (user as any).planTier ?? (user as any).plan_tier ?? null,
    isSubscribed: !!(user.isSubscribed ?? user.is_subscribed),
  };

  // Primary check: does this user have the mppsc_pre entitlement?
  if (hasPreAccess(userForGrants)) return 'pro';

  // No Pre access → free for Pre content (even if subscribed to Mains-only)
  return 'free';
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 CENTRAL: CONTENT ACCESS (Tests, Topics, Blogs — same rule)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Content access flags — Tests, SyllabusTopics, ContentBlogs sab same pattern use karte hain.
 */
export interface ContentAccessFlags {
  isFreeAccess?: boolean | null;
  isLiteAccess?: boolean | null;
  isProAccess?: boolean | null;
}

/**
 * hasAccessToContent — Single source of truth for "can this user access this item?"
 *
 * - guest / free: only isFreeAccess === true
 * - lite:  isFreeAccess OR isLiteAccess
 * - pro:   always yes (unless isProAccess explicitly false)
 */
export function hasAccessToContent(flags: ContentAccessFlags, tier: PlanTier | 'guest'): boolean {
  const free = !!flags.isFreeAccess;
  const lite = !!flags.isLiteAccess;
  const pro = flags.isProAccess !== false; // default true unless explicitly false
  if (tier === 'pro') return pro || lite || free;
  if (tier === 'lite') return lite || free;
  return free; // guest / free
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔓 TOPIC ACCESS CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAccessTopic — Grant-based topic access.
 *
 * 1. Admin → always open
 * 2. isFree topic → open for all
 * 3. User has mppsc_pre grant → 'pro' tier → open (unless isProAccess=false)
 * 4. Else → locked
 */
export function canAccessTopic(topic: Topic, user: AccessControlUser | null): boolean {
  if (user?.role === 'admin') return true;
  if (topic.isFree) return true;
  const tier = getUserTier(user);
  return hasAccessToContent(
    {
      isFreeAccess: topic.isFree,
      isLiteAccess: topic.isLiteAccess,
      isProAccess: topic.isProAccess,
    },
    tier
  );
}

/**
 * canAccessBlog — Grant-based blog access.
 */
export function canAccessBlog(
  blog: {
    isFreeAccess: boolean | null;
    isLiteAccess: boolean | null;
    isProAccess: boolean | null;
    isPremium?: boolean | null;
  },
  user: AccessControlUser | null
): boolean {
  if (user?.role === 'admin') return true;
  const tier = getUserTier(user);
  return hasAccessToContent(
    {
      isFreeAccess: blog.isFreeAccess,
      isLiteAccess: blog.isLiteAccess,
      isProAccess: blog.isProAccess,
    },
    tier
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📝 TEST ACCESS CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAccessTest — Grant-based test access.
 *
 * Pre tests are gated by mppsc_pre grant → getUserTier() returns 'pro' → open.
 */
export function canAccessTest(test: Test, user: User): boolean {
  if (user?.role === 'admin') return true;
  const tier = getUserTier(user);
  return hasAccessToContent(
    {
      isFreeAccess: test.isFreeAccess,
      isLiteAccess: test.isLiteAccess,
      isProAccess: test.isProAccess,
    },
    tier
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🎯 ATTEMPT LIMIT CONTROL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * canAttemptTest — Can this user actually attempt the test (attempt limit check)?
 *
 * Different from canAccessTest:
 * - canAccessTest  → test dikhega ya nahi
 * - canAttemptTest → test de payega ya limit exceed ho gayi
 *
 * Since all subscribed Pre users are now 'pro' tier → unlimited attempts.
 * Free users get 1 attempt per test.
 */
export function canAttemptTest(test: Test, user: User, currentAttempts: number): AccessResult {
  if (user?.role === 'admin') return { allowed: true };

  if (!user) {
    return {
      allowed: false,
      reason: 'Test dene ke liye Login jaruri hai bhai.',
      requiresUpgrade: false,
    };
  }

  if (!canAccessTest(test, user)) {
    return {
      allowed: false,
      reason: 'Ye Premium Test hai. Access ke liye upgrade karo.',
      requiresUpgrade: true,
    };
  }

  const tier = getUserTier(user);

  if (tier === 'guest') {
    return { allowed: false, reason: 'Login required', requiresUpgrade: false };
  }

  const limits = PLAN_LIMITS[tier as Exclude<typeof tier, 'guest'>] ?? PLAN_LIMITS.free;

  if (tier === 'free') {
    if (currentAttempts >= 1) {
      return {
        allowed: false,
        reason: 'Free plan me ek hi attempt milta hai. Unlimited attempts ke liye upgrade karo!',
        requiresUpgrade: true,
      };
    }
  } else if (tier === 'lite') {
    // NOTE: getUserTier() currently never returns 'lite' — all Pre users get 'pro'.
    // This branch is kept as a safety net in case a caller passes a tier directly.
    const limit =
      test.type === 'UNIT' || test.type === 'FLT'
        ? limits.unit_tests_limit
        : limits.topic_tests_limit;
    if (currentAttempts >= limit) {
      return {
        allowed: false,
        reason: `Limit exceed ho gayi. Pro lelo, unlimited hai! 🚀`,
        requiresUpgrade: true,
      };
    }
  }
  // pro → unlimited, always allowed

  return { allowed: true };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💬 USER-FACING MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getLockReason(contentType: 'topic' | 'test' | 'unit', user: User): string {
  if (!user) return 'Access ke liye Login karein';

  const tier = getUserTier(user);

  if (tier === 'free') {
    if (contentType === 'topic') return 'Unit 1 ke baad ke topics Premium hain. Upgrade karein!';
    if (contentType === 'test') return 'Premium tests aur unlimited attempts ke liye upgrade karein.';
    if (contentType === 'unit') return 'Unit 2 se 10 tak sab Locked hai. Sirf Pro/Combo members ke liye.';
  }

  if (tier === 'lite') {
    return 'Full access aur unlimited attempts ke liye Pro Plan pe upgrade karein.';
  }

  return 'Locked Content';
}

export function shouldShowUpgradePrompt(user: User): boolean {
  if (!user) return false;
  if (user.role === 'admin') return false;
  const tier = getUserTier(user);
  return tier === 'free' || tier === 'lite';
}

export function getUpgradeMessage(user: User): string {
  const tier = getUserTier(user);
  if (tier === 'free') return '🚀 Pro Plan lelo - Sab unlock ho jayega! Full syllabus + Unlimited tests!';
  if (tier === 'lite') return '⚡ Pro Plan upgrade karo - Unlimited attempts + Full access!';
  return '';
}
