/**
 * 🌐 CLIENT IP & LOCATION EXTRACTION UTILITY (MPPSC ZEN)
 *
 * Bhai, ye utility actual user ka asli (real) IP aur location nikalne ke liye banayi gayi hai.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * 🚨 THE PROBLEM & DISCOVERY:
 * ─────────────────────────────────────────────────────────────────────────────
 * Jab production Next.js app Vercel pe deployed hoti hai aur uske aage Cloudflare proxy laga hota hai:
 * User (India) -> Cloudflare Edge (Egress Node in Marseille, France) -> Vercel Edge Server
 *
 * 1. Vercel ko lagta hai ki connection Cloudflare ke proxy server (e.g. 162.159.122.90 in Marseille, France)
 *    se aa raha hai! Isliye Vercel 'x-vercel-forwarded-for: 162.159.122.90' aur 'x-vercel-ip-city: Marseille'
 *    set kar deta hai!
 * 2. Pehle code me 'x-vercel-forwarded-for' Priority #1 pe tha, jis wajah se Vercel me har user ka IP
 *    Cloudflare ka proxy IP (162.159.122.90) ban jata tha aur location "Marseille, PAC, IN" dikhti thi!
 *
 * 🛡️ THE PERMANENT BULLETPROOF FIX:
 * 1. Cloudflare IP Range Detection (IPv4 + IPv6 CIDRs): 162.158.0.0/15 samet Cloudflare ke sabhi
 *    IPv4 CIDR ranges aur official IPv6 ranges (including 2a06:98c0::/29) ko bitwise evaluate kiya jata hai.
 * 2. Trusted Proxy Validation: Cloudflare ke headers ('cf-connecting-ip' / 'cf-ray') ko tabhi trust
 *    kiya jata hai jab upstream connection verified Cloudflare proxy range se aayi ho (anti-spoofing).
 * 3. City Header Detection: Agar trusted edge header me city ('cf-ipcity' / 'x-vercel-ip-city') maujood
 *    hai toh 0ms me use karo; warna background me fast HTTPS lookup se user ki asli city & state
 *    (jaise Indore, Madhya Pradesh) nikaalo.
 * 4. Bounded LRU Cache: Memory leak se bachne ke liye 24-hr TTL aur max size eviction policy.
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

// ── Cloudflare Proxy CIDR Definitions ───────────────────────────
// Cloudflare official IPv4 ranges (https://www.cloudflare.com/ips-v4)
const CLOUDFLARE_IPV4_CIDRS = [
  '173.245.48.0/20',
  '103.21.244.0/22',
  '103.22.200.0/22',
  '103.31.4.0/22',
  '141.101.64.0/18',
  '108.162.192.0/18',
  '190.93.240.0/20',
  '188.114.96.0/20',
  '197.234.240.0/22',
  '198.41.128.0/17',
  '162.158.0.0/15', // Covers 162.158.0.0 - 162.159.255.255 (includes 162.159.122.90!)
  '104.16.0.0/13',
  '104.24.0.0/14',
  '172.64.0.0/13',
  '131.0.72.0/22',
];

// Cloudflare official IPv6 ranges (https://www.cloudflare.com/ips-v6)
// Sabhi official prefixes /29 se /32 ke andar aate hain, jo first 32 bits me fit hote hain
const CLOUDFLARE_IPV6_CIDRS = [
  '2400:cb00::/32',
  '2606:4700::/32',
  '2803:f800::/32',
  '2405:b500::/32',
  '2405:8100::/32',
  '2a06:98c0::/29',
  '2c0f:f248::/32',
];

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let num = 0;
  for (let i = 0; i < 4; i++) {
    const part = Number(parts[i]);
    if (isNaN(part) || part < 0 || part > 255) return null;
    num = (num << 8) | part;
  }
  return num >>> 0;
}

function cidrToV4Range(cidr: string): [number, number] {
  const [baseIp, maskStr] = cidr.split('/');
  const maskBits = Number(maskStr);
  const base = ipv4ToInt(baseIp) || 0;
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  const start = (base & mask) >>> 0;
  const end = (start | ~mask) >>> 0;
  return [start, end];
}

function ipv6First32Bits(ip: string): number | null {
  let clean = ip.trim().toLowerCase();
  if (clean.includes('::')) {
    const parts = clean.split('::');
    if (parts.length > 2) return null;
    const left = parts[0] ? parts[0].split(':') : [];
    const right = parts[1] ? parts[1].split(':') : [];
    const missing = 8 - (left.length + right.length);
    if (missing < 0) return null;
    const middle = new Array(missing).fill('0');
    clean = [...left, ...middle, ...right].join(':');
  }
  const groups = clean.split(':');
  if (groups.length !== 8) return null;
  const g0 = parseInt(groups[0], 16);
  const g1 = parseInt(groups[1], 16);
  if (isNaN(g0) || isNaN(g1)) return null;
  return ((g0 << 16) | g1) >>> 0;
}

function cidrToV6First32Range(cidr: string): [number, number] {
  const [baseIp, maskStr] = cidr.split('/');
  const maskBits = Number(maskStr);
  const base = ipv6First32Bits(baseIp) || 0;
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  const start = (base & mask) >>> 0;
  const end = (start | ~mask) >>> 0;
  return [start, end];
}

const CLOUDFLARE_V4_RANGES = CLOUDFLARE_IPV4_CIDRS.map(cidrToV4Range);
const CLOUDFLARE_V6_RANGES = CLOUDFLARE_IPV6_CIDRS.map(cidrToV6First32Range);

/**
 * Check whether an IP is a Cloudflare edge/reverse-proxy IP (Supports complete IPv4 and IPv6 CIDR)
 */
