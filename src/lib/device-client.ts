'use client';

/**
 * 🛡️ Client Device Binding & Anti-Cookie-Theft Guard (WebCrypto + IndexedDB)
 *
 * How it prevents cookie copy-paste attacks (Incognito / cross-device abuse):
 * 1. Generates an Asymmetric ECDSA (P-256) Key Pair using browser's native `window.crypto.subtle`.
 * 2. The Private Key is locked inside `IndexedDB` with `extractable: false`.
 *    - Even if an attacker uses Chrome DevTools console, the browser blocks exporting the private key!
 * 3. The Public Key is exported and hashed (SHA-256) to produce the unique Device ID / Thumbprint.
 * 4. The server embeds this deviceId into the user's signed JWT token.
 * 5. Incognito windows and other devices have completely separate, empty IndexedDB / localStorage sandboxes.
 * 6. If someone copies `mppsc_token` (or even both cookies) into Incognito:
 *    - In Incognito, IndexedDB and localStorage are completely EMPTY.
 *    - Client-side and server-side checks immediately detect the missing device identity.
 *    - The unauthorized session is destroyed and redirected to /login!
 *
 * 100% Backward Compatible:
 * - If an existing user's token does not have `deviceId`, the server allows them normally.
 * - Zero disruption for existing active students.
 */

import {
  DEVICE_STORAGE_KEY,
  DEVICE_COOKIE_NAME,
  IDB_DATABASE_NAME as IDB_DB_NAME,
  IDB_STORE_NAME,
  LEGACY_DEVICE_STORAGE_KEY,
  LEGACY_DEVICE_COOKIE_NAME,
} from '@/lib/auth-constants';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Lightweight IndexedDB persistence for WebCrypto Keys & Device ID
 */
async function getFromIdb(): Promise<string | null> {
  if (!isBrowser() || !window.indexedDB) return null;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readonly');
          const store = tx.objectStore(IDB_STORE_NAME);
          const getReq = store.get('device_id');
          getReq.onsuccess = () => resolve((getReq.result as string) || null);
          getReq.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/**
 * Saves both the WebCrypto KeyPair and Device ID in IndexedDB
 */
async function saveKeyPairToIdb(keyPair: CryptoKeyPair, deviceId: string): Promise<void> {
  if (!isBrowser() || !window.indexedDB) return;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
          const store = tx.objectStore(IDB_STORE_NAME);
          store.put(deviceId, 'device_id');
          store.put(keyPair.privateKey, 'private_key');
          store.put(keyPair.publicKey, 'public_key');
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function saveDeviceIdToIdbOnly(deviceId: string): Promise<void> {
  if (!isBrowser() || !window.indexedDB) return;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          db.createObjectStore(IDB_STORE_NAME);
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
          const store = tx.objectStore(IDB_STORE_NAME);
          store.put(deviceId, 'device_id');
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

async function removeFromIdb(): Promise<void> {
  if (!isBrowser() || !window.indexedDB) return;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_DB_NAME, 1);
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
          const store = tx.objectStore(IDB_STORE_NAME);
          store.delete('device_id');
          store.delete('private_key');
          store.delete('public_key');
          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      };
      request.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

/**
 * 🔑 WebCrypto Subtle: Generates an Asymmetric ECDSA (P-256) Key Pair.
 * The Private Key has `extractable: false` so browser forbids DevTools export!
 * The Public Key is SHA-256 digested into a cryptographic Device ID.
 */
async function generateWebCryptoDeviceBinding(): Promise<string> {
  if (isBrowser() && window.crypto && window.crypto.subtle) {
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, // 🔒 NOT extractable! Even DevTools console cannot export private key!
        ['sign', 'verify']
      );

      // Export public key to create a cryptographic thumbprint
      const rawPub = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
      const hashBuf = await window.crypto.subtle.digest('SHA-256', rawPub);
      const hex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const deviceId = 'dvid_' + hex.slice(0, 32);

      // Save Private Key, Public Key, and Device ID in IndexedDB
      await saveKeyPairToIdb(keyPair, deviceId);
      return deviceId;
    } catch (e) {
      console.warn('WebCrypto subtle fallback triggered:', e);
    }
  }

  // Fallback if subtle crypto is unavailable
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const id = 'dvid_' + crypto.randomUUID().replace(/-/g, '');
    await saveDeviceIdToIdbOnly(id);
    return id;
  }

  const id = 'dvid_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  await saveDeviceIdToIdbOnly(id);
  return id;
}

/**
 * Sync cookie `_app_cid` so server components & middleware can inspect it
 */
function setDeviceCookie(deviceId: string) {
  if (!isBrowser()) return;
  const isHttps = window.location.protocol === 'https:';
  const maxAge = 60 * 60 * 24 * 30; // 30 days
  document.cookie = `${DEVICE_COOKIE_NAME}=${encodeURIComponent(deviceId)}; path=/; max-age=${maxAge}; SameSite=Lax${isHttps ? '; Secure' : ''}`;
}

/**
 * Get or create the unique hardware/profile Device ID for this browser
 */
export async function getOrCreateDeviceId(): Promise<string> {
  if (!isBrowser()) return '';

  // 1. Fast read from localStorage (with legacy fallback)
  let deviceId = localStorage.getItem(DEVICE_STORAGE_KEY) || localStorage.getItem(LEGACY_DEVICE_STORAGE_KEY);

  // 2. Fallback read from IndexedDB
  if (!deviceId) {
    deviceId = await getFromIdb();
    if (deviceId) {
      localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
    }
  }

  // 3. If still not found, generate new WebCrypto Asymmetric Key Pair
  if (!deviceId) {
    deviceId = await generateWebCryptoDeviceBinding();
    localStorage.setItem(DEVICE_STORAGE_KEY, deviceId);
  }

  // Always keep cookie in sync
  setDeviceCookie(deviceId);

  return deviceId;
}

/**
 * Synchronous local device ID lookup from localStorage
 */
export function getLocalDeviceId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(DEVICE_STORAGE_KEY);
}

/**
 * Validates whether the browser has legitimate local storage for the given device ID cookie.
 * If cookie exists but localStorage/IndexedDB is completely empty, someone pasted the cookie
 * into Incognito or another browser profile!
 */
export function validateClientDeviceBinding(cookieDid?: string | null): boolean {
  if (!isBrowser()) return true; // Server-side or non-browser environments allow
  if (!cookieDid) return true; // No device cookie set yet

  const localId = getLocalDeviceId();
  if (!localId) {
    // Cookie exists, but localStorage is completely empty! (Copied session into Incognito)
    return false;
  }

  return localId === cookieDid;
}

/**
 * Clears device data on logout
 */
export async function clearLocalDeviceData(): Promise<void> {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(DEVICE_STORAGE_KEY);
    localStorage.removeItem(LEGACY_DEVICE_STORAGE_KEY);
    const isHttps = window.location.protocol === 'https:';
    document.cookie = `${DEVICE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${isHttps ? '; Secure' : ''}`;
    document.cookie = `${LEGACY_DEVICE_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${isHttps ? '; Secure' : ''}`;
    await removeFromIdb();
  } catch {
    // ignore
  }
}
