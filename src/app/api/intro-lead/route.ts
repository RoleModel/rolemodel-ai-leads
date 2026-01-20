import { NextRequest, NextResponse } from 'next/server'

import { buildVisitorMetadata } from '@/lib/geolocation'
import { supabaseServer } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// POST - Capture lead from intro form and create conversation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, chatbotId, submissionTime } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
    }

    // Additional server-side time check (backup for client-side validation)
    if (submissionTime && submissionTime < 2000) {
      // Suspicious - submitted too quickly
      return NextResponse.json({ error: 'Invalid submission' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Block common disposable email domains
    const disposableDomains = [
      'tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com',
      'mailinator.com', 'trashmail.com', 'temp-mail.org', 'getnada.com'
    ]
    const emailDomain = email.split('@')[1]?.toLowerCase()
    if (emailDomain && disposableDomains.includes(emailDomain)) {
      return NextResponse.json({ error: 'Please use a valid email address' }, { status: 400 })
    }

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Build visitor metadata from request headers
    const visitorMetadata = await buildVisitorMetadata(req.headers)

    // Create a conversation with the visitor info pre-populated
    // lead_captured starts as false - AI will qualify and capture the lead during conversation
    const { data: conversation, error: convError } = await supabaseServer
      .from('conversations')
      .insert([
        {
          chatbot_id: activeChatbotId,
          visitor_id: `intro-${Date.now()}`,
          visitor_name: name,
          visitor_email: email,
          lead_captured: false,
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

    // Save the initial greeting message so it appears in chat logs
    const greeting = name
      ? `Hey, ${name}! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`
      : `Hi! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`

    await supabaseServer.from('messages').insert([
      {
        conversation_id: conversation.id,
        role: 'assistant',
        content: greeting,
      },
    ])

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
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
