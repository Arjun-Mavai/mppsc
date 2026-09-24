/**
 * 🌐 CLIENT IP & LOCATION EXTRACTION UTILITY (MPPSC ZEN)
 *
 * Bhai, ye utility actual user ka asli (real) IP aur location nikalne ke liye banayi gayi hai.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * ❓ BADA SAWAAL: 'x-forwarded-for' kya output deta hai? Array ya String?
 * ─────────────────────────────────────────────────────────────────────────────
 * 👉 JAWAB: 'headers.get("x-forwarded-for")' hamesha ek **STRING** return karta hai (Array nahi!).
 *
 * ❓ Phir multiple IPs kaise aate hain?
 * 👉 Jab request user ke phone/laptop se nikal kar proxies (jaise Cloudflare, Vercel, Nginx, AWS ALB)
 *    se guzarti hai, toh har proxy pichle IP ke aage comma laga kar apna/incoming IP jod deta hai:
 *    Format: "<ORIGINAL_CLIENT_IP>, <PROXY_1_IP>, <PROXY_2_IP>"
 *    Example: "103.21.244.2, 141.101.105.17, 76.76.21.21"
 *
 * 🚨 PROBLEM (Jo pehle ho rahi thi):
 *    Pehle code me seedha 'headers.get("x-forwarded-for") ?? "127.0.0.1"' likha tha bina split kiye.
 *    Kayi jagah ya toh poora comma-separated string bhej diya ja raha tha, ya downstream service
 *    ne aakhiri IP utha liya jo ki Cloudflare ka SINGAPORE datacenter IP tha!
 *    Isi wajah se Telegram me fake Singapore / Proxy IP dikh raha tha, user ka asli Indian IP nahi!
 *
 * 🛡️ THE BULLETPROOF SOLUTION (Priority Order):
 *    1. 'cf-connecting-ip': Cloudflare directly user ka real IP yahan deta hai (Spoof-proof).
 *    2. 'x-real-ip': Nginx / standard reverse proxy ka single client IP.
 *    3. 'x-forwarded-for': Agar multiple IPs hain, toh FIRST IP (.split(',')[0].trim()) hi asli user hai!
 *    4. 'true-client-ip' / 'x-client-ip': Enterprise CDNs ke fallback headers.
 *    5. Fallback: '127.0.0.1' (Local dev).
 */

export type HeaderSource =
  | Headers
  | { get(name: string): string | null | undefined }
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

/**
 * Universal safe header reader (Works with Web Headers, Next.js ReadonlyHeaders, Request, or Plain Objects)
 */
function getHeaderValue(headers: HeaderSource, name: string): string | null {
  if (!headers) return null;

  // NextRequest / Web API Headers (has .get function)
  if (typeof (headers as any).get === 'function') {
    const val = (headers as any).get(name);
    return typeof val === 'string' ? val : null;
  }

  // Plain JS Object (Node IncomingHttpHeaders)
  if (typeof headers === 'object') {
    const obj = headers as Record<string, any>;
    const val = obj[name] || obj[name.toLowerCase()] || obj[name.toUpperCase()];
    if (Array.isArray(val)) return val[0] || null;
    if (typeof val === 'string') return val;
  }

  return null;
}

/**
 * Clean & sanitize IP address (strips port, handles IPv6 loopback)
 */
function sanitizeIp(rawIp: string): string {
  let clean = rawIp.trim();

  // Agar IPv4 ke sath port laga ho (e.g., "103.21.244.2:49821"), port hatao
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(clean)) {
    clean = clean.split(':')[0].trim();
  }

  // IPv6 localhost ko friendly IPv4 me convert karo
  if (clean === '::1' || clean === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }

  return clean;
}

/**
 * 🎯 Asli User IP nikalne ka main function
 * Hamesha real client IP dega, koi Singapore/Proxy IP nahi!
 */
export function getClientIp(headers: HeaderSource): string {
  if (!headers) return '127.0.0.1';

  // 1. Cloudflare True Client IP (Sabse trusted agar Cloudflare laga hai)
  const cfIp = getHeaderValue(headers, 'cf-connecting-ip');
  if (cfIp) {
    const first = cfIp.split(',')[0].trim();
    if (first) return sanitizeIp(first);
  }

  // 2. Nginx / Reverse Proxy Real IP
  const realIp = getHeaderValue(headers, 'x-real-ip');
  if (realIp) {
    const first = realIp.split(',')[0].trim();
    if (first) return sanitizeIp(first);
  }

  // 3. X-Forwarded-For (Format: "client, proxy1, proxy2")
  // 👉 FIRST ELEMENT IS ALWAYS THE CLIENT IP!
  const forwardedFor = getHeaderValue(headers, 'x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0].trim();
    if (first) return sanitizeIp(first);
  }

  // 4. Fallback CDN headers
  const trueClientIp = getHeaderValue(headers, 'true-client-ip') || getHeaderValue(headers, 'x-client-ip');
  if (trueClientIp) {
    const first = trueClientIp.split(',')[0].trim();
    if (first) return sanitizeIp(first);
  }

  return '127.0.0.1';
}

