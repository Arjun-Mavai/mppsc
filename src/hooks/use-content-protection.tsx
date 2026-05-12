/**
 * React Hook: useContentProtection
 * Simple integration for protecting quiz questions, answers, etc.
 * 
 * Usage:
 * const { ref, watermarkMeta } = useContentProtection(userId, 'question', questionId);
 * <div ref={ref} {...watermarkMeta}>Protected Content</div>
 */

'use client';

import { useRef, useEffect } from 'react';
import {
  attachCopyProtection,
  generateWatermarkMeta,
  generateFingerprint,
  trackCopyAttempt,
  COPY_PROTECTION_CSS,
} from '@/lib/content-protection';

// Development toggle (disable in .env.local)
const isProtectionEnabled = process.env.NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION !== 'true';

export interface UseContentProtectionOptions {
  userId?: string;
  contentType?: 'question' | 'answer' | 'explanation' | 'quiz';
  contentId?: string;
  enableTracking?: boolean;
  enableVisualWatermark?: boolean;
}

export function useContentProtection(options: UseContentProtectionOptions = {}) {
  const {
    userId,
    contentType = 'question',
    contentId = '',
    enableTracking = true,
    enableVisualWatermark = false,
  } = options;

  const ref = useRef<HTMLDivElement>(null);

  // Setup copy protection
  useEffect(() => {
    if (!ref.current || !isProtectionEnabled) return;

    const cleanup = attachCopyProtection(ref.current, userId, (fingerprint) => {
      // Track copy attempt if enabled
      if (enableTracking) {
        trackCopyAttempt({
          fingerprint,
          contentType,
          contentId,
          userId,
        });
      }
    });

    return cleanup;
  }, [userId, contentType, contentId, enableTracking]);

  // Add CSS to document (once per component mount)
  useEffect(() => {
    if (typeof document !== 'undefined' && isProtectionEnabled) {
      // Only add once
      if (!document.querySelector('[data-content-protection-css]')) {
        const style = document.createElement('style');
        style.setAttribute('data-content-protection-css', 'true');
        style.textContent = COPY_PROTECTION_CSS;
        document.head.appendChild(style);
      }
    }
  }, []);

  if (!isProtectionEnabled) {
    return {
      ref,
      watermarkMeta: {},
      className: '',
      fingerprint: '',
    };
  }

  const watermarkMeta = generateWatermarkMeta(userId);

  return {
    ref,
    watermarkMeta,
    className: `protected-content ${enableVisualWatermark ? 'watermarked' : ''}`,
    // For server-side rendering support
    fingerprint: generateFingerprint(userId),
  };
}

/**
 * Simple wrapper component (optional).
 * Usage: <ProtectedContent userId={uid} type="question"><YourContent/></ProtectedContent>
 */
export function ProtectedContent({
  children,
  userId,
  type = 'question',
  contentId = '',
  enableTracking = true,
}: {
  children: React.ReactNode;
  userId?: string;
  type?: 'question' | 'answer' | 'explanation' | 'quiz';
  contentId?: string;
  enableTracking?: boolean;
}) {
  const { ref, watermarkMeta, className } = useContentProtection({
    userId,
    contentType: type,
    contentId,
    enableTracking,
  });

  return (
    <div ref={ref} className={className} {...watermarkMeta}>
      {children}
    </div>
  );
}