export function isCloudflareProxyIp(ip: string): boolean {
  if (!ip) return false;
  const clean = sanitizeIp(ip).toLowerCase();

  const v4Num = ipv4ToInt(clean);
  if (v4Num !== null) {
    return CLOUDFLARE_V4_RANGES.some(([start, end]) => v4Num >= start && v4Num <= end);
  }

  const v6Num = ipv6First32Bits(clean);
  if (v6Num !== null) {
    return CLOUDFLARE_V6_RANGES.some(([start, end]) => v6Num >= start && v6Num <= end);
  }

  return false;
}

/**
 * Verify whether Cloudflare headers can be trusted.
 *
 * 🚨 SECURITY: Anyone connecting directly to the Vercel/origin server can send spoofed
 * 'cf-ray' and 'cf-connecting-ip' headers.
 * We ONLY trust 'cf-connecting-ip' if the immediate upstream connection to our origin
 * actually originated from a verified Cloudflare proxy IP address!
 */
export function isTrustedCloudflareProxy(headers: HeaderSource): boolean {
  if (!headers) return false;

  const cfRay = getHeaderValue(headers, 'cf-ray');
  if (!cfRay) return false;

  // On Vercel: x-vercel-forwarded-for contains the remote socket IP that connected to Vercel
  const vercelIp = getHeaderValue(headers, 'x-vercel-forwarded-for');
  if (vercelIp) {
    const connectingIp = vercelIp.split(',')[0].trim();
    return isCloudflareProxyIp(connectingIp);
  }

  // Fallback for non-Vercel reverse proxies (Nginx, Docker):
  const realIp = getHeaderValue(headers, 'x-real-ip');
  if (realIp && isCloudflareProxyIp(realIp)) {
    return true;
  }

  const forwardedFor = getHeaderValue(headers, 'x-forwarded-for');
  if (forwardedFor) {
    const hops = forwardedFor.split(',').map((s) => s.trim()).filter(Boolean);
    if (hops.length > 0 && isCloudflareProxyIp(hops[hops.length - 1])) {
      return true;
    }
  }

  return false;
}

/**
 * Check if an IP is a local/private network address
 */
export function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const clean = sanitizeIp(ip).toLowerCase();
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
    clean.startsWith('172.31.') ||
    clean.startsWith('fc') ||
    clean.startsWith('fd') ||
    clean.startsWith('fe80')
  ) {
    return true;
  }
  return false;
}

/**
 * 🎯 Asli User IP nikalne ka main function
 * Hamesha real client IP dega, koi Singapore/France/Proxy IP nahi!
 */
