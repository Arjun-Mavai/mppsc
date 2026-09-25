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
 * 1. Cloudflare IP Range Detection: 162.158.0.0/15 samet Cloudflare ke sabhi proxy CIDR ranges ko
 *    identify kiya jata hai. KABHI BHI Cloudflare proxy IP ko user IP nahi mana jayega!
 * 2. Cloudflare 'cf-connecting-ip': Jab Cloudflare se request aati hai (cf-ray present), toh
 *    'cf-connecting-ip' me hi user ka ASLI Indian IP hota hai. Yahi Priority #1 hai!
 * 3. Location Detection: Agar request Cloudflare ke piche hai, toh Vercel ke 'x-vercel-ip-*' headers
 *    ko completely ignore kiya jata hai (kyunki wo France/Marseille ke proxy ke hain). Agar Cloudflare
 *    ne 'cf-ipcity' nahi diya, toh real Indian IP se fast HTTPS GeoIP lookup karke Indore/Bhopal/Delhi
 *    resolve kiya jata hai aur 24 hours ke liye cache kiya jata hai!
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

// Cloudflare official IPv6 prefixes (https://www.cloudflare.com/ips-v6)
const CLOUDFLARE_IPV6_PREFIXES = [
  '2400:cb00:',
  '2606:4700:',
  '2803:f800:',
  '2405:b500:',
  '2405:8100:',
  '2a06:98c0:',
  '2c0f:f248:',
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

function cidrToRange(cidr: string): [number, number] {
  const [baseIp, maskStr] = cidr.split('/');
  const maskBits = Number(maskStr);
  const base = ipv4ToInt(baseIp) || 0;
  const mask = maskBits === 0 ? 0 : (~0 << (32 - maskBits)) >>> 0;
  const start = (base & mask) >>> 0;
  const end = (start | ~mask) >>> 0;
  return [start, end];
}

const CLOUDFLARE_RANGES = CLOUDFLARE_IPV4_CIDRS.map(cidrToRange);

/**
 * Check whether an IP is a Cloudflare edge/reverse-proxy IP
 */
export function isCloudflareProxyIp(ip: string): boolean {
  if (!ip) return false;
  const clean = sanitizeIp(ip).toLowerCase();
  const num = ipv4ToInt(clean);
  if (num !== null) {
    return CLOUDFLARE_RANGES.some(([start, end]) => num >= start && num <= end);
  }
  return CLOUDFLARE_IPV6_PREFIXES.some((prefix) => clean.startsWith(prefix));
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

  // 1. Cloudflare True Client IP (Priority #1 jab Cloudflare proxy use ho raha ho)
  // Jab traffic Cloudflare se hokar aata hai (cf-ray exists), Cloudflare 'cf-connecting-ip' header me
  // ASLI user ka IP bhejta hai. Agar ye Cloudflare proxy IP nahi hai, toh yahi 100% asli user IP hai!
  const cfRay = getHeaderValue(headers, 'cf-ray');
  const cfIp = getHeaderValue(headers, 'cf-connecting-ip');
  if (cfRay && cfIp) {
    const first = sanitizeIp(cfIp.split(',')[0]);
    if (first && !isCloudflareProxyIp(first) && !isPrivateOrLocalIp(first)) {
      return first;
    }
  }

  // Cloudflare Enterprise / CDN True-Client-IP header
  const trueClientIp = getHeaderValue(headers, 'true-client-ip');
  if (trueClientIp) {
    const first = sanitizeIp(trueClientIp.split(',')[0]);
    if (first && !isCloudflareProxyIp(first) && !isPrivateOrLocalIp(first)) {
      return first;
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
  if (cfIp) {
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

// In-memory cache for resolved public IPs (reduces API calls, 24-hr TTL)
const geoCache = new Map<string, { location: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/**
 * 📍 User ki Geo-Location nikalne ka main helper
 *
 * 1. Edge Headers Check:
 *    - Agar Cloudflare 'cf-ipcity' ya Vercel direct edge me city available hai, toh 0ms me return karta hai.
 * 2. Localhost / Private IP:
 *    - Agar localhost/LAN pe ho toh seedha 'Localhost (Dev Network)' dikhata hai.
 * 3. Real User IP GeoIP fallback (ipwho.is):
 *    - Jab request Cloudflare ke standard plan se aati hai (jahan sirf country 'IN' milti hai, city nahi)
 *      ya direct IP resolve karna ho, toh fast HTTPS lookup se user ki Asli Indian City aur State
 *      (e.g., "Indore, Madhya Pradesh, IN") nikal kar 24-hr in-memory cache me store karta hai!
 */
export async function getClientLocation(headers: HeaderSource, explicitIp?: string): Promise<string> {
  // 1. Edge Headers Check (Instant 0ms in Production)
  const headerLocation = getClientLocationFromHeaders(headers);

  // Agar edge header se full location (with city & country) mil gayi, toh direct return karo!
  // Note: Agar sirf 2-letter country code mila (jaise "IN" Cloudflare standard plan par)
  // toh hum accurate Indian city aur state nikalne ke liye GeoIP lookup karenge!
  const hasSpecificCity = headerLocation !== 'Unknown Location' && headerLocation.includes(',');
  if (hasSpecificCity) {
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

  // 5. Asli User IP ka GeoIP lookup (Fast HTTPS ipwho.is with 1.2s timeout)
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
        const resolved = parts.length > 0 ? parts.join(', ') : (headerLocation !== 'Unknown Location' ? headerLocation : 'Unknown Location');
        geoCache.set(ip, { location: resolved, timestamp: Date.now() });
        return resolved;
      }
    }
  } catch {
    // Timeout or network issue, fallback gracefully
  }

  // Agar GeoIP lookup fail hua, par edge header se country pata thi (e.g. "IN"):
  if (headerLocation !== 'Unknown Location') {
    return headerLocation;
  }

  return 'Unknown Location';
}

/**
 * ⚡ Synchronous edge-header-only location reader (0ms)
 */
export function getClientLocationFromHeaders(headers: HeaderSource): string {
  if (!headers) return 'Unknown Location';

  const isBehindCloudflare = Boolean(getHeaderValue(headers, 'cf-ray'));

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
