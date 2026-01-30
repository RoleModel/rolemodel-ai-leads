import { NextRequest, NextResponse } from 'next/server'

import { sendToAlmanac } from '@/lib/almanac/service'
import { createClient } from '@/lib/supabase/server'

// GET - List leads with optional date filtering
export async function GET(req: NextRequest) {
  const supabaseServer = await createClient()
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
  const supabaseServer = await createClient()
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

  // Send to Almanac CRM (fire and forget)
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

    sendToAlmanac(
      visitor_name || undefined,
      visitor_email || undefined,
      summary,
      visitorMetadata,
      conversation_id
    ).catch((err) => {
      console.error('Almanac integration error:', err)
    })
  } catch (error) {
    console.error('Error preparing Almanac data:', error)
  }

  return NextResponse.json({ lead: data })
}

// PATCH - Archive or unarchive a lead
export async function PATCH(req: NextRequest) {
  const supabaseServer = await createClient()
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
