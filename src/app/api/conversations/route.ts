import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// GET - List conversations
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID
  const conversationId = searchParams.get('conversationId')

  // Get specific conversation with messages
  if (conversationId) {
    const { data: conversation } = await supabaseServer
      .from('conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    const { data: messages } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      conversation,
      messages: messages || [],
    })
  }

  // List all conversations
  const { data, error } = await supabaseServer
    .from('conversations')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('last_message_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversations: data })
}
