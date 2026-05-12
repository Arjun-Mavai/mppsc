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
    if (!ref.current || isLoggedIn || !isProtectionEnabled) return;
    if (!requireLogin) return;

    const element = ref.current;

    // CSS: Disable selection permanently
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    (element.style as any).msUserSelect = 'none';
    (element.style as any).MozUserSelect = 'none';

    // Block copy event (Ctrl+C, Cmd+C)
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      // Toast feedback (optional)
      if (typeof window !== 'undefined') {
        console.log('📋 Content is protected - copy disabled');
      }
    };

    // Block cut event (Ctrl+X, Cmd+X)
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Block paste event (Ctrl+V, Cmd+V)
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // Block right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Block mouse selection start (select-all)
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Add all event listeners
    element.addEventListener('copy', handleCopy, { capture: true });
    element.addEventListener('cut', handleCut, { capture: true });
    element.addEventListener('paste', handlePaste, { capture: true });
    element.addEventListener('contextmenu', handleContextMenu, { capture: true });
    element.addEventListener('selectstart', handleSelectStart, { capture: true });

    // Cleanup
    return () => {
      element.removeEventListener('copy', handleCopy, true);
      element.removeEventListener('cut', handleCut, true);
      element.removeEventListener('paste', handlePaste, true);
      element.removeEventListener('contextmenu', handleContextMenu, true);
      element.removeEventListener('selectstart', handleSelectStart, true);
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
