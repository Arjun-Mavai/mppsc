import { hasMainsAccess, type MppscUserRow } from '@/lib/access-grants';

/** Admin or explicit `mppsc_mains` grant — used for syllabus + PYQ vault content (not navbar). */
export function isMainsVaultUnlockedUser(
  user: Pick<MppscUserRow, 'accessGrants' | 'planTier' | 'isSubscribed' | 'role'> | null | undefined
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  return hasMainsAccess(user);
}
