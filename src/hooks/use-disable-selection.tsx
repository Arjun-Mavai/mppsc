/**
 * Disable Selection + Copy on Mains Pages (PRODUCTION READY)
 * 
 * ✅ Non-login: CANNOT select/copy/paste
 * ✅ Login users: Full access (no restrictions)
 * 
 * DEVELOPMENT MODE:
 *   Set env: NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION=true
 *   This will disable all protection features locally
 */

'use client';

import React, { useEffect } from 'react';
import { useSettingsStore } from '@/store/useSettingsStore';

// Development toggle (disable in .env.local)
const isProtectionEnabled = process.env.NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION !== 'true';

/**
 * Hook: Disable selection for non-login users
 * Blocks: selection, copy (Ctrl+C), cut (Ctrl+X), paste (Ctrl+V), right-click copy
 */
export function useDisableSelection(
  ref: React.RefObject<HTMLDivElement | null>,
  requireLogin: boolean = false
) {
  const { user } = useSettingsStore();
  const isLoggedIn = !!user;

  useEffect(() => {
    // 🛡️ If protection is disabled (local dev) or user is logged in, DO NOTHING
    if (!ref.current || isLoggedIn || !isProtectionEnabled) return;
    if (!requireLogin) return;

    const element = ref.current;

    // CSS: Disable selection
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';

    // Block copy/cut/paste
    const handleBlock = (e: Event) => e.preventDefault();
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    element.addEventListener('copy', handleBlock, { capture: true });
    element.addEventListener('cut', handleBlock, { capture: true });
    element.addEventListener('paste', handleBlock, { capture: true });
    element.addEventListener('contextmenu', handleContextMenu, { capture: true });
    element.addEventListener('selectstart', handleBlock, { capture: true });

    return () => {
      element.removeEventListener('copy', handleBlock, true);
      element.removeEventListener('cut', handleBlock, true);
      element.removeEventListener('paste', handleBlock, true);
      element.removeEventListener('contextmenu', handleContextMenu, true);
      element.removeEventListener('selectstart', handleBlock, true);
    };
  }, [ref, isLoggedIn, requireLogin]);
}

/**
 * Component: Wrap mains content (disable for guests)
 * Shows subtle lock indicator on hover
 */
export function DisableSelectionForGuests({
  children,
  showLockIndicator = true,
}: {
  children: React.ReactNode;
  showLockIndicator?: boolean;
}) {
  const { user } = useSettingsStore();
  const isLoggedIn = !!user;
  const ref = React.useRef<HTMLDivElement>(null);

  useDisableSelection(ref, !isLoggedIn);

  // If protection disabled in dev mode, don't show indicator
  if (!isProtectionEnabled) {
    return <div ref={ref}>{children}</div>;
  }

  if (!isLoggedIn && showLockIndicator) {
    return (
      <div
        ref={ref}
        className="relative group"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
        }}
      >
        {/* Subtle lock indicator - only shows on hover for guests */}
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-40 transition-opacity text-xs text-slate-400 pointer-events-none">
          🔒 Protected
        </div>

        {children}
      </div>
    );
  }

  return <div ref={ref}>{children}</div>;
}
