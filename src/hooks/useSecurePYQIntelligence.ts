'use client';

/**
 * ========================================================================================
 * ⚡ HOOK: useSecurePYQIntelligence (सुपरफास्ट सुरक्षित डेटा हुक)
 * ========================================================================================
 * 
 * ❓ YE HOOK KYU HAI AUR KYA KAAM KARTA HAI?
 * ----------------------------------------------------------------------------------------
 * 1. ZERO LATENCY HYDRATION (0ms Feel):
 *    Jab user page par aata hai, ye hook sabse pehle RAM Memory check karta hai.
 *    Agar user isi session me pehle bhi page khol chuka hai, to 0.00ms me turant data de deta hai.
 * 
 * 2. AUTOMATIC GZIP INDEXEDDB SYNC (सुरक्षित बैकअप):
 *    Jab server se pehli baar data aata hai, ye hook chupke se background me 
 *    use Gzip compress karke IndexedDB me 'Opaque Binary Blob' ki tarah safe kar deta hai.
 *    Agli baar agar user browser band karke dobara aayega, to server ko call kiye bina
 *    IndexedDB se 2-3 millisecond me data khol dega!
 * 
 * 3. NO DEVTOOLS LEAK:
 *    DevTools me koi bhi json ya questions nahi dekh sakta kyunki binary blob hai.
 * 
 * ========================================================================================
 */

import { useState, useEffect, useRef } from 'react';
import { getSecureCache, setSecureCache } from '@/lib/secure-client-cache';
import {
  UnitDistributionStats,
  RepeatedQuestion,
  OverallWeightageSubjectData,
  TopicStat,
  SubjectDistributionStats,
} from '@/actions/pyq-analytics';

// 🕵️ OBFUSCATED STEALTH KEY:
// DevTools IndexedDB me ye Next.js internal runtime chunk lagega (zero guessability)
const DEFAULT_KEY = '_rt_c8a74e92b10f83d9';
const CACHE_VERSION = '0x7e4_opt';

export interface PYQIntelligencePayload {
  stats: UnitDistributionStats[];
  simpleSubjectStats: Record<string, number>;
  subjectQuestionsData: OverallWeightageSubjectData[];
  repeatedQuestions: RepeatedQuestion[];
  topicStats?: Record<string, TopicStat[]>;
  subjectStats?: SubjectDistributionStats[];
}

/**
 * useSecurePYQIntelligence Hook
 * 
 * @param initialData - Server Component (SSR) se aaya hua initial data
 * @param customKey   - Optional unique cache key
 */
export function useSecurePYQIntelligence(
  initialData: PYQIntelligencePayload,
  customKey: string = DEFAULT_KEY
) {
  // ── Step 1: React State Initialize ────────────────────────────────────
  // Pehle initialData (SSR) se state set hoti hai taaki koi flickering na ho
  const [data, setData] = useState<PYQIntelligencePayload>(initialData);

  // Track hydration status across renders
  const isHydratedRef = useRef(false);

  useEffect(() => {
    // SSR ke waqt browser window nahi hoti, sirf client par run hoga
    if (typeof window === 'undefined') return;

    let isMounted = true;

    async function hydrateCache() {
      try {
        // ── Step 2: Pehle Secure Client Vault (RAM / IndexedDB) check karo ──
        const cached = await getSecureCache<PYQIntelligencePayload>(customKey, CACHE_VERSION);

        // Sirf tab accept karo agar options present hain (stale old format bina options wala na ho)
        if (
          cached &&
          isMounted &&
          cached.stats?.[0]?.questions?.[0]?.options !== undefined
        ) {
          // 🚀 Vault me cached data mil gaya! Instant state update (0ms ya 2ms)
          setData(cached);
          isHydratedRef.current = true;
          return;
        }

        if (initialData && !isHydratedRef.current) {
          // Background me silently compress and store karo bina UI ko slow kiye
          await setSecureCache(customKey, initialData, CACHE_VERSION);
          isHydratedRef.current = true;
        }
      } catch (err) {
        // Safe fallback: Agar IndexedDB fail ho to app crash nahi hogi, initialData chalta rahega
        console.warn('[useSecurePYQIntelligence] Cache hydration error:', err);
      }
    }

    hydrateCache();

    return () => {
      isMounted = false;
    };
  }, [customKey, initialData]);

  // Data return karo jo UI components use karenge
  return data;
}
