import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { getUserTier } from '@/lib/access-control';
import BlueprintClient from './BlueprintClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MPPSC Prelims 7-Year Intelligence Blueprint & Hot Topics | 2020–2026 Analysis',
  description:
    '7-Year empirical exam blueprint, Cutoff formula (Rule of 65%), repeated question pattern proofs, and Unit 1 to 10 microscopic hot topics & cheat sheets.',
};

export default async function BlueprintPage() {
  const user = await verifyAuth();
  if (!user) {
    redirect('/pricing');
  }

  const tier = getUserTier(user);
  if (tier === 'free') {
    redirect('/pricing');
  }

  return <BlueprintClient />;
}
