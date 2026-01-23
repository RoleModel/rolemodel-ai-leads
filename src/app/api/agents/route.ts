import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

// GET all agents (chatbots)
export async function GET() {
  const supabaseServer = await createClient()

  const { data: agents, error } = await supabaseServer
    .from('chatbots')
    .select('id, name, display_name, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ agents })
}

// POST create new agent
export async function POST(request: Request) {
  const supabaseServer = await createClient()
  const body = await request.json()

  const { name } = body

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  const { data: agent, error } = await supabaseServer
    .from('chatbots')
    .insert({
      name,
      display_name: name,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ agent })
}
