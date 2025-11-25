// Geolocation service using ip-api.com (free, no API key required)
// Rate limit: 45 requests per minute from an IP address

export interface GeoData {
  ip: string
  country: string
  countryCode: string
  region: string
  regionName: string
  city: string
  zip: string
  lat: number
  lon: number
  timezone: string
  isp: string
  org: string
}

export interface VisitorMetadata {
  ip: string
  geo?: {
    country: string
    countryCode: string
    region: string
    city: string
    timezone: string
  }
  userAgent?: string
  referer?: string
  timestamp: string
}

/**
 * Extract IP address from request headers
 * Handles various proxy/CDN configurations
 */
export function getClientIP(headers: Headers): string {
  // Vercel/Cloudflare/common proxies
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    // Take the first IP (original client)
    return forwardedFor.split(',')[0].trim()
  }

  // Cloudflare
  const cfConnectingIP = headers.get('cf-connecting-ip')
  if (cfConnectingIP) return cfConnectingIP

  // Vercel
  const vercelForwardedFor = headers.get('x-vercel-forwarded-for')
  if (vercelForwardedFor) return vercelForwardedFor

  // Real IP (nginx)
  const realIP = headers.get('x-real-ip')
  if (realIP) return realIP

  return 'unknown'
}

/**
 * Fetch geolocation data for an IP address
 * Uses ip-api.com free tier (no API key needed)
 */
export async function getGeoData(ip: string): Promise<GeoData | null> {
  // Skip for localhost/private IPs
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip === '::1') {
    return null
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,query`, {
      // Short timeout to not block chat responses
      signal: AbortSignal.timeout(2000),
    })

    if (!response.ok) return null

    const data = await response.json()

    if (data.status !== 'success') return null

    return {
      ip: data.query,
      country: data.country,
      countryCode: data.countryCode,
      region: data.region,
      regionName: data.regionName,
      city: data.city,
      zip: data.zip,
      lat: data.lat,
      lon: data.lon,
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
    }
  } catch {
    // Don't fail chat if geolocation fails
    return null
  }
}

/**
 * Build visitor metadata object from request
 */
export async function buildVisitorMetadata(headers: Headers): Promise<VisitorMetadata> {
  const ip = getClientIP(headers)
  const geoData = await getGeoData(ip)

  return {
    ip,
    geo: geoData ? {
      country: geoData.country,
      countryCode: geoData.countryCode,
      region: geoData.regionName,
      city: geoData.city,
      timezone: geoData.timezone,
    } : undefined,
    userAgent: headers.get('user-agent') || undefined,
    referer: headers.get('referer') || undefined,
    timestamp: new Date().toISOString(),
  }
}
