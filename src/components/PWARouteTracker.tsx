'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const TRACKING_KEY = 'mppsc_pwa_last_route';
const EXPIRY_HOURS = 8; // Auto-resume expires after 8 hours of inactivity

/**
 * 🚀 PWA Route Tracker & Auto-Resume (Enterprise Grade)
 * 
 * WHAT IS THIS?
 * This is a headless (no UI) Client Component that solves a major UX issue in PWAs.
 * When a PWA (Progressive Web App) is installed on iOS/Android, and the user leaves the app, 
 * the OS might suspend or kill it to save battery. When re-opened, the PWA strictly follows 
 * the `start_url` defined in `manifest.json` (which is `/dashboard` in our case).
 * This causes users to lose their current context (e.g., they were deep inside a PYQ paper).
 * 
 * HOW IT WORKS:
 * 1. Tracking: Every time the user navigates (except auth/dashboard), we save the path to `localStorage`.
 * 2. Auto-Resume: If the user opens the PWA and lands on `/dashboard`, we instantly intercept 
 *    and seamlessly redirect them to their last saved path (if it's within the EXPIRY_HOURS window).
 * 
 * ARCHITECTURE & SAFETY:
 * - 0% Server Load: Runs entirely on the client browser.
 * - Hydration Safe: Uses `useEffect` strictly for external synchronization.
 * - Access-Agnostic: Relies on existing server middleware for security. If a Free user tries 
 *   to resume to a Premium URL, the middleware will naturally block them.
 */
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
