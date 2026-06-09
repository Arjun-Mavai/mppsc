import { memo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getProductPortalNavVisibility } from '@/lib/product-portal-policy';

interface NavbarLogoProps {
  user: any;
}

export const NavbarLogo = memo(function NavbarLogo({ user }: NavbarLogoProps) {
  const router = useRouter();
  
  const handleLogoClick = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (!user) {
      router.push('/');
      return;
    }
    const v = getProductPortalNavVisibility(user);
    if (v.showPrePortalNav) {
      router.push('/dashboard');
    } else if (v.showMainsNav) {
      router.push('/mains/syllabus');
    } else {
      router.push('/dashboard');
    }
  }, [router, user]);

  return (
    <div
      onClick={handleLogoClick}
      className="group flex cursor-pointer items-center gap-2"
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg shadow-slate-900/20 transition-transform group-hover:scale-105">
        <span className="text-xs font-bold tracking-tighter">MP</span>
      </div>
      <div className="flex flex-col">
        <span className="font-display text-lg leading-none font-bold text-slate-900">MPPSC</span>
        <span className="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
          Mindful Prep
        </span>
      </div>
    </div>
  );
});