import { User, AccessControlUser, getUserTier } from '@/lib/access-control';
import { TopicData } from '@/app/syllabus/[unitId]/UnitContent';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  ACCESS CONTROL — DB FLAGS se decide hota h kaun kya dekhe      ║
// ║  Admin panel se toggle karo → turant frontend pe reflect        ║
// ╚══════════════════════════════════════════════════════════════════╝

/**
 * 🎮 ACCESS CONTROL CONFIG
 *
 * Ab ye sirf Unit 1 ka fallback limit rakhta hai.
 * Baaki sab DB flags (isFree, isLiteAccess, isProAccess) se control hota hai.
 *
 * FREE USERS → sirf topic.isFree=true wale dikhte hain
 * LITE USERS → isFree=true OR isLiteAccess=true wale dikhte hain
 * PRO USERS  → isProAccess=true wale (default sab)
 * ADMIN      → bypass, sab open
 */
export const ACCESS_CONFIG = {
  // Unit 1 me kitne topics free users ko dikhane h (fallback when DB flags not set)
  FREE_TOPICS_UNIT1: 2,

  // Lite plan limits — ye ab legacy fallback hai
  // Primary control DB flags se hota hai
  LITE_LIMITS: {
    LARGE_UNIT: 5,
    MEDIUM_UNIT: 3,
    SMALL_UNIT: 1,
  },

  LARGE_UNIT_THRESHOLD: 10,
  SMALL_UNIT_THRESHOLD: 5,
} as const;

/**
 * Lite user ko kitne topics unlock — unit size ke basis par (fallback)
 * Ye tab use hota hai jab DB me isLiteAccess flags set nahi hain
 */
export function getLiteUnlockLimit(totalTopics: number): number {
  if (totalTopics >= ACCESS_CONFIG.LARGE_UNIT_THRESHOLD)
    return ACCESS_CONFIG.LITE_LIMITS.LARGE_UNIT;
  if (totalTopics < ACCESS_CONFIG.SMALL_UNIT_THRESHOLD) return ACCESS_CONFIG.LITE_LIMITS.SMALL_UNIT;
  return ACCESS_CONFIG.LITE_LIMITS.MEDIUM_UNIT;
}

interface UserState {
  isSubscribed: boolean;
  plan_tier?: 'free' | 'lite' | 'pro' | null;
}

/**
 * 🔐 Topic locked hai ya nahi — DB flags se decide
 *
 * Priority (top se check hota hai):
 * 1. topic.isFree = true → ALWAYS UNLOCKED (Free/Guest bhi dekh sakte)
 * 2. Pro user + topic.isProAccess → UNLOCKED
 * 3. Lite user + (isLiteAccess OR isFree) → UNLOCKED
 * 4. Free user — Unit 1 fallback (pehle 5 topics) ya isFree flag
 * 5. Default → LOCKED 🔒
 *
 * Backward Compatibility:
 * - Agar isLiteAccess/isProAccess DB me null hai (migration pending)
 *   to purana index-based logic fallback me chalega
 */
export function isSyllabusTopicLocked(
  topic: TopicData,
  index: number,
  user: AccessControlUser | null,
  unitId: string,
  totalTopics: number
): boolean {
  // ── CHECK 1: DB me free mark h → sabke liye khula ──────────
  if (topic.isFree) return false;

  // ── CHECK 2: User ka tier nikalo ────────────────────────────
  const planTier = getUserTier(user);

  // ── CHECK 3: Pro user — DB flag check ───────────────────────
  if (planTier === 'pro') {
    // isProAccess null hai (migration pending) → default unlocked for pro
    return (topic as any).isProAccess === false;
  }

  // ── CHECK 4: Lite user — DB flag check ──────────────────────
  if (planTier === 'lite') {
    // Agar DB flags set hain → use them
    if ((topic as any).isLiteAccess !== undefined && (topic as any).isLiteAccess !== null) {
      return !((topic as any).isLiteAccess || topic.isFree);
    }
    // Fallback: purana index-based limit (migration pending)
    const limit = getLiteUnlockLimit(totalTopics);
    return index >= limit;
  }

  // ── CHECK 5: Free/Guest — Unit 1 fallback + isFree flag ─────
  if (!user || !user.isSubscribed) {
    if (unitId === 'unit_1') {
      return index >= ACCESS_CONFIG.FREE_TOPICS_UNIT1;
    }
    return true; // Non-unit-1 → locked for free users
  }

  return true; // Safety net
}
