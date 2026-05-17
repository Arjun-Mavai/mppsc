import type { InferSelectModel } from 'drizzle-orm';
import type { mppscUsers } from '@/db/schema';

export const ACCESS_PRE = 'mppsc_pre' as const;
export const ACCESS_MAINS = 'mppsc_mains' as const;
export type AccessGrant = typeof ACCESS_PRE | typeof ACCESS_MAINS;

export type MppscUserRow = InferSelectModel<typeof mppscUsers>;

/** Basic fields needed to determine access */
type UserAccessInfo = {
  accessGrants?: string[] | string | null;
  planTier?: string | null;
  isSubscribed?: boolean | null;
};

export function dedupeGrants(grants: string[]): string[] {
  return [...new Set(grants.filter(Boolean))];
}

const GRANT_SLUG = /^mppsc_[a-z0-9_]+$/;

/** Parse DB value; tolerate null, bad JSON, comma-separated slugs, legacy mistakes. */
export function parseAccessGrants(raw: unknown): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return dedupeGrants(raw.filter((x): x is string => typeof x === 'string'));
  if (typeof raw === 'string') {
    const t = raw.trim();
    if (!t) return [];
    if (t.startsWith('[')) {
      try {
        const j = JSON.parse(t) as unknown;
        return Array.isArray(j)
          ? dedupeGrants(j.filter((x): x is string => typeof x === 'string'))
          : [];
      } catch {
        return [];
      }
    }
    // Comma-separated product slugs (no JSON array)
    const parts = t.split(/\s*,\s*/).map((s) => s.trim()).filter(Boolean);
    const slugs = parts.filter((p) => GRANT_SLUG.test(p));
    if (slugs.length > 0) return dedupeGrants(slugs);
    return [];
  }
  return [];
}

/** Persist to SQLite `access_grants` text column (always valid JSON array). */
export function serializeAccessGrants(grants: string[]): string {
  return JSON.stringify(dedupeGrants(grants));
}

/**
 * Legacy: before `access_grants` existed, subscribed lite/pro implied Pre product.
 * If column is empty but user is paid pre → treat as Pre access.
 */
export function effectiveAccessGrants(user: UserAccessInfo): string[] {
  if (Array.isArray(user.accessGrants)) {
    return dedupeGrants(user.accessGrants.filter((x): x is string => typeof x === 'string'));
  }

  const g = parseAccessGrants(user.accessGrants);
  if (g.length > 0) return dedupeGrants(g);
  const tier = String(user.planTier ?? 'free').toLowerCase();
  const paidPre = tier === 'lite' || tier === 'pro' || user.isSubscribed;
  if (paidPre) return [ACCESS_PRE];
  return [];
}

export function hasPreAccess(
  user: UserAccessInfo | null | undefined
): boolean {
  if (!user) return true;
  return effectiveAccessGrants(user).includes(ACCESS_PRE);
}

export function hasMainsAccess(
  user: UserAccessInfo | null | undefined
): boolean {
  if (!user) return false;
  return effectiveAccessGrants(user).includes(ACCESS_MAINS);
}

/** After successful Prelims plan purchase (lite / pro / upgrade). */
export function mergeGrantsAfterPrePurchase(current: string[]): string[] {
  return dedupeGrants([...current, ACCESS_PRE]);
}

/** Mains-only SKU: if user already had Pre, keep it; else mains-only bag. */
export function mergeGrantsAfterMainsPurchase(current: string[]): string[] {
  if (current.includes(ACCESS_PRE)) return dedupeGrants([...current, ACCESS_MAINS]);
  return [ACCESS_MAINS];
}

export function mergeGrantsAfterComboPurchase(): string[] {
  return [ACCESS_PRE, ACCESS_MAINS];
}