export function getClientIp(headers: HeaderSource): string {
  if (!headers) return '127.0.0.1';

  // 1. Cloudflare True Client IP (Only trusted if validated against Cloudflare proxy connection)
  if (isTrustedCloudflareProxy(headers)) {
    const cfIp = getHeaderValue(headers, 'cf-connecting-ip');
    if (cfIp) {
      const first = sanitizeIp(cfIp.split(',')[0]);
      if (first && !isCloudflareProxyIp(first) && !isPrivateOrLocalIp(first)) {
        return first;
      }
    }

    const trueClientIp = getHeaderValue(headers, 'true-client-ip');
    if (trueClientIp) {
      const first = sanitizeIp(trueClientIp.split(',')[0]);
      if (first && !isCloudflareProxyIp(first) && !isPrivateOrLocalIp(first)) {
        return first;
      }
    }
  }

  // 2. Vercel Edge Forwarded IP
  // Direct Vercel requests (without Cloudflare proxy) me ye direct user ka IP hota hai.
  // PAR agar user Cloudflare ke piche hai, toh Vercel ko Cloudflare ka IP (e.g. 162.159.122.90) dikhta hai.
  // Isliye hum check karte hain ki kahin ye Cloudflare ka proxy IP toh nahi hai!
  const vercelIp = getHeaderValue(headers, 'x-vercel-forwarded-for');
  if (vercelIp) {
    const first = sanitizeIp(vercelIp.split(',')[0]);
    if (first && !isCloudflareProxyIp(first) && !isPrivateOrLocalIp(first)) {
      return first;
    }
  }

  // 3. Nginx / Reverse Proxy Real IP
  const realIp = getHeaderValue(headers, 'x-real-ip');
  if (realIp) {
    const first = sanitizeIp(realIp.split(',')[0]);
    if (first && !isCloudflareProxyIp(first) && !isPrivateOrLocalIp(first)) {
      return first;
    }
  }

  // 4. X-Forwarded-For (Format: "client, proxy1, proxy2")
  // Proxy chain me se pehla non-proxy, non-private public IP dhoondo!
  const forwardedFor = getHeaderValue(headers, 'x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((s) => sanitizeIp(s)).filter(Boolean);
    for (const p of parts) {
      if (!isCloudflareProxyIp(p) && !isPrivateOrLocalIp(p)) {
        return p;
      }
    }
    // Agar sabhi private the ya sirf proxy IPs the, toh pehla non-Cloudflare do
    for (const p of parts) {
      if (!isCloudflareProxyIp(p)) {
        return p;
      }
    }
  }

  // 5. Fallback headers agar sabhi checks fail ho gaye (e.g. local dev ya internal network)
  const cfIp = getHeaderValue(headers, 'cf-connecting-ip');
  if (cfIp && isTrustedCloudflareProxy(headers)) {
    const clean = sanitizeIp(cfIp.split(',')[0]);
    if (clean && !isCloudflareProxyIp(clean)) return clean;
  }
  if (vercelIp) {
    const clean = sanitizeIp(vercelIp.split(',')[0]);
    if (clean && !isCloudflareProxyIp(clean)) return clean;
  }
  if (realIp) {
    const clean = sanitizeIp(realIp.split(',')[0]);
    if (clean && !isCloudflareProxyIp(clean)) return clean;
  }

  return '127.0.0.1';
}

// In-memory cache for resolved public IPs (reduces API calls, 24-hr TTL, bounded LRU eviction)
const geoCache = new Map<string, { location: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_GEO_CACHE_SIZE = 1000;

function getGeoCache(ip: string): string | null {
  const cached = geoCache.get(ip);
  if (!cached) return null;
  if (Date.now() - cached.timestamp >= CACHE_TTL_MS) {
    geoCache.delete(ip);
    return null;
  }
  return cached.location;
}

function setGeoCache(ip: string, location: string): void {
  // Evict expired entries or oldest entry if cache exceeds limit
  if (geoCache.size >= MAX_GEO_CACHE_SIZE) {
    const now = Date.now();
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [k, v] of geoCache.entries()) {
      if (now - v.timestamp >= CACHE_TTL_MS) {
        geoCache.delete(k);
      } else if (v.timestamp < oldestTime) {
        oldestTime = v.timestamp;
        oldestKey = k;
      }
    }

    if (geoCache.size >= MAX_GEO_CACHE_SIZE && oldestKey) {
      geoCache.delete(oldestKey);
    }
  }

  geoCache.set(ip, { location, timestamp: Date.now() });
}

