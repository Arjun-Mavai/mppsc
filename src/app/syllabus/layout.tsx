import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { hasPreAccess } from '@/lib/access-grants';
import { shouldRedirectPreSyllabusToMains } from '@/lib/product-portal-policy';

export default async function SyllabusLayout({ children }: { children: React.ReactNode }) {
  const user = await verifyAuth();
  if (user && shouldRedirectPreSyllabusToMains(user)) {
    redirect('/mains/syllabus');
  }
  if (user && !hasPreAccess(user)) {
    redirect('/pricing?need=pre');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="">{children}</div>
    </div>
  );
}
