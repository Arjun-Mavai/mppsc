import { AccessControlUser, getUserTier } from '@/lib/access-control';
import { TopicData } from '@/app/syllabus/[unitId]/UnitContent';

// ╔══════════════════════════════════════════════════════════════════╗
// ║  ACCESS CONTROL — accessGrants se decide hota h kaun kya dekhe  ║
// ║  mppsc_pre grant → Pro tier → sab open                          ║
// ║  No Pre grant → Free tier → sirf isFree topics                  ║
// ╚══════════════════════════════════════════════════════════════════╝

/**
 * 🎮 ACCESS CONTROL CONFIG
 *
 * Ab ye sirf Unit 1 ka fallback limit rakhta hai.
 * Baaki sab DB flags (isFree, isLiteAccess, isProAccess) se control hota hai.
 *
 * FREE USERS → sirf topic.isFree=true wale dikhte hain
 * PRO USERS  → isProAccess=true wale (default sab) — mppsc_pre grant wale
 * ADMIN      → bypass, sab open
 */
export const ACCESS_CONFIG = {
  // Unit 1 me kitne topics free users ko dikhane h (fallback when DB flags not set)
  FREE_TOPICS_UNIT1: 2,

  // Lite plan limits — legacy fallback
  LITE_LIMITS: {
    LARGE_UNIT: 5,
    MEDIUM_UNIT: 3,
    SMALL_UNIT: 1,
  },

  LARGE_UNIT_THRESHOLD: 10,
  SMALL_UNIT_THRESHOLD: 5,
} as const;

/**
 * Lite user ko kitne topics unlock — unit size ke basis par (legacy fallback)
 */
export function getLiteUnlockLimit(totalTopics: number): number {
  if (totalTopics >= ACCESS_CONFIG.LARGE_UNIT_THRESHOLD)
    return ACCESS_CONFIG.LITE_LIMITS.LARGE_UNIT;
  if (totalTopics < ACCESS_CONFIG.SMALL_UNIT_THRESHOLD) return ACCESS_CONFIG.LITE_LIMITS.SMALL_UNIT;
  return ACCESS_CONFIG.LITE_LIMITS.MEDIUM_UNIT;
}

/**
 * 🔐 Topic locked hai ya nahi — accessGrants + DB flags se decide
 *
 * Priority (top se check hota hai):
 * 1. topic.isFree = true → ALWAYS UNLOCKED (Free/Guest bhi dekh sakte)
 * 2. Pro user (has mppsc_pre grant) → UNLOCKED (unless isProAccess=false)
 * 3. Lite user (legacy) → isLiteAccess flag check, fallback to index limit
 * 4. Free/Guest — Unit 1 fallback (pehle FREE_TOPICS_UNIT1 topics)
 * 5. Default → LOCKED 🔒
 *
 * Note: user object must include accessGrants for grant-based check to work.
 * UnitContent passes { isSubscribed, planTier, accessGrants } from store.
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

  // ── CHECK 2: User ka tier nikalo (grant-based) ──────────────
  const planTier = getUserTier(user);

  // ── CHECK 3: Pro user (has mppsc_pre) — fully unlocked ─────
  if (planTier === 'pro') {
    // isProAccess null hai (migration pending) → default unlocked for pro
    return (topic as any).isProAccess === false;
  }

  // ── CHECK 4: Lite user (legacy) — DB flag check ─────────────
  if (planTier === 'lite') {
    if ((topic as any).isLiteAccess !== undefined && (topic as any).isLiteAccess !== null) {
      return !((topic as any).isLiteAccess || topic.isFree);
    }
    // Fallback: index-based limit
    const limit = getLiteUnlockLimit(totalTopics);
    return index >= limit;
  }

  // ── CHECK 5: Free/Guest — Unit 1 fallback + isFree flag ─────
  if (unitId === 'unit_1') {
    return index >= ACCESS_CONFIG.FREE_TOPICS_UNIT1;
  }
  return true; // Non-unit-1 → locked for free users
}
