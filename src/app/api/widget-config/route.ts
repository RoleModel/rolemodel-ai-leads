import { NextRequest, NextResponse } from 'next/server'

import { supabaseServer } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

// CORS headers for widget embed
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders })
}

// GET - Fetch widget configuration
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  const { data, error } = await supabaseServer
    .from('widget_configs')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .single()

  if (error) {
    // If no config exists, return default config
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        {
          config: {
            displayName: 'RoleModel Software',
            initialMessage:
              "Hi! I'm here to help you assess whether custom software might be right for your business. What problem or opportunity is prompting you to consider custom software?",
            theme: 'light',
            primaryColor: '#007BFF',
            buttonColor: '#000000',
            alignment: 'right',
            profilePicture: 'R',
            messagePlaceholder: 'Message...',
            collectFeedback: true,
            regenerateMessages: true,
            dismissibleNotice: '',
            suggestedMessagesPersist: false,
            usePrimaryForHeader: true,
            syncInstructions: true,
            instructions: '',
          },
        },
        { headers: corsHeaders }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500, headers: corsHeaders })
  }

  return NextResponse.json({ config: data.config }, { headers: corsHeaders })
}

// POST - Save widget configuration
export async function POST(req: NextRequest) {
  const body = await req.json()
  const chatbotId = body.chatbotId || DEFAULT_CHATBOT_ID
  const config = body

  // Remove chatbotId from config object if it exists
  delete config.chatbotId

  // Check if config already exists
  const { data: existing } = await supabaseServer
    .from('widget_configs')
    .select('id')
    .eq('chatbot_id', chatbotId)
    .single()

  if (existing) {
    // Update existing config
    const { data, error } = await supabaseServer
      .from('widget_configs')
      .update({
        config,
        updated_at: new Date().toISOString(),
      })
      .eq('chatbot_id', chatbotId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, config: data })
  } else {
    // Insert new config
    const { data, error } = await supabaseServer
      .from('widget_configs')
      .insert([
        {
          chatbot_id: chatbotId,
          config,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, config: data })
  }
}
