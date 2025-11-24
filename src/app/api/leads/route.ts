import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'

// GET - List leads with optional date filtering
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

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
  await supabaseServer
    .from('conversations')
    .update({ lead_captured: true })
    .eq('id', conversation_id)

  return NextResponse.json({ lead: data })
}
