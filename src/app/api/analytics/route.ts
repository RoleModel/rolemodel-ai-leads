import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

interface VisitorMetadata {
  ip?: string
  geo?: {
    country?: string
    countryCode?: string
    region?: string
    city?: string
    timezone?: string
  }
  userAgent?: string
  referer?: string
  timestamp?: string
}

interface ConversationWithMetadata {
  message_count: number
  visitor_metadata: VisitorMetadata | null
  started_at: string
  lead_captured: boolean
  visitor_name: string | null
  visitor_email: string | null
}

// Drop-off analysis: categorize conversations by engagement level
function categorizeEngagement(messageCount: number): string {
  if (messageCount <= 1) return 'bounced' // Started but didn't engage
  if (messageCount <= 3) return 'low' // Minimal engagement
  if (messageCount <= 6) return 'medium' // Moderate engagement
  return 'high' // Strong engagement
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  try {
    // Get total conversations
    const { count: conversationCount } = await supabaseServer
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId)

    // Get all conversations with metadata
    const { data: conversations } = await supabaseServer
      .from('conversations')
      .select(
        'message_count, visitor_metadata, started_at, lead_captured, visitor_name, visitor_email'
      )
      .eq('chatbot_id', chatbotId)

    const conversationsTyped = conversations as ConversationWithMetadata[] | null

    // Calculate total messages
    const totalMessages =
      conversationsTyped?.reduce<number>((sum, conv) => {
        return sum + (conv.message_count || 0)
      }, 0) || 0

    // Get total sources
    const { count: sourceCount } = await supabaseServer
      .from('sources')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId)

    // Get total leads captured
    const leadsCount =
      conversationsTyped?.filter((conv) => conv.lead_captured).length || 0

    // Get recent activity (last 14 days for better trend visualization)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    // Group by day - initialize all days to ensure continuous line chart
    const activityByDay: Record<
      string,
      { conversations: number; messages: number; leads: number }
    > = {}

    // Pre-populate all days in range
    for (let i = 13; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      activityByDay[dateStr] = { conversations: 0, messages: 0, leads: 0 }
    }

    conversationsTyped?.forEach((conv) => {
      const convDate = new Date(conv.started_at)
      if (convDate >= fourteenDaysAgo) {
        const dateStr = convDate.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        })
        if (activityByDay[dateStr]) {
          activityByDay[dateStr].conversations += 1
          activityByDay[dateStr].messages += conv.message_count || 0
          if (conv.lead_captured) {
            activityByDay[dateStr].leads += 1
          }
        }
      }
    })

    // Convert to array format for Recharts
    const trendData = Object.entries(activityByDay).map(([date, data]) => ({
      date,
      conversations: data.conversations,
      messages: data.messages,
      leads: data.leads,
    }))

    // Aggregate visitor location data (US-focused: states and cities)
    const stateCounts: Record<string, number> = {}
    const cityCounts: Record<string, number> = {}
    const referrerCounts: Record<string, number> = {}
    let visitorsWithLocation = 0
    let visitorsWithMetadata = 0

    // Drop-off and funnel analytics
    const engagementLevels = { bounced: 0, low: 0, medium: 0, high: 0 }
    let contactInfoCaptured = 0 // Conversations where we got name or email

    conversationsTyped?.forEach((conv) => {
      const metadata = conv.visitor_metadata

      // Track engagement levels (drop-off analysis)
      const engagement = categorizeEngagement(conv.message_count || 0)
      engagementLevels[engagement as keyof typeof engagementLevels]++

      // Track contact info capture (separate from lead qualification)
      if (conv.visitor_name || conv.visitor_email) {
        contactInfoCaptured++
      }

      if (metadata) {
        visitorsWithMetadata++

        // Count referrers
        if (metadata.referer) {
          try {
            const url = new URL(metadata.referer)
            const domain = url.hostname.replace('www.', '')
            referrerCounts[domain] = (referrerCounts[domain] || 0) + 1
          } catch {
            referrerCounts[metadata.referer] = (referrerCounts[metadata.referer] || 0) + 1
          }
        }

        const geo = metadata.geo
        if (geo) {
          visitorsWithLocation++

          // Count by state/region (for US focus)
          if (geo.region) {
            stateCounts[geo.region] = (stateCounts[geo.region] || 0) + 1
          }

          // Count by city with state
          if (geo.city) {
            const cityKey = geo.city + (geo.region ? `, ${geo.region}` : '')
            cityCounts[cityKey] = (cityCounts[cityKey] || 0) + 1
          }
        }
      }
    })

    // Sort and get top locations
    const topStates = Object.entries(stateCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }))

    const topCities = Object.entries(cityCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }))

    const topReferrers = Object.entries(referrerCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([referrer, count]) => ({ referrer, count }))

    // Calculate conversion funnel
    const totalConvs = conversationCount || 0
    const funnelAnalytics = {
      // Stage 1: Started conversation
      started: totalConvs,
      // Stage 2: Engaged (sent more than 1 message)
      engaged: totalConvs - engagementLevels.bounced,
      // Stage 3: Contact info captured
      contactCaptured: contactInfoCaptured,
      // Stage 4: Qualified lead
      qualified: leadsCount,
      // Conversion rates
      engagementRate:
        totalConvs > 0
          ? (((totalConvs - engagementLevels.bounced) / totalConvs) * 100).toFixed(1)
          : '0',
      contactCaptureRate:
        totalConvs > 0 ? ((contactInfoCaptured / totalConvs) * 100).toFixed(1) : '0',
      qualificationRate:
        totalConvs > 0 ? ((leadsCount / totalConvs) * 100).toFixed(1) : '0',
    }

    // Engagement radar chart data
    const engagementRadarData = [
      {
        metric: 'Engagement',
        value: parseFloat(funnelAnalytics.engagementRate),
        fullMark: 100,
      },
      {
        metric: 'Contact Capture',
        value: parseFloat(funnelAnalytics.contactCaptureRate),
        fullMark: 100,
      },
      {
        metric: 'Lead Qualification',
        value: parseFloat(funnelAnalytics.qualificationRate),
        fullMark: 100,
      },
      {
        metric: 'High Engagement',
        value: totalConvs > 0 ? (engagementLevels.high / totalConvs) * 100 : 0,
        fullMark: 100,
      },
      {
        metric: 'Medium Engagement',
        value: totalConvs > 0 ? (engagementLevels.medium / totalConvs) * 100 : 0,
        fullMark: 100,
      },
    ]

    return NextResponse.json({
      totalConversations: conversationCount || 0,
      totalMessages,
      totalSources: sourceCount || 0,
      totalLeads: leadsCount,
      trendData,
      visitorAnalytics: {
        visitorsWithMetadata,
        visitorsWithLocation,
        topStates,
        topCities,
        topReferrers,
      },
      // Drop-off analysis
      engagementLevels,
      // Conversion funnel
      funnelAnalytics,
      // Chart data
      engagementRadarData,
    })
  } catch (error: unknown) {
    console.error('Analytics error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
