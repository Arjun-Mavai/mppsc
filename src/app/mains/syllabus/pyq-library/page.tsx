import type { Metadata } from 'next';
import { verifyAuth } from '@/lib/auth';
import { isMainsVaultUnlockedUser } from '@/lib/mains-vault-access';
import { PyqLibraryClient } from '@/app/mains/syllabus/pyq-library/PyqLibraryClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'MPPSC Mains PYQ desk — past papers & model answers',
  description:
    'Official MPPSC Mains previous-year questions with bilingual model answers and expert pointers — practise by paper and section.',
};

export default async function MainsPyqLibraryPage() {
  const user = await verifyAuth();
  const vaultUnlocked = isMainsVaultUnlockedUser(user);

  return <PyqLibraryClient vaultUnlocked={vaultUnlocked} />;
}