/**
 * Check if an IP is a local/private network address
 */
function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const clean = ip.trim();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  if (
    clean.startsWith('192.168.') ||
    clean.startsWith('10.') ||
    clean.startsWith('172.16.') ||
    clean.startsWith('172.17.') ||
    clean.startsWith('172.18.') ||
    clean.startsWith('172.19.') ||
    clean.startsWith('172.20.') ||
    clean.startsWith('172.21.') ||
    clean.startsWith('172.22.') ||
    clean.startsWith('172.23.') ||
    clean.startsWith('172.24.') ||
    clean.startsWith('172.25.') ||
    clean.startsWith('172.26.') ||
    clean.startsWith('172.27.') ||
    clean.startsWith('172.28.') ||
    clean.startsWith('172.29.') ||
    clean.startsWith('172.30.') ||
    clean.startsWith('172.31.')
  ) {
    return true;
  }
  return false;
}

// In-memory cache for resolved public IPs (reduces API calls, 24-hr TTL)
const geoCache = new Map<string, { location: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 📍 User ki Geo-Location nikalne ka helper
 *
 * 1. Edge Headers (Cloudflare 'cf-ipcity' / Vercel 'x-vercel-ip-city'):
 *    Production me direct 0ms me milta hai!
 * 2. Localhost / Private IP:
 *    Agar localhost/LAN pe ho toh seedha 'Localhost (Dev Network)' dikhata hai.
 * 3. Public IP (ngrok / direct server without Cloudflare):
 *    Background me fast lightweight lookup (ip-api.com) se city, state, country
 *    resolve karta hai with 1.2s timeout aur memory cache!
 */
export async function getClientLocation(headers: HeaderSource, explicitIp?: string): Promise<string> {
  // 1. Edge Headers Check (Instant 0ms in Production)
  const headerLocation = getClientLocationFromHeaders(headers);
  if (headerLocation !== 'Unknown Location') {
    return headerLocation;
  }

  // 2. IP address nikaalo
  const ip = explicitIp || getClientIp(headers);

  // 3. Localhost check
  if (isPrivateOrLocalIp(ip)) {
    return 'Localhost (Dev Network)';
  }

  // 4. Memory cache check
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.location;
  }

  // 5. Ngrok / Public IP GeoIP fallback
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s strict timeout

    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,city,regionName,countryCode`,
      {
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.status === 'success') {
        const parts = [data.city, data.regionName, data.countryCode].filter(Boolean);
        const resolved = parts.length > 0 ? parts.join(', ') : 'Unknown Location';
        geoCache.set(ip, { location: resolved, timestamp: Date.now() });
        return resolved;
      }
    }
  } catch {
    // Timeout or network issue, fallback gracefully
  }

  return 'Unknown Location';
}

/**
 * ⚡ Synchronous edge-header-only location reader (0ms)
 */
export function getClientLocationFromHeaders(headers: HeaderSource): string {
  if (!headers) return 'Unknown Location';

  const rawCity = getHeaderValue(headers, 'cf-ipcity') || getHeaderValue(headers, 'x-vercel-ip-city');
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  const region = getHeaderValue(headers, 'cf-region') || getHeaderValue(headers, 'x-vercel-ip-country-region');
  const country = getHeaderValue(headers, 'cf-ipcountry') || getHeaderValue(headers, 'x-vercel-ip-country');

  const parts = [city, region, country].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
}

/**
 * 📱 User-Agent parser (Device / OS info friendly format me)
 */
export function getClientUserAgent(headers: HeaderSource): string {
  const ua = getHeaderValue(headers, 'user-agent') || '';
  if (!ua) return 'Unknown Browser';

  const lower = ua.toLowerCase();
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';

  if (lower.includes('firefox')) browser = 'Firefox';
  else if (lower.includes('edg/') || lower.includes('edge')) browser = 'Edge';
  else if (lower.includes('chrome')) browser = 'Chrome';
  else if (lower.includes('safari')) browser = 'Safari';

  if (lower.includes('iphone')) os = 'iPhone / iOS';
  else if (lower.includes('ipad')) os = 'iPad';
  else if (lower.includes('android')) os = 'Android';
  else if (lower.includes('macintosh') || lower.includes('mac os')) os = 'macOS';
  else if (lower.includes('windows')) os = 'Windows';
  else if (lower.includes('linux')) os = 'Linux';

  return `${browser} on ${os}`;
}
