import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import ProfileClient from './ProfileClient';
import { getUserProfile, getUserDoubts } from './actions';

export default async function ProfilePage() {
  const authUser = await verifyAuth();

  if (!authUser) {
    redirect('/login');
  }

  const user = await getUserProfile();

  if (!user) {
    redirect('/login');
  }
  
  const doubts = await getUserDoubts();

  return <ProfileClient user={user} doubts={doubts} />;
}
