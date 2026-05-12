/**
 * Disable Selection + Copy on Mains Pages (Smooth, Minimal)
 * 
 * Non-login: Cannot select/copy (shows medium-style locked look)
 * Login users: Can select/copy normally
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

/**
 * Hook: Disable selection for non-login users
 * Usage: useDisableSelection(contentRef, requireLogin)
 */
export function useDisableSelection(
  ref: React.RefObject<HTMLDivElement>,
  requireLogin: boolean = false
) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useEffect(() => {
    if (!ref.current || isLoggedIn) return; // Allow if logged in
    if (!requireLogin) return; // Allow if not required

    const element = ref.current;

    // Disable selection with CSS
    element.style.userSelect = 'none';
    element.style.webkitUserSelect = 'none';
    element.style.msUserSelect = 'none';
    element.style.MozUserSelect = 'none';

    // Prevent copy/cut events
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleCut = (e: ClipboardEvent) => e.preventDefault();

    element.addEventListener('copy', handleCopy);
    element.addEventListener('cut', handleCut);

    return () => {
      element.removeEventListener('copy', handleCopy);
      element.removeEventListener('cut', handleCut);
    };
  }, [ref, isLoggedIn, requireLogin]);
}

/**
 * Component: Wrap mains content (disable for guests)
 * Usage: <DisableSelectionForGuests><YourContent/></DisableSelectionForGuests>
 */
export function DisableSelectionForGuests({
  children,
  showLockOverlay = true,
}: {
  children: React.ReactNode;
  showLockOverlay?: boolean;
}) {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const ref = React.useRef<HTMLDivElement>(null);

  useDisableSelection(ref, !isLoggedIn);

  if (!isLoggedIn && showLockOverlay) {
    return (
      <div
        ref={ref}
        className="relative"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Subtle overlay (1% opacity, medium-style) */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-slate-100 to-slate-200 opacity-[0.02] rounded-lg" />

        {/* Lock indicator (subtle, bottom-right) */}
        <div className="absolute bottom-2 right-2 pointer-events-none text-slate-300 text-xs font-medium opacity-20">
          🔒 Preview
        </div>

        {children}
      </div>
    );
  }

  return <div ref={ref}>{children}</div>;
}

/**
 * CSS Class: Apply to any element to disable selection
 * Usage: <div className="disable-guest-selection">{content}</div>
 */
export const DISABLE_SELECTION_CSS = `
  .disable-guest-selection {
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
  }

  /* Allow selection in specific areas (e.g., for logged-in users) */
  .disable-guest-selection .allow-selection {
    user-select: text;
    -webkit-user-select: text;
  }
`;
