import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId')

  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('help_page_settings')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const {
    chatbotId,
    pageTitle,
    pageDescription,
    favicon,
    logo,
    enableThemeSwitch,
    defaultTheme,
    lightPrimaryColor,
    darkPrimaryColor,
    aiInstructions,
  } = body

  if (!chatbotId) {
    return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
  }

  // Upsert (insert or update)
  const { data, error } = await supabase
    .from('help_page_settings')
    .upsert(
      {
        chatbot_id: chatbotId,
        page_title: pageTitle,
        page_description: pageDescription,
        favicon,
        logo,
        enable_theme_switch: enableThemeSwitch,
        default_theme: defaultTheme,
        light_primary_color: lightPrimaryColor,
        dark_primary_color: darkPrimaryColor,
        ai_instructions: aiInstructions,
      },
      {
        onConflict: 'chatbot_id',
      }
    )
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ settings: data })
}
