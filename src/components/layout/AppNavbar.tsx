'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { usePwa } from '@/hooks/usePwa';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/actions/auth-actions';
import { getProductPortalNavVisibility } from '@/lib/product-portal-policy';
import { hasPreAccess, hasMainsAccess } from '@/lib/access-grants';
import type { AuthenticatedUser } from '@/types/auth';

import './navbar-animations.css';

// Optimized imports - tree-shakeable
import {
  Menu,
  Send,
  Crown,
  Sparkles,
  RefreshCw,
  Download,
  LogOut,
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Zap,
  History,
  Info,
  Library,
} from './icons';

// Import optimized sub-components
import { NavbarLogo } from './NavbarLogo';
import { DesktopNavigation } from './DesktopNavigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { UserSection } from './UserSection';

interface AppNavbarProps {
  user: AuthenticatedUser | null;
}

// ✅ PERFORMANCE: Utility function to convert user to store format
const createUserToStore = (user: AuthenticatedUser): AuthenticatedUser => ({
  ...user,
});

export function AppNavbar({ user: initialUser }: AppNavbarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [shouldFetchAuth, setShouldFetchAuth] = useState(false);

  // Use Global Store
  const {
    language,
    setLanguage,
    user: globalUser,
    setUser,
    authCheckStatus,
    setAuthCheckStatus,
  } = useSettingsStore();

  const { isInstallable, installPwa, isIos } = usePwa();
  const isProtectedClientRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/syllabus/test-history') ||
    pathname.startsWith('/syllabus/analytics');

  // 🛡️ SECURITY & UI FIX:
  // We prioritize globalUser (client store) over initialUser (server props) once hydrated.
  const user = (isMounted && authCheckStatus === 'checked' ? globalUser : (globalUser || initialUser)) as AuthenticatedUser | null;

  const portalNav = useMemo(() => getProductPortalNavVisibility(user), [user]);

  // ✅ OPTIMIZED: Define core callbacks BEFORE useEffects to avoid "Initialization" errors
  const handleLogout = useCallback(async (reason?: string | any) => {
    try {
      setIsLoggingOut(true);
      setUser(null, false);
      setAuthCheckStatus('checked');

      // 1. Nuke persisted Zustand state from localStorage FIRST (Synchronous)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('settings-storage');
      }

      // 2. Fire background network requests to clear server cookies & service worker caches (with timeout)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      fetch('/api/auth/mppsc-logout', { method: 'POST', keepalive: true, signal: controller.signal })
        .catch(() => {})
        .finally(() => clearTimeout(timeoutId));
      
      if ('caches' in window) {
        Promise.race([
          Promise.all([...(await caches.keys()).map((name) => caches.delete(name))]),
          new Promise(r => setTimeout(r, 2000))
        ]).catch(() => {});
      }

      const safeReason = typeof reason === 'string' ? reason : 'logged_out';

      // 3. Force hard redirect to login page NOW that local storage is clean
      // This will look like a seamless hard refresh to the user.
      window.location.href = `/login?reason=${encodeURIComponent(safeReason)}`;
    } catch (error) {
      logger.error('Logout failed:', error);
      localStorage.removeItem('settings-storage');
      window.location.href = '/login?reason=logged_out';
    }
  }, [setUser, setAuthCheckStatus, setIsLoggingOut]);

  const handleManualRefresh = useCallback(async () => {
    try {
      toast.loading('Refreshing app...', { description: 'Clearing cache and reloading...' });

      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }

      window.location.reload();
    } catch (error) {
      window.location.reload();
    }
  }, []);

  const handleAdminDashboard = useCallback(() => {
    router.push('/admin/dashboard');
  }, [router]);

  // ✅ PERFORMANCE: Memoized navigation items
  const navItems = useMemo(() => {
    const all = [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-slate-700' },
      { name: 'Syllabus', href: '/syllabus', icon: BookOpen, color: 'text-emerald-600' },
      {
        name: 'Test Series',
        href: '/syllabus/quiz/pyq',
        icon: GraduationCap,
        color: 'text-amber-600',
      },
      { name: 'Free Daily Quiz', href: '/free-quiz', icon: Zap, color: 'text-orange-500' },
      { name: 'Blogs', href: '/blogs', icon: BookOpen, color: 'text-sky-600' },
      {
        name: 'Test History',
        href: '/syllabus/test-history',
        icon: History,
        color: 'text-violet-600',
      },
      {
        name: 'Mains',
        href: '/mains',
        icon: Crown,
        color: 'text-emerald-500',
      },
      { name: 'About Us', href: '/', icon: Info, color: 'text-slate-500' },
    ];

    return all.filter((item) => {
      if (item.name === 'Mains') {
        return portalNav.showMainsNav;
      }
      if (item.name === 'Dashboard') {
        return portalNav.showPrePortalNav;
      }
      const preRoutes = ['Syllabus', 'Test Series', 'Free Daily Quiz', 'Test History', 'Blogs'];
      if (preRoutes.includes(item.name)) {
        return portalNav.showPrePortalNav;
      }
      return true;
    });
  }, [portalNav]);

  // Custom mobile sidebar navigation items
  const mobileNavItems = useMemo(() => {
    if (!user) {
      return [
        { name: 'Syllabus', href: '/syllabus', icon: BookOpen, color: 'text-emerald-600' },
        { name: 'Test Series', href: '/syllabus/quiz/pyq', icon: GraduationCap, color: 'text-amber-600' },
        { name: 'Free Daily Quiz', href: '/free-quiz', icon: Zap, color: 'text-orange-500' },
        { name: 'Blogs', href: '/blogs', icon: BookOpen, color: 'text-sky-600' },
        { name: 'Mains', href: '/mains', icon: Crown, color: 'text-emerald-500' },
      ];
    }

    const hasPreAccessVal = hasPreAccess(user);
    const hasMainsAccessVal = hasMainsAccess(user);

    if (hasMainsAccessVal && !hasPreAccessVal) {
      return [
        { name: language === 'hi' ? 'मुख्य पाठ्यक्रम' : 'Mains Syllabus', href: '/mains', icon: Crown, color: 'text-emerald-500' },
        { name: language === 'hi' ? 'मेंस PYQ लाइब्रेरी' : 'Mains PYQ Library', href: '/mains/syllabus/pyq-library', icon: Library, color: 'text-violet-600' },
        { name: 'About Us', href: '/mains', icon: Info, color: 'text-slate-500' },
      ];
    }

    if (hasMainsAccessVal && hasPreAccessVal) {
      return [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-slate-700' },
        { name: 'Syllabus', href: '/syllabus', icon: BookOpen, color: 'text-emerald-600' },
        { name: 'Test Series', href: '/syllabus/quiz/pyq', icon: GraduationCap, color: 'text-amber-600' },
        { name: 'Free Daily Quiz', href: '/free-quiz', icon: Zap, color: 'text-orange-500' },
        { name: 'Blogs', href: '/blogs', icon: BookOpen, color: 'text-sky-600' },
        { name: 'Test History', href: '/syllabus/test-history', icon: History, color: 'text-violet-600' },
        { name: language === 'hi' ? 'मुख्य पाठ्यक्रम' : 'Mains Syllabus', href: '/mains', icon: Crown, color: 'text-emerald-500' },
        { name: language === 'hi' ? 'मेंस PYQ लाइब्रेरी' : 'Mains PYQ Library', href: '/mains/syllabus/pyq-library', icon: Library, color: 'text-violet-600' },
        { name: 'About Us', href: '/', icon: Info, color: 'text-slate-500' },
      ];
    }

    return [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-slate-700' },
      { name: 'Syllabus', href: '/syllabus', icon: BookOpen, color: 'text-emerald-600' },
      { name: 'Test Series', href: '/syllabus/quiz/pyq', icon: GraduationCap, color: 'text-amber-600' },
      { name: 'Free Daily Quiz', href: '/free-quiz', icon: Zap, color: 'text-orange-500' },
      { name: 'Blogs', href: '/blogs', icon: BookOpen, color: 'text-sky-600' },
      { name: 'Test History', href: '/syllabus/test-history', icon: History, color: 'text-violet-600' },
      { name: 'About Us', href: '/', icon: Info, color: 'text-slate-500' },
    ];
  }, [user, language]);

  // QUERY: SESSION RESTORATION (The "Hydration")
  const {
    data: sessionData,
    isLoading: isSessionLoading,
    refetch: refetchSession,
  } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const result = await getCurrentUser();

      if (result.user) {
        return { user: result.user as AuthenticatedUser };
      }
      return result;
    },
    // Ensure background refresh is always active unless actively logging out, and delay for guests
    enabled: !isLoggingOut && shouldFetchAuth,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh, refetches automatically on window focus 
    retry: false,
  });

  useEffect(() => {
    const timer = setTimeout(() => void refetchSession(), 200);
    return () => clearTimeout(timer);
  }, [pathname, refetchSession]);

  // ─── EFFECTS (Optimized & Consolidated) ──────────────────────────────────
  
  // 1. Mount Status & Auth Fetch Delay (Hydration)
  useEffect(() => {
    setIsMounted(true);
    // Optimization: If we have a cached user, we can fetch immediately to check if session is still valid.
    // If not, delay the check by 1.5 seconds to let the critical UI render first for guests.
    if (globalUser) {
      setShouldFetchAuth(true);
    } else {
      const timer = setTimeout(() => setShouldFetchAuth(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [globalUser]);

  // 2. Master Auth State Sync (Eliminates Effect Chaining)
  useEffect(() => {
    if (isLoggingOut) return;

    // STEP A: Initial Server Props Sync
    // Server-provided user is the absolute truth for initial render.
    if (initialUser && globalUser?.id !== initialUser.id) {
      setUser(initialUser, !!initialUser.isSubscribed);
      setAuthCheckStatus('checked');
      return; 
    }

    // STEP B: Background Fetch Results (React Query)
    if (sessionData) {
      if ((sessionData as any).reason === 'multi_device') {
        toast.error('Security Alert', {
          description: 'This session was logged out because the account was opened on another device.',
          duration: 10000,
        });
        handleLogout('multi_device');
        return;
      }

      if (sessionData.user) {
        // Update if any auth-relevant field changed (not just id/sessionVersion)
        const authFieldsChanged =
          globalUser?.id !== sessionData.user.id ||
          globalUser?.sessionVersion !== sessionData.user.sessionVersion ||
          globalUser?.isSubscribed !== sessionData.user.isSubscribed ||
          globalUser?.planTier !== sessionData.user.planTier ||
          JSON.stringify(globalUser?.accessGrants) !== JSON.stringify(sessionData.user.accessGrants);

        if (authFieldsChanged) {
          logger.info('Background sync: Session updated from server');
          setUser(sessionData.user, !!sessionData.user.isSubscribed);
        }
        setAuthCheckStatus('checked');
      } else {
        // If server says no user, wipe stale client state.
        if (globalUser) {
          logger.warn('Background sync: User is logged out on server. Wiping client state.');
          setUser(null, false);
        }
        setAuthCheckStatus('checked');
      }
      return;
    }

    // STEP C: Loading State
    if (isSessionLoading && authCheckStatus === 'idle' && !initialUser && !globalUser) {
      setAuthCheckStatus('loading');
      return;
    }

    // STEP D: Fallback Idle State
    if (!isSessionLoading && authCheckStatus === 'idle') {
      setAuthCheckStatus('checked');
    }
  }, [
    isLoggingOut,
    initialUser,
    globalUser?.id,
    globalUser?.sessionVersion,
    sessionData,
    isSessionLoading,
    authCheckStatus,
    setUser,
    setAuthCheckStatus
  ]);

  const isCompleted = searchParams.get('completed') === 'true';
  const isQuizPlay = (pathname.includes('/quiz/play') || pathname.includes('/free-quiz/play')) && !isCompleted;
  
  if (isQuizPlay) return null;

  return (
    <header className="fixed top-0 right-0 left-0 z-50 [animation:navbar-scroll_linear_both] border-b border-slate-200 bg-white/80 shadow-sm backdrop-blur-md transition-all duration-300 [animation-range:0px_50px] [animation-timeline:scroll()]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <NavbarLogo user={user} />

          <DesktopNavigation 
            navItems={navItems}
            pathname={pathname}
            user={user}
          />

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher 
              language={language}
              setLanguage={setLanguage}
            />

            <div className="hidden h-6 w-px bg-slate-200 sm:block"></div>

            <UserSection 
              user={user}
              authCheckStatus={authCheckStatus}
              isMounted={isMounted}
              onLogout={handleLogout}
              onAdminDashboard={handleAdminDashboard}
            />

            {isMounted ? (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                    <Menu className="h-6 w-6 text-slate-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="z-[150] flex w-[300px] flex-col p-0 sm:w-[360px]"
                >
                  <SheetHeader className="border-b border-slate-100 bg-slate-50/50 p-6 text-left">
                    <div className="flex flex-col gap-4">
                      {(authCheckStatus === 'idle' || authCheckStatus === 'loading') && !user ? (
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
                            <div className="flex flex-1 flex-col gap-2">
                              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                            </div>
                          </div>
                          <SheetTitle className="sr-only">Loading...</SheetTitle>
                        </div>
                      ) : user ? (
                        <>
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                                <AvatarImage src={user.image || undefined} className="scale-150" />
                                <AvatarFallback className="bg-slate-900 font-bold text-white">
                                  {user.name?.charAt(0).toUpperCase() || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              {user.isSubscribed && user.planTier === 'pro' && (
                                <div className="absolute -right-1 -bottom-1 rounded-full border-2 border-white bg-amber-400 p-0.5 text-white">
                                  <Sparkles size={10} className="fill-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-slate-900">{user.name}</span>
                                {user.isSubscribed && (
                                  <span className="rounded border border-amber-200 bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700 uppercase">{user.planTier}</span>
                                )}
                              </div>
                              <span className="mt-1 truncate text-xs text-slate-500">{user.email}</span>
                            </div>
                          </div>
                          <button
                            onClick={handleManualRefresh}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/50 py-2.5 text-xs font-bold text-orange-700 transition-all hover:bg-orange-100 active:scale-95"
                          >
                            <RefreshCw size={14} className="group-hover:rotate-180 duration-300" />
                            <span>{language === 'hi' ? 'ऐप रिफ्रेश करें' : 'Refresh App'}</span>
                          </button>
                          <SheetTitle className="sr-only">Menu</SheetTitle>
                        </>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <SheetTitle className="font-display text-lg font-bold">Menu</SheetTitle>
                          <button
                            onClick={handleManualRefresh}
                            className="group flex w-full items-center justify-center gap-2 rounded-xl border border-orange-200 bg-orange-50/50 py-2.5 text-xs font-bold text-orange-700"
                          >
                            <RefreshCw size={14} />
                            <span>{language === 'hi' ? 'ऐप रिफ्रेश करें' : 'Refresh App'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </SheetHeader>

                  <div className="flex-1 space-y-1 overflow-y-auto px-4 py-5">
                    {mobileNavItems.map((item) => {
                      const isActive = pathname === item.href;
                      const Icon = item.icon;
                      return (
                        <div key={item.name}>
                          <SheetClose asChild>
                            <Link
                              href={item.href}
                              className={cn(
                                'flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200',
                                isActive ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                              )}
                            >
                              <Icon size={18} className={cn(isActive ? 'text-white' : item.color)} />
                              {item.name}
                            </Link>
                          </SheetClose>

                          {item.name === 'Dashboard' && portalNav.showPyqAnalysisAccordion && (
                            <div className="mx-2 mt-1 mb-2">
                              <Accordion type="single" collapsible className="border-none">
                                <AccordionItem value="pyq-analysis" className="border-none">
                                  <AccordionTrigger className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold hover:no-underline">
                                    <div className="flex items-center gap-3">
                                      <Sparkles size={18} className="text-emerald-500" />
                                      <span>{language === 'hi' ? 'PYQ विश्लेषण' : 'PYQ Analysis'}</span>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent className="ml-4 space-y-1">
                                    <SheetClose asChild>
                                      <Link href="/syllabus/quiz/pyq/intelligence" className="block px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-emerald-600">
                                        {language === 'hi' ? 'विषय-वार इंटेलिजेंस' : 'Subject-wise Intelligence'}
                                      </Link>
                                    </SheetClose>
                                    <SheetClose asChild>
                                      <Link href="/syllabus/quiz/pyq/intelligence/questions?subject=All&source=subject" className="block px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-emerald-600">
                                        {language === 'hi' ? 'वर्ष-वार विश्लेषण (All PYQs)' : 'Year-wise Analysis (All PYQs)'}
                                      </Link>
                                    </SheetClose>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {user?.role === 'admin' && (
                      <div className="mt-4 border-t border-slate-100 pt-4">
                        <p className="mb-2 px-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase">Admin</p>
                        <SheetClose asChild>
                          <Link href="/admin/dashboard" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100">
                            <LayoutDashboard size={18} /> Admin Dashboard
                          </Link>
                        </SheetClose>
                      </div>
                    )}

                    {isInstallable && (
                      <div className="mt-1 pt-0">
                        <SheetClose asChild>
                          <button
                            onClick={() => isIos ? window.dispatchEvent(new CustomEvent('show-ios-install-prompt')) : installPwa()}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-600"
                          >
                            <Download size={18} />
                            {language === 'hi' ? 'ऐप इंस्टॉल करें' : 'Install App'}
                          </button>
                        </SheetClose>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                    {user ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-red-600 hover:bg-red-50"
                        onClick={(e) => { e.preventDefault(); handleLogout(); }}
                      >
                        <LogOut size={16} className="mr-2" /> Logout
                      </Button>
                    ) : (
                      <SheetClose asChild>
                        <Button asChild className="w-full rounded-xl bg-slate-900 font-bold text-white hover:bg-slate-800">
                          <Link href="/login">Log in</Link>
                        </Button>
                      </SheetClose>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <Button variant="ghost" size="icon" className="rounded-full md:hidden">
                <Menu className="h-6 w-6 text-slate-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
