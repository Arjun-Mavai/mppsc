/**
 * 🌐 CLIENT IP & LOCATION EXTRACTION UTILITY (MPPSC ZEN)
 *
 * Simple, fast, and reliable IP & Location extraction.
 *
 * 1. Cloudflare: When behind Cloudflare (cf-ray exists), 'cf-connecting-ip'
 *    is the authoritative client IP sent directly by Cloudflare edge.
 * 2. Vercel/Nginx: Fallback to 'x-real-ip', 'x-forwarded-for' (first hop), or 'x-vercel-forwarded-for'.
 * 3. Location: Cloudflare headers ('cf-ipcity', 'cf-ipcountry') or lightweight HTTPS
 *    GeoIP lookup (ipwho.is) with in-memory caching.
 */

export type HeaderSource =
  | Headers
  | { get(name: string): string | null | undefined }
  | Record<string, string | string[] | undefined>
  | undefined
  | null;

/**
 * Universal safe header reader
 */
function getHeaderValue(headers: HeaderSource, name: string): string | null {
  if (!headers) return null;
  if (typeof (headers as any).get === 'function') {
    const val = (headers as any).get(name);
    return typeof val === 'string' ? val : null;
  }
  if (typeof headers === 'object') {
    const obj = headers as Record<string, any>;
    const val = obj[name] || obj[name.toLowerCase()] || obj[name.toUpperCase()];
    if (Array.isArray(val)) return val[0] || null;
    if (typeof val === 'string') return val;
  }
  return null;
}

/**
 * Sanitize IP (strips port, normalizes loopback)
 */
function sanitizeIp(rawIp: string): string {
  let clean = rawIp.trim();
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(clean)) {
    clean = clean.split(':')[0].trim();
  }
  if (clean === '::1' || clean === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  return clean;
}

/**
 * Check if IP is private/local
 */
export function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const clean = sanitizeIp(ip).toLowerCase();
  if (clean === '127.0.0.1' || clean === '::1' || clean === 'localhost') return true;
  return (
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
  );
}

/**
 * 🎯 Asli User IP nikalne ka main function
 */
export function getClientIp(headers: HeaderSource): string {
  if (!headers) return '127.0.0.1';

  // 1. Cloudflare True Client IP (Priority #1)
  // Cloudflare sets 'cf-connecting-ip' with the actual client IP connecting to Cloudflare
  const cfIp = getHeaderValue(headers, 'cf-connecting-ip') || getHeaderValue(headers, 'true-client-ip');
  if (cfIp) {
    const first = sanitizeIp(cfIp.split(',')[0]);
    if (first) return first;
  }

  // 2. Nginx / Standard Reverse Proxy
  const realIp = getHeaderValue(headers, 'x-real-ip');
  if (realIp) {
    const first = sanitizeIp(realIp.split(',')[0]);
    if (first) return first;
  }

  // 3. X-Forwarded-For (Client is always first element)
  const forwardedFor = getHeaderValue(headers, 'x-forwarded-for');
  if (forwardedFor) {
    const first = sanitizeIp(forwardedFor.split(',')[0]);
    if (first) return first;
  }

  // 4. Vercel Edge Forwarded IP (Direct traffic to Vercel without Cloudflare)
  const vercelIp = getHeaderValue(headers, 'x-vercel-forwarded-for');
  if (vercelIp) {
    const first = sanitizeIp(vercelIp.split(',')[0]);
    if (first) return first;
  }

  return '127.0.0.1';
}

// In-memory cache for resolved locations (24-hr TTL, max 500 entries)
const geoCache = new Map<string, { location: string; timestamp: number }>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

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
  if (geoCache.size >= 500) {
    const iter = geoCache.keys();
    for (let i = 0; i < 50; i++) {
      const k = iter.next().value;
      if (k) geoCache.delete(k);
    }
  }
  geoCache.set(ip, { location, timestamp: Date.now() });
}

/**
 * 📍 User ki Geo-Location nikalne ka helper
 */
export async function getClientLocation(headers: HeaderSource, explicitIp?: string): Promise<string> {
  // 1. Direct Edge Header Check (0ms)
  const headerLocation = getClientLocationFromHeaders(headers);

  // Agar edge header me City aur Country dono mil gaye (e.g. "Indore, MP, IN")
  const isCloudflare = Boolean(getHeaderValue(headers, 'cf-ray'));
  const hasCityHeader = isCloudflare
    ? Boolean(getHeaderValue(headers, 'cf-ipcity'))
    : Boolean(getHeaderValue(headers, 'x-vercel-ip-city'));

  if (hasCityHeader && headerLocation !== 'Unknown Location') {
    return headerLocation;
  }

  // 2. IP address
  const ip = explicitIp || getClientIp(headers);
  if (isPrivateOrLocalIp(ip)) {
    return 'Localhost (Dev Network)';
  }

  // 3. Cache lookup
  const cached = getGeoCache(ip);
  if (cached) return cached;

  // 4. Fast HTTPS GeoIP lookup (ipwho.is)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

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
        setGeoCache(ip, resolved);
        return resolved;
      }
    }
  } catch {
    // Graceful fallback
  }

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

  // Direct Vercel / Nginx (No Cloudflare proxy)
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
 * 📱 User-Agent parser
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
