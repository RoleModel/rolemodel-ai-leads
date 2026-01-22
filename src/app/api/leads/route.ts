import { NextRequest, NextResponse } from 'next/server'

import { sendToAlmanac } from '@/lib/almanac/service'
import { supabaseServer } from '@/lib/supabase/server'
import { triggerWebhooks } from '@/lib/webhooks/service'
import type { LeadWebhookData } from '@/lib/webhooks/types'

// GET - List leads with optional date filtering
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  const archived = searchParams.get('archived') // 'true', 'false', or 'all'

  let query = supabaseServer
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  // Apply date filters if provided
  if (startDate) {
    query = query.gte('created_at', startDate)
  }
  if (endDate) {
    // Add one day to endDate to include the entire end date
    const endDateTime = new Date(endDate)
    endDateTime.setDate(endDateTime.getDate() + 1)
    query = query.lt('created_at', endDateTime.toISOString())
  }

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

  return NextResponse.json({ leads: data || [] })
}

// POST - Create a new lead
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { conversation_id, visitor_name, visitor_email, summary } = body

  if (!conversation_id || !summary) {
    return NextResponse.json(
      { error: 'conversation_id and summary are required' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseServer
    .from('leads')
    .insert([
      {
        conversation_id,
        visitor_name,
        visitor_email,
        summary,
      },
    ])
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update conversation to mark lead as captured
  const { data: conversation } = await supabaseServer
    .from('conversations')
    .update({ lead_captured: true })
    .eq('id', conversation_id)
    .select('*, chatbot_id, message_count, visitor_metadata')
    .single()

  // Trigger webhooks for lead.created event
  try {
    const visitorMetadata = conversation?.visitor_metadata as {
      ip?: string
      geo?: {
        city?: string
        region?: string
        country?: string
        timezone?: string
      }
      referer?: string
      userAgent?: string
      utm_source?: string
      utm_campaign?: string
      utm_medium?: string
    } | null

    const webhookData: LeadWebhookData = {
      lead_id: data.id,
      conversation_id,
      visitor: {
        name: visitor_name || undefined,
        email: visitor_email || undefined,
        ip: visitorMetadata?.ip,
        location: visitorMetadata?.geo
          ? {
              city: visitorMetadata.geo.city,
              region: visitorMetadata.geo.region,
              country: visitorMetadata.geo.country,
              timezone: visitorMetadata.geo.timezone,
            }
          : undefined,
        referrer: visitorMetadata?.referer,
        user_agent: visitorMetadata?.userAgent,
      },
      summary: summary as LeadWebhookData['summary'],
      message_count: conversation?.message_count || 0,
      created_at: data.created_at || new Date().toISOString(),
    }

    // Fire and forget - don't block the response
    triggerWebhooks(
      'lead.created',
      webhookData,
      conversation?.chatbot_id || undefined
    ).catch((err) => {
      console.error('Webhook trigger error:', err)
    })

    // Send to Almanac CRM with full summary data (fire and forget)
    sendToAlmanac(
      visitor_name || undefined,
      visitor_email || undefined,
      summary,
      visitorMetadata
    ).catch((err) => {
      console.error('Almanac integration error:', err)
    })
  } catch (webhookError) {
    console.error('Error preparing webhook data:', webhookError)
  }

  return NextResponse.json({ lead: data })
}

// PATCH - Archive or unarchive a lead
export async function PATCH(req: NextRequest) {
  const body = await req.json()
  const { id, is_archived } = body

  if (!id) {
    return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
  }

  const updateData = {
    is_archived: is_archived ?? true,
    archived_at: is_archived ? new Date().toISOString() : null,
  }

  const { data, error } = await supabaseServer
    .from('leads')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ lead: data })
}
