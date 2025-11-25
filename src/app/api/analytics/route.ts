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
      .select('message_count, visitor_metadata, started_at')
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

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Group by day
    const activityByDay: Record<string, { conversations: number; messages: number }> = {}

    conversationsTyped?.forEach((conv) => {
      const convDate = new Date(conv.started_at)
      if (convDate >= sevenDaysAgo) {
        const date = convDate.toLocaleDateString()
        if (!activityByDay[date]) {
          activityByDay[date] = { conversations: 0, messages: 0 }
        }
        activityByDay[date].conversations += 1
        activityByDay[date].messages += conv.message_count || 0
      }
    })

    // Aggregate visitor location data (US-focused: states and cities)
    const stateCounts: Record<string, number> = {}
    const cityCounts: Record<string, number> = {}
    const referrerCounts: Record<string, number> = {}
    let visitorsWithLocation = 0
    let visitorsWithMetadata = 0

    conversationsTyped?.forEach((conv) => {
      const metadata = conv.visitor_metadata
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

    return NextResponse.json({
      totalConversations: conversationCount || 0,
      totalMessages,
      totalSources: sourceCount || 0,
      activityByDay,
      visitorAnalytics: {
        visitorsWithMetadata,
        visitorsWithLocation,
        topStates,
        topCities,
        topReferrers,
      },
    })
  } catch (error: unknown) {
    console.error('Analytics error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
