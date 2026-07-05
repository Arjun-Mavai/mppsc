'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TRACKING_KEY = 'mppsc_pwa_last_route';
const EXPIRY_HOURS = 4; // Auto-resume expires after 4 hours of inactivity

export function PWARouteTracker() {
  const pathname = usePathname();
  const router = useRouter();
  const hasChecked = useRef(false);

  // 1. On Initial Mount / Dashboard Visit: Auto-Resume logic
  useEffect(() => {
    // Only attempt auto-resume once per browser session mount
    if (hasChecked.current) return;
    hasChecked.current = true;

    try {
      // PWA standard behavior drops users at the start_url (usually /dashboard).
      // We only intervene if they specifically landed here.
      if (pathname !== '/dashboard') return;

      const savedData = localStorage.getItem(TRACKING_KEY);
      if (!savedData) return;

      const { path, timestamp } = JSON.parse(savedData);
      const now = Date.now();
      const hoursSinceSaved = (now - timestamp) / (1000 * 60 * 60);

      // If the saved path is valid, not the dashboard, and not expired
      if (path && path !== '/dashboard' && hoursSinceSaved < EXPIRY_HOURS) {
        // Clear it immediately to prevent infinite redirect loops
        localStorage.removeItem(TRACKING_KEY);
        // Replace the route silently and instantly (avoids adding dashboard to history stack)
        router.replace(path);
      }
    } catch (error) {
      console.error('[PWA Tracker] Resume error:', error);
    }
  }, [pathname, router]);

  // 2. On Route Change: Save the current context
  useEffect(() => {
    if (!pathname) return;

    // We do NOT want to auto-resume to marketing, auth, or the dashboard itself.
    const isExcluded = 
      pathname === '/' || 
      pathname === '/dashboard' || 
      pathname.startsWith('/signin') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/upgrade');

    if (!isExcluded) {
      try {
        const data = {
          path: pathname, // e.g. /mains/syllabus/pyq-library
          timestamp: Date.now()
        };
        localStorage.setItem(TRACKING_KEY, JSON.stringify(data));
      } catch (e) {
        // Silently ignore quota errors
      }
    } else {
      // If the user intentionally navigated back to the dashboard, 
      // clear the tracker so we don't accidentally auto-resume them later.
      if (pathname === '/dashboard') {
        localStorage.removeItem(TRACKING_KEY);
      }
    }
  }, [pathname]);

  // This component renders absolutely nothing. 
  // Purely a client-side headless tracker.
  return null;
}
