import crypto from 'crypto'

import { supabaseServer } from '@/lib/supabase/server'

import type {
  ConversationWebhookData,
  LeadWebhookData,
  Webhook,
  WebhookDelivery,
  WebhookEvent,
  WebhookInput,
  WebhookPayload,
} from './types'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// Generate HMAC signature for webhook payload
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

// Deliver webhook to endpoint
async function deliverWebhook(
  webhook: Webhook,
  payload: WebhookPayload
): Promise<{ success: boolean; status?: number; error?: string }> {
  const payloadString = JSON.stringify(payload)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Webhook-Event': payload.event,
    'X-Webhook-Timestamp': payload.timestamp,
  }

  // Add signature if secret is configured
  if (webhook.secret) {
    headers['X-Webhook-Signature'] =
      `sha256=${generateSignature(payloadString, webhook.secret)}`
  }

  try {
    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payloadString,
      signal: AbortSignal.timeout(30000), // 30 second timeout
    })

    return {
      success: response.ok,
      status: response.status,
      error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// Get all webhooks for a chatbot
export async function getWebhooks(
  chatbotId: string = DEFAULT_CHATBOT_ID
): Promise<Webhook[]> {
  const { data, error } = await supabaseServer
    .from('webhooks')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch webhooks: ${error.message}`)
  }

  return (data || []) as Webhook[]
}

// Get a single webhook by ID
export async function getWebhook(id: string): Promise<Webhook | null> {
  const { data, error } = await supabaseServer
    .from('webhooks')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw new Error(`Failed to fetch webhook: ${error.message}`)
  }

  return data as Webhook
}

// Create a new webhook
export async function createWebhook(
  input: WebhookInput,
  chatbotId: string = DEFAULT_CHATBOT_ID
): Promise<Webhook> {
  const { data, error } = await supabaseServer
    .from('webhooks')
    .insert([
      {
        chatbot_id: chatbotId,
        name: input.name,
        url: input.url,
        secret: input.secret || null,
        events: input.events,
        is_active: input.is_active ?? true,
        failure_count: 0,
      },
    ])
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create webhook: ${error.message}`)
  }

  return data as Webhook
}

// Update an existing webhook
export async function updateWebhook(
  id: string,
  input: Partial<WebhookInput>
): Promise<Webhook> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.name !== undefined) updateData.name = input.name
  if (input.url !== undefined) updateData.url = input.url
  if (input.secret !== undefined) updateData.secret = input.secret || null
  if (input.events !== undefined) updateData.events = input.events
  if (input.is_active !== undefined) updateData.is_active = input.is_active

  const { data, error } = await supabaseServer
    .from('webhooks')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update webhook: ${error.message}`)
  }

  return data as Webhook
}

// Delete a webhook
export async function deleteWebhook(id: string): Promise<void> {
  const { error } = await supabaseServer.from('webhooks').delete().eq('id', id)

  if (error) {
    throw new Error(`Failed to delete webhook: ${error.message}`)
  }
}

// Get webhook delivery history
export async function getWebhookDeliveries(
  webhookId: string,
  limit: number = 50
): Promise<WebhookDelivery[]> {
  const { data, error } = await supabaseServer
    .from('webhook_deliveries')
    .select('*')
    .eq('webhook_id', webhookId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch deliveries: ${error.message}`)
  }

  return (data || []).map((d: any) => ({
    ...d,
    event: d.event as WebhookEvent,
    payload: d.payload as unknown as WebhookPayload,
  })) as WebhookDelivery[]
}

// Record a webhook delivery attempt
async function recordDelivery(
  webhookId: string,
  event: WebhookEvent,
  payload: WebhookPayload,
  result: { success: boolean; status?: number; error?: string }
): Promise<void> {
  await supabaseServer.from('webhook_deliveries').insert({
    webhook_id: webhookId,
    event: event as string,
    payload: payload as unknown as import('@/lib/supabase/database.types').Json,
    response_status: result.status ?? null,
    success: result.success,
    error_message: result.error ?? null,
    delivered_at: result.success ? new Date().toISOString() : null,
  })

  // Update webhook stats
  if (result.success) {
    await supabaseServer
      .from('webhooks')
      .update({
        last_triggered_at: new Date().toISOString(),
        failure_count: 0,
      })
      .eq('id', webhookId)
  } else {
    // Increment failure count manually since RPC may not be defined
    const { data: webhook } = await supabaseServer
      .from('webhooks')
      .select('failure_count')
      .eq('id', webhookId)
      .single()

    if (webhook) {
      await supabaseServer
        .from('webhooks')
        .update({
          failure_count: (webhook.failure_count || 0) + 1,
        })
        .eq('id', webhookId)
    }
  }
}

// Trigger webhooks for an event
export async function triggerWebhooks(
  event: WebhookEvent,
  data: LeadWebhookData | ConversationWebhookData,
  chatbotId: string = DEFAULT_CHATBOT_ID
): Promise<void> {
  // Get all active webhooks subscribed to this event
  const { data: webhooks, error } = await supabaseServer
    .from('webhooks')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .eq('is_active', true)
    .contains('events', [event])

  if (error || !webhooks || webhooks.length === 0) {
    return // No webhooks to trigger
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  }

  // Deliver to all matching webhooks in parallel
  await Promise.all(
    (webhooks as Webhook[]).map(async (webhook) => {
      const result = await deliverWebhook(webhook, payload)
      await recordDelivery(webhook.id, event, payload, result)
    })
  )
}

// Test webhook endpoint
export async function testWebhook(
  webhook: Webhook
): Promise<{ success: boolean; status?: number; error?: string }> {
  const testPayload: WebhookPayload = {
    event: 'lead.created',
    timestamp: new Date().toISOString(),
    data: {
      lead_id: 'test-lead-id',
      conversation_id: 'test-conversation-id',
      visitor: {
        name: 'Test User',
        email: 'test@example.com',
        location: {
          city: 'San Francisco',
          region: 'CA',
          country: 'United States',
        },
      },
      summary: {
        interest_level: 'high',
        needs: ['Product demo', 'Pricing information'],
      },
      message_count: 5,
      created_at: new Date().toISOString(),
    } as LeadWebhookData,
  }

  return deliverWebhook(webhook, testPayload)
}

// Generate a random webhook secret
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString('hex')
}