/**
 * 📍 User ki Geo-Location nikalne ka main helper
 *
 * 1. Edge Headers Check:
 *    - Agar Cloudflare 'cf-ipcity' ya Vercel direct edge me trusted city available hai, toh 0ms me return karta hai.
 * 2. Localhost / Private IP:
 *    - Agar localhost/LAN pe ho toh seedha 'Localhost (Dev Network)' dikhata hai.
 * 3. Real User IP GeoIP fallback (ipwho.is):
 *    - Jab request Cloudflare ke standard plan se aati hai (jahan sirf country 'IN' milti hai, city nahi)
 *      ya direct IP resolve karna ho, toh fast HTTPS lookup se user ki Asli Indian City aur State
 *      (e.g., "Indore, Madhya Pradesh, IN") nikal kar 24-hr in-memory bounded cache me store karta hai!
 */
export async function getClientLocation(headers: HeaderSource, explicitIp?: string): Promise<string> {
  const isCloudflare = isTrustedCloudflareProxy(headers);

  // Trusted city header check (Cloudflare: cf-ipcity; Vercel: x-vercel-ip-city)
  const rawCityHeader = isCloudflare
    ? getHeaderValue(headers, 'cf-ipcity')
    : getHeaderValue(headers, 'x-vercel-ip-city');

  const hasTrustedCity = Boolean(rawCityHeader && rawCityHeader.trim().length > 0);

  // Agar edge header me trusted city already maujood hai, toh direct 0ms me return karo
  if (hasTrustedCity) {
    const edgeLoc = getClientLocationFromHeaders(headers);
    if (edgeLoc !== 'Unknown Location') {
      return edgeLoc;
    }
  }

  // 2. IP address nikaalo
  const ip = explicitIp || getClientIp(headers);

  // 3. Localhost check
  if (isPrivateOrLocalIp(ip)) {
    return 'Localhost (Dev Network)';
  }

  // 4. Memory cache check
  const cached = getGeoCache(ip);
  if (cached) {
    return cached;
  }

  // 5. Asli User IP ka GeoIP lookup (Fast HTTPS ipwho.is with 1.2s timeout)
  const fallbackEdgeLoc = getClientLocationFromHeaders(headers);
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200); // 1.2s strict timeout

    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        const parts = [data.city, data.region, data.country_code].filter(Boolean);
        const resolved = parts.length > 0 ? parts.join(', ') : (fallbackEdgeLoc !== 'Unknown Location' ? fallbackEdgeLoc : 'Unknown Location');
        setGeoCache(ip, resolved);
        return resolved;
      }
    }
  } catch {
    // Timeout or network issue, fallback gracefully
  }

  // Agar GeoIP lookup fail hua, par edge header se country/region pata thi (e.g. "IN" ya "MP, IN"):
  if (fallbackEdgeLoc !== 'Unknown Location') {
    return fallbackEdgeLoc;
  }

  return 'Unknown Location';
}

/**
 * ⚡ Synchronous edge-header-only location reader (0ms)
 */
export function getClientLocationFromHeaders(headers: HeaderSource): string {
  if (!headers) return 'Unknown Location';

  const isBehindCloudflare = isTrustedCloudflareProxy(headers);

  // 🚨 CRITICAL: Agar Cloudflare ke piche hain, toh Vercel ke 'x-vercel-ip-*' headers
  // KABHI BHI USE NAHI KARNE! Kyunki Vercel sirf Cloudflare ka proxy datacenter
  // (jaise Marseille, France ya PAC) dekh raha hota hai!
  if (isBehindCloudflare) {
    const rawCity = getHeaderValue(headers, 'cf-ipcity');
    let city: string | null = null;
    if (rawCity) {
      try {
        city = decodeURIComponent(rawCity);
      } catch {
        city = rawCity;
      }
    }
    const region = getHeaderValue(headers, 'cf-region') || getHeaderValue(headers, 'cf-region-code');
    const country = getHeaderValue(headers, 'cf-ipcountry');

    const parts = [city, region, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Unknown Location';
  }

  // Direct Vercel / Nginx (No Cloudflare proxy in front)
  const rawCity = getHeaderValue(headers, 'x-vercel-ip-city');
  let city: string | null = null;
  if (rawCity) {
    try {
      city = decodeURIComponent(rawCity);
    } catch {
      city = rawCity;
    }
  }

  const region = getHeaderValue(headers, 'x-vercel-ip-country-region');
  const country = getHeaderValue(headers, 'x-vercel-ip-country');

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
