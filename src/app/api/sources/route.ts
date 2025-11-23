import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { generateEmbedding } from "@/lib/ai/embeddings"

const DEFAULT_CHATBOT_ID = "a0000000-0000-0000-0000-000000000001"

// GET - List all sources
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  const { data, error } = await supabaseServer
    .from('sources')
    .select('*')
    .eq('chatbot_id', chatbotId)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ sources: data })
}

// POST - Create new source
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, content, chatbotId } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Generate embedding
    const embedding = await generateEmbedding(content)

    // Insert source
    const { data, error } = await supabaseServer
      .from('sources')
      .insert({
        chatbot_id: activeChatbotId,
        title: title || null,
        content,
        embedding,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ source: data })
  } catch (error: any) {
    console.error('Error creating source:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE - Remove source
export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Source ID is required' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('sources')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
