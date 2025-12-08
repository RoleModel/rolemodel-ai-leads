/**
 * A/B Testing Tracking Utilities
 *
 * Track views, engagements, and conversions for A/B test variants
 */

type EventType = 'view' | 'engagement' | 'conversion' | 'bounce'

interface TrackingOptions {
  path: string
  sessionId?: string
  visitorId?: string
  metadata?: Record<string, unknown>
}

// Check if we're running on localhost (exclude from tracking)
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false
  const hostname = window.location.hostname
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.startsWith('192.168.')
  )
}

// Generate a simple session ID if not provided
function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return ''

  const storageKey = 'ab_test_session_id'
  let sessionId = sessionStorage.getItem(storageKey)

  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    sessionStorage.setItem(storageKey, sessionId)
  }

  return sessionId
}

// Generate a visitor ID for returning visitor tracking
function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return ''

  const storageKey = 'ab_test_visitor_id'
  let visitorId = localStorage.getItem(storageKey)

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    localStorage.setItem(storageKey, visitorId)
  }

  return visitorId
}

/**
 * Track an A/B test event
 */
export async function trackEvent(
  eventType: EventType,
  options: TrackingOptions
): Promise<void> {
  // Skip tracking on localhost
  if (isLocalhost()) return

  try {
    const sessionId = options.sessionId || getOrCreateSessionId()
    const visitorId = options.visitorId || getOrCreateVisitorId()

    await fetch('/api/ab-tests/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: eventType,
        path: options.path,
        session_id: sessionId,
        visitor_id: visitorId,
        metadata: options.metadata || {},
      }),
    })
  } catch {
    // Silently fail - don't interrupt user experience
  }
}

/**
 * Track a page view
 */
export function trackView(path: string, metadata?: Record<string, unknown>): void {
  // Check if we've already tracked this view in this session
  if (typeof window === 'undefined') return

  const viewKey = `ab_test_view_${path}`
  if (sessionStorage.getItem(viewKey)) return

  sessionStorage.setItem(viewKey, 'true')
  void trackEvent('view', { path, metadata })
}

/**
 * Track an engagement (e.g., scroll, click, interaction)
 */
export function trackEngagement(path: string, metadata?: Record<string, unknown>): void {
  // Check if we've already tracked engagement in this session
  if (typeof window === 'undefined') return

  const engagementKey = `ab_test_engagement_${path}`
  if (sessionStorage.getItem(engagementKey)) return

  sessionStorage.setItem(engagementKey, 'true')
  void trackEvent('engagement', { path, metadata })
}

/**
 * Track a conversion (e.g., form submission, sign up)
 */
export function trackConversion(path: string, metadata?: Record<string, unknown>): void {
  // Check if we've already tracked conversion in this session
  if (typeof window === 'undefined') return

  const conversionKey = `ab_test_conversion_${path}`
  if (sessionStorage.getItem(conversionKey)) return

  sessionStorage.setItem(conversionKey, 'true')
  void trackEvent('conversion', { path, metadata })
}

/**
 * Track a bounce (user left without meaningful interaction)
 */
export function trackBounce(path: string, metadata?: Record<string, unknown>): void {
  void trackEvent('bounce', { path, metadata })
}

/**
 * React hook for A/B test tracking
 * Automatically tracks view on mount and provides tracking functions
 */
export function useABTestTracking(path: string) {
  return {
    trackView: () => trackView(path),
    trackEngagement: (metadata?: Record<string, unknown>) =>
      trackEngagement(path, metadata),
    trackConversion: (metadata?: Record<string, unknown>) =>
      trackConversion(path, metadata),
    trackBounce: (metadata?: Record<string, unknown>) => trackBounce(path, metadata),
  }
}
