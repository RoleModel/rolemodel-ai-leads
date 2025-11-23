import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

const DEFAULT_CHATBOT_ID = "a0000000-0000-0000-0000-000000000001"

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  try {
    // Get total conversations
    const { count: conversationCount } = await supabaseServer
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .eq('chatbot_id', chatbotId)

    // Get total messages
    const { data: conversations } = await supabaseServer
      .from('conversations')
      .select('*')
      .eq('chatbot_id', chatbotId)

    type ConversationType = { message_count: number }
    const totalMessages = (conversations as ConversationType[] | null)?.reduce<number>((sum, conv) => {
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

    const { data: recentConversations } = await supabaseServer
      .from('conversations')
      .select('started_at, message_count')
      .eq('chatbot_id', chatbotId)
      .gte('started_at', sevenDaysAgo.toISOString())
      .order('started_at', { ascending: true })

    // Group by day
    const activityByDay: Record<string, { conversations: number; messages: number }> = {}

    type RecentConvType = { started_at: string; message_count: number }
    (recentConversations as RecentConvType[] | null)?.forEach((conv) => {
      const date = new Date(conv.started_at).toLocaleDateString()
      if (!activityByDay[date]) {
        activityByDay[date] = { conversations: 0, messages: 0 }
      }
      activityByDay[date].conversations += 1
      activityByDay[date].messages += conv.message_count
    })

    return NextResponse.json({
      totalConversations: conversationCount || 0,
      totalMessages,
      totalSources: sourceCount || 0,
      activityByDay,
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
