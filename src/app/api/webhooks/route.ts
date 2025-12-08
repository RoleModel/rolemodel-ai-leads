import { NextRequest, NextResponse } from 'next/server'

import { createWebhook, generateWebhookSecret, getWebhooks } from '@/lib/webhooks/service'
import type { WebhookInput } from '@/lib/webhooks/types'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// GET - List all webhooks
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  try {
    const webhooks = await getWebhooks(chatbotId)
    return NextResponse.json({ webhooks })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Create a new webhook
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, url, secret, events, is_active, chatbot_id } = body

    if (!name || !url || !events || events.length === 0) {
      return NextResponse.json(
        { error: 'name, url, and at least one event are required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(url)
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    // Validate events
    const validEvents = [
      'lead.created',
      'lead.updated',
      'conversation.started',
      'conversation.completed',
    ]
    const invalidEvents = events.filter((e: string) => !validEvents.includes(e))
    if (invalidEvents.length > 0) {
      return NextResponse.json(
        { error: `Invalid events: ${invalidEvents.join(', ')}` },
        { status: 400 }
      )
    }

    const input: WebhookInput = {
      name,
      url,
      secret: secret || undefined,
      events,
      is_active: is_active ?? true,
    }

    const webhook = await createWebhook(input, chatbot_id || DEFAULT_CHATBOT_ID)
    return NextResponse.json({ webhook }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// Generate a new secret (utility endpoint)
export async function PUT() {
  const secret = generateWebhookSecret()
  return NextResponse.json({ secret })
}
