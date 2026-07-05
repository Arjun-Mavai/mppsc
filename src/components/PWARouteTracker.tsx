'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TRACKING_KEY = 'mppsc_pwa_last_route';
const EXPIRY_HOURS = 4; // Auto-resume expires after 4 hours of inactivity

export function PWARouteTracker() {
  const pathname = usePathname();
  const router = useRouter();
  const hasResumed = useRef(false);

  useEffect(() => {
    // 1. Guard for Server-Side Rendering (SSR) safety
    if (typeof window === 'undefined' || !pathname) return;

    // 2. AUTO-RESUME LOGIC (Only runs when landing on Dashboard)
    if (pathname === '/dashboard' && !hasResumed.current) {
      hasResumed.current = true;
      try {
        const savedData = localStorage.getItem(TRACKING_KEY);
        if (savedData) {
          const { path, timestamp } = JSON.parse(savedData);
          const hoursSinceSaved = (Date.now() - timestamp) / 3600000;

          if (path && path !== '/dashboard' && hoursSinceSaved < EXPIRY_HOURS) {
            localStorage.removeItem(TRACKING_KEY);
            router.replace(path);
            return; // Exit early, we are navigating away
          }
        }
      } catch (e) {
        console.error('[PWA Tracker] Resume error:', e);
      }
    }

    // 3. TRACKING LOGIC (Runs on other route changes)
    const isExcluded = 
      pathname === '/' || 
      pathname === '/dashboard' || 
      pathname.startsWith('/signin') || 
      pathname.startsWith('/register') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/upgrade');

    if (!isExcluded) {
      try {
        localStorage.setItem(TRACKING_KEY, JSON.stringify({
          path: pathname,
          timestamp: Date.now()
        }));
      } catch (e) {
        // Silently ignore quota limits
      }
    } else if (pathname === '/dashboard') {
      // Clear tracker if user intentionally returns to dashboard
      localStorage.removeItem(TRACKING_KEY);
    }
  }, [pathname, router]);

  // This component renders absolutely nothing. 
  // Purely a client-side headless tracker.
  return null;
}
