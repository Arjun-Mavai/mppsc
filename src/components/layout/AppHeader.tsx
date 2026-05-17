import { verifyAuth } from '@/lib/auth';
import { AppNavbar } from '@/components/layout/AppNavbar';

export async function AppHeader() {
  const user = await verifyAuth();
  return <AppNavbar user={user} />;
}
