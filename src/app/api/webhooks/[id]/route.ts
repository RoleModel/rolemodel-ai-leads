import { NextRequest, NextResponse } from 'next/server'

import {
  deleteWebhook,
  getWebhook,
  getWebhookDeliveries,
  testWebhook,
  updateWebhook,
} from '@/lib/webhooks/service'
import type { WebhookInput } from '@/lib/webhooks/types'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get a single webhook with optional delivery history
export async function GET(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const searchParams = req.nextUrl.searchParams
  const includeDeliveries = searchParams.get('deliveries') === 'true'

  try {
    const webhook = await getWebhook(id)

    if (!webhook) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
    }

    let deliveries = null
    if (includeDeliveries) {
      deliveries = await getWebhookDeliveries(id)
    }

    return NextResponse.json({ webhook, deliveries })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - Update a webhook
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    const body = await req.json()
    const { name, url, secret, events, is_active } = body

    // Validate URL if provided
    if (url) {
      try {
        new URL(url)
      } catch {
        return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
      }
    }

    // Validate events if provided
    if (events) {
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
    }

    const input: Partial<WebhookInput> = {}
    if (name !== undefined) input.name = name
    if (url !== undefined) input.url = url
    if (secret !== undefined) input.secret = secret
    if (events !== undefined) input.events = events
    if (is_active !== undefined) input.is_active = is_active

    const webhook = await updateWebhook(id, input)
    return NextResponse.json({ webhook })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Delete a webhook
export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params

  try {
    await deleteWebhook(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST - Test webhook endpoint
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const searchParams = req.nextUrl.searchParams
  const action = searchParams.get('action')

  if (action === 'test') {
    try {
      const webhook = await getWebhook(id)

      if (!webhook) {
        return NextResponse.json({ error: 'Webhook not found' }, { status: 404 })
      }

      const result = await testWebhook(webhook)
      return NextResponse.json(result)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return NextResponse.json({ error: message }, { status: 500 })
    }
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
