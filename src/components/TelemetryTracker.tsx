'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';

export function TelemetryTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { user, guestLead } = useSettingsStore();

  const prevPathnameRef = useRef<string | null>(null);
  const entryTimeRef = useRef<number>(Date.now());
  const lastTrackedPathRef = useRef<string | null>(null);
  const tabSessionStartRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let sessionStart = sessionStorage.getItem('mppsc_tab_session_start');
      if (!sessionStart) {
        sessionStart = Date.now().toString();
        sessionStorage.setItem('mppsc_tab_session_start', sessionStart);
      }
      tabSessionStartRef.current = parseInt(sessionStart, 10);
    }
  }, []);

  // Detect device classification
  const getDeviceType = (): string => {
    if (typeof window === 'undefined') return 'Unknown';
    const width = window.innerWidth;
    if (width < 768) return 'Mobile';
    if (width < 1024) return 'Tablet';
    return 'Desktop';
  };

  // Helper to send telemetry events cleanly and asynchronously
  const sendEvent = (payload: any) => {
    try {
      const url = '/api/tracking/events';
      const body = JSON.stringify(payload);

      // Try sendBeacon first for unloads, fallback to keepalive fetch
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        const blob = new Blob([body], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      } else {
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
          keepalive: true,
        }).catch(() => {}); // fully silent catch
      }
    } catch (e) {
      // Completely silent catch
    }
  };

  // Core effect for capturing Page Views & transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    const now = Date.now();
    const guestName = localStorage.getItem('mppsc_guest_name');

    // 1. Report transition (dwell time) for the PREVIOUS page (if any exists)
    if (prevPathnameRef.current && prevPathnameRef.current !== fullPath) {
      const durationSeconds = Math.round((now - entryTimeRef.current) / 1000);
      const sessionDurationSeconds = tabSessionStartRef.current 
        ? Math.round((now - tabSessionStartRef.current) / 1000) 
        : durationSeconds;
      
      // Ignore super-fast bounce micro-clicks (less than 1s) to prevent spam
      if (durationSeconds >= 1) {
        sendEvent({
          type: 'page_dwell',
          path: prevPathnameRef.current,
          previousPath: fullPath,
          duration: durationSeconds,
          sessionDuration: sessionDurationSeconds,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            planTier: user.planTier,
          } : null,
          guestName,
          guestLead: guestLead ? {
            name: guestLead.name,
            phone: guestLead.phone,
            email: guestLead.email,
          } : null,
          device: getDeviceType(),
          userAgent: navigator.userAgent,
          referrer: document.referrer || undefined,
        });
      }
    }

    // 2. Report the NEW Page View event immediately (only if not already tracked to prevent duplicates on hydration/dependency triggers)
    if (lastTrackedPathRef.current !== fullPath) {
      sendEvent({
        type: 'page_view',
        path: fullPath,
        user: user ? {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          planTier: user.planTier,
        } : null,
        guestName,
        guestLead: guestLead ? {
          name: guestLead.name,
          phone: guestLead.phone,
          email: guestLead.email,
        } : null,
        device: getDeviceType(),
        userAgent: navigator.userAgent,
        referrer: document.referrer || undefined,
      });
      lastTrackedPathRef.current = fullPath;
    }

    // 3. Update active state trackers
    prevPathnameRef.current = fullPath;
    entryTimeRef.current = now;
  }, [pathname, searchParams, user, guestLead]);

  // Tab unload listener (tracks dwell time when tab is closed/hidden)
  const reportedRef = useRef<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleUnload = () => {
      const fullPath = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      // Prevent double reporting for the same path
      if (reportedRef.current === fullPath) return;

      const now = Date.now();
      const guestName = localStorage.getItem('mppsc_guest_name');
      const durationSeconds = Math.round((now - entryTimeRef.current) / 1000);
      const sessionDurationSeconds = tabSessionStartRef.current 
        ? Math.round((now - tabSessionStartRef.current) / 1000) 
        : durationSeconds;

      if (durationSeconds >= 1) {
        reportedRef.current = fullPath;
        sendEvent({
          type: 'page_dwell',
          path: fullPath,
          duration: durationSeconds,
          sessionDuration: sessionDurationSeconds,
          user: user ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            planTier: user.planTier,
          } : null,
          guestName,
          guestLead: guestLead ? {
            name: guestLead.name,
            phone: guestLead.phone,
            email: guestLead.email,
          } : null,
          device: getDeviceType(),
          userAgent: navigator.userAgent,
        });
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        handleUnload();
      } else {
        // Reset tracking timers and "reported" flag when user returns to tab
        entryTimeRef.current = Date.now();
        reportedRef.current = null;
      }
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [pathname, searchParams, user, guestLead]);
  return null;
}
