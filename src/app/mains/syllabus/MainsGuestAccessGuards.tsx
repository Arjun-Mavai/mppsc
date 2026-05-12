'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { GuestLeadModal } from '@/components/guest-lead-modal';

const isProtectionEnabled = process.env.NEXT_PUBLIC_DISABLE_CONTENT_PROTECTION !== 'true';

/**
 * Enforces guest protections across /mains/syllabus subtree:
 * 1) Disables selection/copy for guests
 * 2) Captures guest lead before browsing content
 */
export function MainsGuestAccessGuards() {
  const pathname = usePathname();
  const { user } = useSettingsStore();
  const isLoggedIn = !!user;

  useEffect(() => {
    if (!isProtectionEnabled || isLoggedIn) return;

    const block = (e: Event) => {
      e.preventDefault();
    };
    const keyBlock = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (!mod) return;
      const key = e.key.toLowerCase();
      if (key === 'c' || key === 'x' || key === 'v' || key === 'a') {
        e.preventDefault();
      }
    };

    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    (document.body.style as any).MozUserSelect = 'none';
    (document.body.style as any).msUserSelect = 'none';

    document.addEventListener('selectstart', block, true);
    document.addEventListener('copy', block, true);
    document.addEventListener('cut', block, true);
    document.addEventListener('paste', block, true);
    document.addEventListener('contextmenu', block, true);
    document.addEventListener('dragstart', block, true);
    document.addEventListener('keydown', keyBlock, true);

    return () => {
      document.body.style.removeProperty('user-select');
      document.body.style.removeProperty('-webkit-user-select');
      document.body.style.removeProperty('-moz-user-select');
      document.body.style.removeProperty('-ms-user-select');

      document.removeEventListener('selectstart', block, true);
      document.removeEventListener('copy', block, true);
      document.removeEventListener('cut', block, true);
      document.removeEventListener('paste', block, true);
      document.removeEventListener('contextmenu', block, true);
      document.removeEventListener('dragstart', block, true);
      document.removeEventListener('keydown', keyBlock, true);
    };
  }, [isLoggedIn]);

  if (!isProtectionEnabled || isLoggedIn) return null;

  const page = pathname?.includes('/pyq-library') ? 'mains-pyq-library' : 'mains-syllabus';
  const title = page === 'mains-pyq-library'
    ? '🏛️ MPPSC Mains: Unlock Free PYQs & Sample Answers'
    : '🏛️ MPPSC Mains: Unlock Free Syllabus & Topics';
  const subtitle = page === 'mains-pyq-library'
    ? 'भावी अधिकारी! दर्ज करें अपना विवरण और मुख्य परीक्षा (Mains) के पिछले वर्षों के प्रश्न-बैंक व उपलब्ध निःशुल्क मॉडल आंसर्स तुरंत अनलॉक करें।'
    : 'भावी अधिकारी! दर्ज करें अपना विवरण और मुख्य परीक्षा (Mains) का नया माइक्रो-सिलेबस, टॉपिक्स व उपलब्ध निःशुल्क सैंपल्स तुरंत अनलॉक करें।';

  return <GuestLeadModal page={page} title={title} subtitle={subtitle} mandatory />;
}

