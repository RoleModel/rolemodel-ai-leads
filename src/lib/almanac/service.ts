/**
 * Almanac CRM Integration Service
 *
 * Sends lead data to the Almanac CRM when a lead is created.
 * Uses ALMANAC_CONTACT_API_URL and ALMANAC_API_KEY environment variables.
 */

import type { LeadSummaryData } from '@/components/leads-page/LeadSummary'

export interface AlmanacContact {
  name?: string
  phone?: string
  email?: string
  budget?: string
  project_description?: string
  country?: string
  city?: string
  timezone?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
}

export interface VisitorMetadata {
  ip?: string
  geo?: {
    city?: string
    region?: string
    country?: string
    timezone?: string
  }
  referer?: string
  userAgent?: string
  utm_source?: string
  utm_campaign?: string
  utm_medium?: string
}

interface AlmanacResponse {
  success: boolean
  error?: string
}

/**
 * Build Almanac contact payload from lead data
 * Only includes fields that have values
 */
export function buildAlmanacPayload(
  visitorName: string | undefined,
  visitorEmail: string | undefined,
  leadSummary: LeadSummaryData | null | undefined,
  visitorMetadata: VisitorMetadata | null | undefined
): AlmanacContact {
  const contact: AlmanacContact = {}

  // Contact information - prefer from summary, fallback to visitor
  contact.name = leadSummary?.contactInfo?.name || visitorName
  contact.email = leadSummary?.contactInfo?.email || visitorEmail

  if (leadSummary?.contactInfo?.phone) {
    contact.phone = leadSummary.contactInfo.phone
  }

  // Budget
  if (leadSummary?.budget?.range) {
    contact.budget = leadSummary.budget.range
  }

  // Project description from need/problem/pain points
  const projectParts: string[] = []
  if (leadSummary?.need?.problem) {
    projectParts.push(leadSummary.need.problem)
  }
  if (leadSummary?.need?.painPoints && leadSummary.need.painPoints.length > 0) {
    projectParts.push(`Pain points: ${leadSummary.need.painPoints.join(', ')}`)
  }
  if (leadSummary?.need?.currentSolution) {
    projectParts.push(`Current solution: ${leadSummary.need.currentSolution}`)
  }
  if (projectParts.length > 0) {
    contact.project_description = projectParts.join('. ')
  }

  // Location from visitor metadata
  if (visitorMetadata?.geo?.country) {
    contact.country = visitorMetadata.geo.country
  }
  if (visitorMetadata?.geo?.city) {
    contact.city = visitorMetadata.geo.city
  }
  if (visitorMetadata?.geo?.timezone) {
    contact.timezone = visitorMetadata.geo.timezone
  }

  // UTM parameters from visitor metadata
  if (visitorMetadata?.utm_source) {
    contact.utm_source = visitorMetadata.utm_source
  }
  if (visitorMetadata?.utm_campaign) {
    contact.utm_campaign = visitorMetadata.utm_campaign
  }
  if (visitorMetadata?.utm_medium) {
    contact.utm_medium = visitorMetadata.utm_medium
  }

  // Remove undefined values for cleaner payload
  return Object.fromEntries(
    Object.entries(contact).filter(([, v]) => v !== undefined)
  ) as AlmanacContact
}

/**
 * Send lead to Almanac CRM
 * Returns success status - failures are logged but don't throw
 */
export async function sendToAlmanac(
  visitorName: string | undefined,
  visitorEmail: string | undefined,
  leadSummary: LeadSummaryData | null | undefined,
  visitorMetadata: VisitorMetadata | null | undefined
): Promise<AlmanacResponse> {
  const apiUrl = process.env.ALMANAC_CONTACT_API_URL
  const apiKey = process.env.ALMANAC_API_KEY

  // Skip if not configured
  if (!apiUrl || !apiKey) {
    console.log('[Almanac] Integration not configured - skipping (missing ALMANAC_CONTACT_API_URL or ALMANAC_API_KEY)')
    return { success: true } // Not an error, just not configured
  }

  // Validate URL
  try {
    new URL(apiUrl)
  } catch {
    console.error('[Almanac] Invalid API URL:', apiUrl)
    return { success: false, error: 'Invalid API URL configuration' }
  }

  const payload = buildAlmanacPayload(visitorName, visitorEmail, leadSummary, visitorMetadata)

  // Skip if we don't have minimum required data (at least name or email)
  if (!payload.name && !payload.email) {
    console.log('[Almanac] No name or email available - skipping')
    return { success: true }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Almanac] Sending lead to:', apiUrl)
    console.log('[Almanac] Payload:', JSON.stringify(payload, null, 2))
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error(`[Almanac] API error: ${response.status} - ${errorText}`)
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`,
      }
    }

    console.log('[Almanac] Lead sent successfully:', payload.email || payload.name)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Almanac] Failed to send lead:', errorMessage)
    if (error instanceof Error && error.cause) {
      console.error('[Almanac] Error cause:', error.cause)
    }
    return {
      success: false,
      error: errorMessage,
    }
  }
}
