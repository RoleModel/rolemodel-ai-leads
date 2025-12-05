import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'
import { buildVisitorMetadata } from '@/lib/geolocation'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// POST - Capture lead from intro form and create conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, chatbotId } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Build visitor metadata from request headers
    const visitorMetadata = await buildVisitorMetadata(req.headers)

    // Create a conversation with the visitor info pre-populated
    const { data: conversation, error: convError } = await supabaseServer
      .from('conversations')
      .insert([
        {
          chatbot_id: activeChatbotId,
          visitor_id: `intro-${Date.now()}`,
          visitor_metadata: {
            ...visitorMetadata,
            name,
            email,
            source: 'intro-form',
          },
        },
      ])
      .select()
      .single()

    if (convError) {
      return NextResponse.json({ error: convError.message }, { status: 500 })
    }

    // Track analytics event for form submission
    await supabaseServer.from('analytics_events').insert([
      {
        chatbot_id: activeChatbotId,
        conversation_id: conversation.id,
        event_type: 'intro_form_submitted',
        metadata: {
          name,
          email,
        },
      },
    ])

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      visitorName: name,
      visitorEmail: email,
    })
  } catch (error) {
    console.error('Intro lead API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
