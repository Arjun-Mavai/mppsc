import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

/**
 * Interface for the BeforeInstallPromptEvent
 * This event is not yet standard, so we define it manually.
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Custom hook to handle PWA installation logic and detection.
 * Provides 'isPwaInstalled' status and an 'installPwa' function.
 */
export function usePwa() {
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (Installed)
    const checkStandalone = () => {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window.navigator as any).standalone === true; // For iOS Safari

      setIsPwaInstalled(isStandalone);
    };

    checkStandalone();

    // 2. Detect iOS & Safari
    const detectIos = () => {
      const ua = navigator.userAgent;
      const isIosDevice = 
        /iPad|iPhone|iPod/.test(ua) || 
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      // On iOS, true Safari doesn't have 'CriOS' or 'FxiOS'
      const isSafariBrowser = /Safari/i.test(ua) && !/CriOS/i.test(ua) && !/FxiOS/i.test(ua);
      
      setIsIos(!!isIosDevice);
      setIsSafari(!!isSafariBrowser);
      
      // On iOS, we can consider it "installable" if not already installed,
      // even though there's no native prompt.
      if (!!isIosDevice && !isPwaInstalled) {
        setIsInstallable(true);
      }
    };

    detectIos();

    // Listen for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsPwaInstalled(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleDisplayModeChange);
    }

    // 3. Capture the install prompt (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
      logger.debug('PWA Install Prompt captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Register Service Worker (Manual Registration)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        try {
          navigator.serviceWorker.register('/sw.js').then(
            (registration) => {
              logger.debug('ServiceWorker registration successful with scope: ', {
                scope: registration.scope,
                category: 'system',
              });
            },
            (err) => {
              logger.error('ServiceWorker registration failed: ', err, { category: 'system' });
            }
          ).catch((err) => {
            logger.error('ServiceWorker Promise caught error: ', err, { category: 'system' });
          });
        } catch (err) {
          logger.error('ServiceWorker sync error: ', err, { category: 'system' });
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleDisplayModeChange);
      }
    };
  }, [isPwaInstalled]);

  const installPwa = async () => {
    if (isIos) {
      // For iOS, this function doesn't trigger a native prompt.
      // The UI component using this hook should handle showing instructions.
      logger.debug('iOS Install requested - manual instructions needed');
      return;
    }

    if (!deferredPrompt) {
      logger.debug('Install prompt not available');
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    logger.info(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return { isPwaInstalled, isInstallable, installPwa, isIos, isSafari };
}
