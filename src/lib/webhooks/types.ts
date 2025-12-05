// Webhook configuration types

export type WebhookEvent = 'lead.created' | 'lead.updated' | 'conversation.started' | 'conversation.completed'

export interface Webhook {
  id: string
  chatbot_id: string
  name: string
  url: string
  secret?: string // For HMAC signature verification
  events: WebhookEvent[]
  is_active: boolean
  created_at: string
  updated_at: string
  last_triggered_at?: string
  failure_count: number
}

export interface WebhookDelivery {
  id: string
  webhook_id: string
  event: WebhookEvent
  payload: WebhookPayload
  response_status?: number
  response_body?: string
  delivered_at?: string
  created_at: string
  success: boolean
  error_message?: string
}

// Standard webhook payload that any CRM can ingest
export interface WebhookPayload {
  event: WebhookEvent
  timestamp: string
  data: LeadWebhookData | ConversationWebhookData
}

export interface LeadWebhookData {
  lead_id: string
  conversation_id: string
  visitor: {
    name?: string
    email?: string
    ip?: string
    location?: {
      city?: string
      region?: string
      country?: string
      timezone?: string
    }
    referrer?: string
    user_agent?: string
  }
  summary: {
    interest_level?: string
    budget?: string
    timeline?: string
    needs?: string[]
    pain_points?: string[]
    next_steps?: string[]
    custom_fields?: Record<string, string>
  }
  conversation_summary?: string
  message_count: number
  created_at: string
}

export interface ConversationWebhookData {
  conversation_id: string
  visitor_id: string
  visitor: {
    name?: string
    email?: string
    ip?: string
    location?: {
      city?: string
      region?: string
      country?: string
      timezone?: string
    }
  }
  message_count: number
  started_at: string
  last_message_at?: string
  lead_captured: boolean
}

// Webhook creation/update input
export interface WebhookInput {
  name: string
  url: string
  secret?: string
  events: WebhookEvent[]
  is_active?: boolean
}
