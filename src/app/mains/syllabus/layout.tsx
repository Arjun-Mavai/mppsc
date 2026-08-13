import { verifyAuth } from '@/lib/auth';
import { isMainsVaultUnlockedUser } from '@/lib/mains-vault-access';
import { MainsGuestAccessGuards } from '@/app/mains/syllabus/MainsGuestAccessGuards';

/**
 * Mains syllabus tree + PYQ desk are publicly navigable for demos.
 * Pre-only users see Mains content as demo (overlays & locked sections).
 * Topic expert content & most PYQs are gated in-page (overlay + SyllabusLockMainsModal) unless vault unlocked.
 */
export default async function MainsSyllabusLayout({ children }: { children: React.ReactNode }) {
  const user = await verifyAuth();
  const vaultUnlocked = isMainsVaultUnlockedUser(user);

  return (
    <div
      data-mains-vault={vaultUnlocked ? 'open' : 'demo'}
      className="min-h-screen bg-slate-950 text-slate-100"
    >
      <MainsGuestAccessGuards />
      {children}
    </div>
  );
}
