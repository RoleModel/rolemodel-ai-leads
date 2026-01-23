import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabaseServer = await createClient()
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Chatbot ID is required' }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from('chatbots')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    // If chatbot doesn't exist, return default config
    if (error.code === 'PGRST116') {
      return NextResponse.json({
        chatbot: {
          id,
          name: 'Default Chatbot',
          model: 'gpt-4o-mini',
          business_context: '',
          instructions: '',
          temperature: 0.7,
        },
      })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ chatbot: data })
}

export async function POST(req: NextRequest) {
  try {
    const supabaseServer = await createClient()
    const body = await req.json()
    const { id, model, business_context, instructions, temperature } = body

    if (!id) {
      return NextResponse.json({ error: 'Chatbot ID required' }, { status: 400 })
    }

    // Check if chatbot exists
    const { data: existing } = await supabaseServer
      .from('chatbots')
      .select('id')
      .eq('id', id)
      .single()

    let result
    if (existing) {
      // Update existing chatbot
      result = await supabaseServer
        .from('chatbots')
        .update({
          model: model || 'gpt-4o-mini',
          business_context,
          instructions,
          temperature: temperature || 0.7,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()
    } else {
      // Create new chatbot
      result = await supabaseServer
        .from('chatbots')
        .insert({
          id,
          name: 'Default Chatbot',
          model: model || 'gpt-4o-mini',
          business_context,
          instructions,
          temperature: temperature || 0.7,
        })
        .select()
        .single()
    }

    if (result.error) {
      console.error('Error saving chatbot:', result.error)
      return NextResponse.json({ error: 'Failed to save chatbot' }, { status: 500 })
    }

    return NextResponse.json({ chatbot: result.data, success: true })
  } catch (error) {
    console.error('Error in POST /api/chatbot:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
