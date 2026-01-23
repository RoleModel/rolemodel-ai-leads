import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// GET - List conversations
export async function GET(req: NextRequest) {
  const supabaseServer = await createClient()
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID
  const conversationId = searchParams.get('conversationId')
  const archived = searchParams.get('archived') // 'true', 'false', or 'all'

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
  let query = supabaseServer
    .from('conversations')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('last_message_at', { ascending: false })
    .limit(100)

  // Apply archive filter (default to showing non-archived)
  if (archived === 'true') {
    query = query.eq('is_archived', true)
  } else if (archived !== 'all') {
    // Default: show non-archived only
    query = query.or('is_archived.is.null,is_archived.eq.false')
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversations: data })
}

// PATCH - Archive or unarchive a conversation
export async function PATCH(req: NextRequest) {
  const supabaseServer = await createClient()
  const body = await req.json()
  const { id, is_archived } = body

  if (!id) {
    return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 })
  }

  const updateData = {
    is_archived: is_archived ?? true,
    archived_at: is_archived ? new Date().toISOString() : null,
  }

  const { data, error } = await supabaseServer
    .from('conversations')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ conversation: data })
}
