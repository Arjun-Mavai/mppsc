import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthenticatedUser } from '@/types/auth';

type Language = 'en' | 'hi';

interface GuestLead {
  name: string;
  phone: string;
  email?: string;
}

interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
  user: AuthenticatedUser | null;
  isSubscribed: boolean;
  isLockModalOpen: boolean;
  setLockModalOpen: (isOpen: boolean) => void;
  authCheckStatus: 'idle' | 'loading' | 'checked';
  setAuthCheckStatus: (status: 'idle' | 'loading' | 'checked') => void;
  setUser: (user: AuthenticatedUser | null, isSubscribed: boolean) => void;
  uiMode: 'classic' | 'modern';
  setUiMode: (mode: 'classic' | 'modern') => void;
  guestLead: GuestLead | null;
  setGuestLead: (lead: GuestLead | null) => void;
  hasUnreadDoubts: boolean;
  setHasUnreadDoubts: (hasUnread: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'hi', // Default to Hindi as per user implied preference or common use
      setLanguage: (lang) => set({ language: lang }),
      user: null,
      isSubscribed: false,
      isLockModalOpen: false,
      authCheckStatus: 'idle',
      setAuthCheckStatus: (status) => set({ authCheckStatus: status }),
      setLockModalOpen: (isOpen) => set({ isLockModalOpen: isOpen }),
      // On logout: caller must also localStorage.removeItem('settings-storage')
      // to trigger cross-tab sync via the 'storage' event in AppNavbar
      setUser: (user, isSubscribed) => set({ user, isSubscribed, authCheckStatus: 'checked' }),
      uiMode: 'modern',
      setUiMode: (mode) => set({ uiMode: mode }),
      guestLead: null,
      setGuestLead: (lead) => set({ guestLead: lead }),
      hasUnreadDoubts: false,
      setHasUnreadDoubts: (hasUnread) => set({ hasUnreadDoubts: hasUnread }),
    }),
    {
      name: 'settings-storage', // localStorage key — removing this key triggers cross-tab logout
    }
  )
);
