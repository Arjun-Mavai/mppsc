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
 * 🔑 TAPORI EXPLANATION: WebCrypto Asymmetric Key Pair Generator (ECDSA P-256)
 *
 * ❓ KYA HO RAHA HAI YAHAN?
 * Browser apne factory ke andar 2 chaabiyaan (Asymmetric Key Pair) dhaal raha hai:
 *
 * 1. 🔒 PRIVATE KEY (Khufiya Chaabi):
 *    - Parameter dekho: `false` (yani `extractable: false`).
 *    - Iska matlab: Browser is chaabi ko safe tijori me daal dega aur bol dega:
 *      "Isko koi baahar nahi nikaal sakta, chahe DevTools console me hacker apna sar fod le!"
 *    - Is chaabi ka kaam hai: Challenge par digital signature maarna.
 *
 * 2. 🌐 PUBLIC KEY (Duniya ke dekhne wala Thappa):
 *    - Isko hum `exportKey` karke bahar nikaalte hain aur uska `SHA-256` ka juice (hash) nikaalte hain.
 *    - Wahi banta hai apna `deviceId` (`dvid_f89a...`).
 *    - Ye `deviceId` server ke JWT me aur browser ke cookie me chipak jata hai.
 */
async function generateWebCryptoDeviceBinding(): Promise<string> {
  if (isBrowser() && window.crypto && window.crypto.subtle) {
    try {
      // 🛠️ 1. Tijori me ECDSA P-256 ka naya joda banao
      const keyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, // 🔒 extractable: false! DevTools me console.log(key) karoge to bhi raw private key nahi milegi!
        ['sign', 'verify']
      );

      // 🔍 2. Public key ko bahar nikaalo aur SHA-256 hash karo taaki chhota sa unique ID ban sake
      const rawPub = await window.crypto.subtle.exportKey('raw', keyPair.publicKey);
      const hashBuf = await window.crypto.subtle.digest('SHA-256', rawPub);

      // 🔢 3. Hash ke buffer (0s aur 1s) ko human-readable Hex string me badlo
      const hex = Array.from(new Uint8Array(hashBuf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      // 🏷️ 4. Device ID ka naamkaran: "dvid_abc123..."
      const deviceId = 'dvid_' + hex.slice(0, 32);

      // 💾 5. Private Key, Public Key aur Device ID ko IndexedDB ki tijori me band karke lock kar do!
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
 * 🔑 Retrieves the non-extractable private key from IndexedDB vault
 */
export async function getPrivateKeyFromIdb(): Promise<CryptoKey | null> {
  if (!isBrowser() || !window.indexedDB) return null;
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_DB_NAME, 1);
      request.onsuccess = () => {
        const db = request.result;
        try {
          const tx = db.transaction(IDB_STORE_NAME, 'readonly');
          const store = tx.objectStore(IDB_STORE_NAME);
          const req = store.get('private_key');
          req.onsuccess = () => resolve((req.result as CryptoKey) || null);
          req.onerror = () => resolve(null);
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
 * 🔒 TAPORI EXPLANATION: Cryptographic Proof-of-Possession Signature (ECDSA P-256)
 *
 * ❓ BHAI YE FUNCTION KARTA KYA HAI?
 * Simple shabdon me: Browser apni jeb se 'Asli Private Chaabi' nikalta hai aur ek parchi (challenge)
 * par apna digital angutha (signature) laga kar deta hai.
 *
 * Agar koi chor cookie chura ke Incognito me le gaya, toh chor ke paas ye 'Private Chaabi'
 * hoti hi nahi (kyunki ye browser ke hardware/IndexedDB se bahar nikal hi nahi sakti)!
 * Isliye chor ka sign fail ho jayega aur wo dhar liya jayega!
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 🧠 COMPUTER KE BASICS SAMJHO (TextEncoder, Uint8Array, subtle.sign, btoa):
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 1️⃣ `TextEncoder().encode(challenge)`:
 *    - Apne computer ko English ("vault_challenge_123") samajh nahi aati bhai!
 *    - Computer ko sirf NUMBERS (0 se 255) samajh aate hain.
 *    - `TextEncoder` text ke har akshar ko number (ASCII/UTF-8 byte) me badal deta hai.
 *    - Example: "A" ban jata hai 65, "B" ban jata hai 66.
 *
 * 2️⃣ `crypto.subtle.sign()`:
 *    - Yeh browser ka official 'Sarkari Thappa' (Crypto Engine) hai.
 *    - Yeh Private Key aur un numbers ko aapas me aisi khatarnak ganit (Maths) me ghumata hai
 *      ki ek aisi seal ban jaati hai jise duniya ka koi bhi hacker nakli nahi bana sakta!
 *    - Output: Raw Memory Buffer (`ArrayBuffer` - pure 0s aur 1s).
 *
 * 3️⃣ `new Uint8Array(signatureBuffer)`:
 *    - "Uint8Array" ka full form: Unsigned Integer 8-Bit Array.
 *    - Desi bhasha me: "0 se lekar 255 tak ke numbers ka ek lamba dabba (List)".
 *    - Crypto calculation ke baad jo raw memory aati hai, usko numbers ki list me padhne ke liye
 *      Uint8Array ka chashma lagana padta hai.
 *
 * 4️⃣ `btoa(binary)`:
 *    - Full form: "Binary to ASCII" (Base64 Encoder).
 *    - Jo signature ke bytes nikle, wo binary hain. Unko agar direct console ya JSON me bhejoge
 *      to ajeeb se aliens wale symbol ban jayenge (jaise #@).
 *    - `btoa` un sabhi numbers ko clean, readable English characters ("eyJhbGciOi...") me badalta hai
 *      taaki internet pe wire ke upar aram se travel kar sake!
 */
export async function signDeviceChallenge(challenge: string): Promise<string | null> {
  // Agar browser hi nahi hai (Server side hai) ya crypto engine gayab hai, to haath khade kar do
  if (!isBrowser() || !window.crypto?.subtle) return null;

  try {
    // 🔑 Step 1: IndexedDB ke locker se apni 'Private Key' dhoond ke nikalo
    const privateKey = await getPrivateKeyFromIdb();
    if (!privateKey) {
      // Arre re! Private Key nahi mili! Matlab ye fake/Incognito window hai!
      return null;
    }

    // 🔤 Step 2: English challenge text ko numbers (Bytes) me convert karo
    const data = new TextEncoder().encode(challenge);

    // ✍️ Step 3: Browser ke subtle crypto se bolo: "Bhai, Private Key se is par signature maar de!"
    const signatureBuffer = await window.crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      privateKey,
      data
    );

    // 🔢 Step 4: Raw buffer ko 0-255 wale numbers (Uint8Array) me dhaal lo
    const bytes = new Uint8Array(signatureBuffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    // 📦 Step 5: 'btoa' se clean Base64 string bana do taaki network pe bhej sakein
    return btoa(binary);
  } catch (err) {
    console.warn('[DeviceClient] Cryptographic challenge signature failed:', err);
    return null;
  }
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
 * 🛡️ Deep Cryptographic Proof-of-Possession Check:
 * Proves that this browser environment physically contains the non-extractable private key
 * inside IndexedDB, and isn't just an Incognito window or stolen cookie/localStorage clone.
 */
export async function verifyClientVaultPossession(cookieDid?: string | null): Promise<boolean> {
  if (!isBrowser()) return true;
  if (!cookieDid) return true;

  // 1. Fast check: localStorage must match
  if (!validateClientDeviceBinding(cookieDid)) {
    return false;
  }

  // 2. Cryptographic Proof: Can this browser actually sign with the non-extractable private key?
  const testNonce = `vault_challenge_${Date.now()}`;
  const sig = await signDeviceChallenge(testNonce);
  if (!sig) {
    // Private key is missing from IndexedDB!
    return false;
  }

  return true;
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
