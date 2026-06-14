import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Zap, 
  Sparkles 
} from './icons';
import { hasPreAccess, hasMainsAccess } from '@/lib/access-grants';

interface NavItem {
  name: string;
  href: string;
  icon: typeof LayoutDashboard;
  color: string;
}

interface DesktopNavigationProps {
  navItems: NavItem[];
  pathname: string;
  user: any;
}

export const DesktopNavigation = memo(function DesktopNavigation({ 
  navItems, 
  pathname, 
  user 
}: DesktopNavigationProps) {
  return (
    <nav className="hidden items-center gap-1 rounded-full border border-slate-200/50 bg-slate-100/50 p-1.5 backdrop-blur-md md:flex">
      {navItems
        .filter((item) => {
          // Hide Dashboard if user is not logged in
          if (item.name === 'Dashboard') return !!user;
          // Test History & About Us — sidebar only, not in desktop top nav
          if (item.name === 'Test History' || item.name === 'About Us') return false;
          return true;
        })
        .map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white/50 hover:text-slate-900'
              )}
            >
              <Icon size={16} className={cn(isActive && 'fill-slate-600/10')} />
              {item.name}
            </Link>
          );
        })}
      
      {/* User Badge */}
      {(() => {
        if (!user || !user.isSubscribed) return null;
        
        const hasPre = hasPreAccess(user);
        const hasMains = hasMainsAccess(user);
        
        if (hasPre && hasMains) {
          return (
            <div className="group relative overflow-hidden rounded-full p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
              <div className="relative flex cursor-default items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-bold text-white transition-colors group-hover:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                <Sparkles size={12} className="relative z-10 fill-amber-400 text-amber-400" />
                <span className="relative z-10 text-[10px] font-black tracking-widest uppercase text-amber-50">PRO+</span>
              </div>
            </div>
          );
        }
        
        if (hasMains) {
          return (
            <div className="group relative overflow-hidden rounded-full p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-600" />
              <div className="relative flex cursor-default items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-bold text-white transition-colors group-hover:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                <Sparkles size={12} className="relative z-10 fill-emerald-400 text-emerald-400" />
                <span className="relative z-10 text-[10px] font-black tracking-widest uppercase">MAINS</span>
              </div>
            </div>
          );
        }
        
        if (hasPre) {
          return (
            <div className="group relative overflow-hidden rounded-full p-[1px]">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600" />
              <div className="relative flex cursor-default items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5 text-sm font-bold text-white transition-colors group-hover:bg-slate-800">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-50" />
                <Sparkles size={12} className="relative z-10 fill-amber-400 text-amber-400" />
                <span className="relative z-10 text-[10px] font-black tracking-widest uppercase">PRO</span>
              </div>
            </div>
          );
        }
        
        return (
          <div className="relative overflow-hidden rounded-full p-[1.5px]">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-cyan-500 to-blue-500" />
            <div className="relative flex cursor-default items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-bold text-white">
              <Sparkles size={12} className="fill-blue-400 text-blue-400" />
              <span className="text-[10px] font-black tracking-wide uppercase">LITE</span>
            </div>
          </div>
        );
      })()}
    </nav>
  );
});