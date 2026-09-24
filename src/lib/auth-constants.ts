/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * 🔐 CENTRAL AUTH & SECURITY CONSTANTS (Single Source of Truth)
 * ═══════════════════════════════════════════════════════════════════════════════════════
 *
 * Bhai, ye file hamare pure authentication aur anti-theft security system ka "HEAD OFFICE" hai!
 * Pure codebase me KISI BHI FILE me koi cookie, token ya storage ka naam hardcoded nahi hoga.
 * Kal ko agar hume koi bhi naam ya rule badalna ho, to sirf ISI EK FILE se badla jayega!
 *
 * ───────────────────────────────────────────────────────────────────────────────────────
 * 📋 KYA-KYA CONSTANTS HAIN AUR INKA MATLAB (Desi Guide):
 * ───────────────────────────────────────────────────────────────────────────────────────
 *
 * 1. AUTH_COOKIE_NAME = '_app_sid'
 *    - Meaning: "App Session ID"
 *    - Ye hamari primary JWT cookie hai jisme user ka login session hota hai.
 *    - Pehle iska naam 'mppsc_token' tha jo bohot obvious tha. DevTools me koi bhi dekhkar
 *      samajh jata tha ki ye login token hai.
 *    - Ab iska naam '_app_sid' hai, jo Google Analytics ya generic framework cookie jaisa lagta hai.
 *    - Kaha use hota hai: loginUserAction, proxy.ts, verifyAuthInternal, admin routes.
 *
 * 2. LEGACY_AUTH_COOKIE_NAME = 'mppsc_token'
 *    - Meaning: Purani cookie ka naam.
 *    - Kyu zaroori hai: Jo students pehle se login hain, unka browser 'mppsc_token' leke aayega.
 *      Agar hum iska fallback na rakhein, to sabhi existing users ka session toot jayega!
 *      Is fallback ki wajah se zero users logout honge!
 *
 * 3. DEVICE_COOKIE_NAME = '_app_cid'
 *    - Meaning: "App Client ID"
 *    - Ye wo cookie hai jo browser ke hardware-bound WebCrypto device ID ko server tak pahunchati hai.
 *    - Pehle 'mppsc_did' tha, ab '_app_cid' hai (bilkul stealth aur non-obvious).
 *    - Kaha use hota hai: proxy.ts, auth.ts, device-client.ts.
 *
 * 4. LEGACY_DEVICE_COOKIE_NAME = 'mppsc_did'
 *    - Meaning: Puraane device cookie ka fallback.
 *
 * 5. DEVICE_STORAGE_KEY = '_sec_cid'
 *    - Meaning: "Security Client ID"
 *    - Ye browser ke localStorage me rehta hai. Fast memory lookup ke liye.
 *
 * 6. LEGACY_DEVICE_STORAGE_KEY = 'mppsc_device_id'
 *    - Meaning: Purana localStorage key ka fallback.
 *
 * 7. IDB_DATABASE_NAME = '_app_vault' & IDB_STORE_NAME = '_app_c_store'
 *    - Meaning: Browser ke IndexedDB ki tijori.
 *    - Isme WebCrypto ki Asymmetric Private Key (extractable: false) locked rehti hai.
 *    - DevTools console se bhi ye private key export ya copy nahi ho sakti!
 *
 * 8. AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 (30 Din)
 *    - Meaning: Cookie ka lifetime 30 din ka hota hai.
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// 🎟️ 1. AUTH SESSION COOKIE (JWT)
export const AUTH_COOKIE_NAME = '_app_sid';
export const LEGACY_AUTH_COOKIE_NAME = 'mppsc_token';

// 📱 2. DEVICE BINDING COOKIE
export const DEVICE_COOKIE_NAME = '_app_cid';
export const LEGACY_DEVICE_COOKIE_NAME = 'mppsc_did';

// 💾 3. BROWSER LOCAL STORAGE KEYS
export const DEVICE_STORAGE_KEY = '_sec_cid';
export const LEGACY_DEVICE_STORAGE_KEY = 'mppsc_device_id';

// 🔒 4. INDEXEDDB WEBCRYPTO VAULT
export const IDB_DATABASE_NAME = '_app_vault';
export const IDB_STORE_NAME = '_app_c_store';

// ⏱️ 5. SESSION LIFETIME (30 Days in seconds)
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

/**
 * 🛠️ HELPER 1: Universal Auth Token Extractor
 * Next.js server components, API routes ya proxy/middleware se JWT token nikaalta hai.
 * Pehle naya cookie '_app_sid' dekhta hai, agar nahi mila to purana 'mppsc_token' check karta hai.
 * Isse 100% guarantee hoti hai ki existing active users ko koi farak nahi padega!
 */
export function extractAuthToken(cookieStore: {
  get(name: string): { value?: string } | undefined;
}): string | undefined {
  return (
    cookieStore.get(AUTH_COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_AUTH_COOKIE_NAME)?.value
  );
}

/**
 * 🛠️ HELPER 2: Universal Device ID Extractor
 * Incoming request se device binding cookie nikaalta hai (naya '_app_cid' ya fallback 'mppsc_did').
 */
export function extractDeviceCookie(cookieStore: {
  get(name: string): { value?: string } | undefined;
}): string | undefined {
  return (
    cookieStore.get(DEVICE_COOKIE_NAME)?.value ||
    cookieStore.get(LEGACY_DEVICE_COOKIE_NAME)?.value
  );
}

/**
 * 🛠️ HELPER 3: Set Auth & Device Cookies
 * Login time par cookies set karne ka single standardized function.
 */
export function setAuthCookies(
  cookieStore: {
    set(name: string, value: string, options: any): void;
  },
  token: string,
  deviceId?: string | null
): void {
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Primary JWT Session Cookie (HTTP-Only)
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,
    path: '/',
    maxAge: AUTH_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  // 2. Device Binding Cookie (Client accessible so IndexedDB can verify)
  if (deviceId && typeof deviceId === 'string' && deviceId.trim()) {
    cookieStore.set(DEVICE_COOKIE_NAME, deviceId.trim(), {
      httpOnly: false,
      secure: isProd,
      path: '/',
      maxAge: AUTH_COOKIE_MAX_AGE,
      sameSite: 'lax',
    });
  }
}

/**
 * 🛠️ HELPER 4: Delete All Auth & Device Cookies on Logout
 * Logout time par dono naye aur purane cookies ko completely nuke karta hai.
 */
export function deleteAuthCookies(cookieStore: {
  delete(name: string): void;
}): void {
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete(LEGACY_AUTH_COOKIE_NAME);
  cookieStore.delete(DEVICE_COOKIE_NAME);
  cookieStore.delete(LEGACY_DEVICE_COOKIE_NAME);
}
