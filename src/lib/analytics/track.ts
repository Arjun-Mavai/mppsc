import { useSettingsStore } from '@/store/useSettingsStore';

/**
 * Client-side utility to easily track custom actions/interactions (like modal opens, CTAs, clicks)
 * and route them to your Telegram Telemetry events channel automatically with complete session context.
 */
export function trackAction(actionDetails: string, extraData?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  try {
    // 🛡️ DEDUPLICATION: Prevent duplicate identical alerts within 30 seconds to save network bandwidth
    const cacheKey = `mppsc_track_${actionDetails.replace(/\s+/g, '_')}`;
    const lastTracked = sessionStorage.getItem(cacheKey);
    const nowTime = Date.now();
    
    if (lastTracked) {
      const elapsed = nowTime - parseInt(lastTracked, 10);
      if (elapsed < 30 * 1000) {
        return; // Skip duplicate spam
      }
    }
    sessionStorage.setItem(cacheKey, nowTime.toString());

    const { user, guestLead } = useSettingsStore.getState();
    const guestName = localStorage.getItem('mppsc_guest_name');
    
    const getDeviceType = (): string => {
      const width = window.innerWidth;
      if (width < 768) return 'Mobile';
      if (width < 1024) return 'Tablet';
      return 'Desktop';
    };

    const payload = {
      type: 'action',
      path: window.location.pathname + window.location.search,
      actionDetails,
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
      ...extraData
    };

    const url = '/api/tracking/events';
    const body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(url, blob);
    } else {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    // completely silent fail
  }
}
