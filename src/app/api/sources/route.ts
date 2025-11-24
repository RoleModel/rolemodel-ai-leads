import { NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { generateEmbedding } from "@/lib/ai/embeddings"
import type { Database } from "@/lib/supabase/database.types"

const DEFAULT_CHATBOT_ID = "a0000000-0000-0000-0000-000000000001"

type SourceInsert = Database['public']['Tables']['sources']['Insert']

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
    const { title, content, url, type, chatbotId } = body

    console.log('[Sources API] Received request:', { title, hasContent: !!content, url, type, chatbotId })

    if (!content) {
      console.error('[Sources API] Error: Content is required')
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID
    console.log('[Sources API] Using chatbot ID:', activeChatbotId)

    let finalContent = content
    let finalTitle = title

    // If URL is provided, try to fetch and scrape the content
    if (url) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; RoleModelBot/1.0)',
          },
        })

        if (response.ok) {
          const html = await response.text()

          // Basic HTML to text conversion
          // Remove script and style tags
          let textContent = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          textContent = textContent.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')

          // Remove HTML tags
          textContent = textContent.replace(/<[^>]+>/g, ' ')

          // Decode HTML entities
          textContent = textContent.replace(/&nbsp;/g, ' ')
          textContent = textContent.replace(/&amp;/g, '&')
          textContent = textContent.replace(/&lt;/g, '<')
          textContent = textContent.replace(/&gt;/g, '>')
          textContent = textContent.replace(/&quot;/g, '"')

          // Clean up whitespace
          textContent = textContent.replace(/\s+/g, ' ').trim()

          if (textContent && textContent.length > 100) {
            finalContent = textContent
            // Try to extract title from HTML if not provided
            if (!finalTitle) {
              const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
              if (titleMatch && titleMatch[1]) {
                finalTitle = titleMatch[1].trim()
              }
            }
          }
        }
      } catch (fetchError) {
        console.error('Error fetching URL content:', fetchError)
        // Continue with original content if fetch fails
      }
    }

    // Generate embedding (returns number[])
    console.log('[Sources API] Generating embedding for content length:', finalContent.length)
    const embeddingArray = await generateEmbedding(finalContent)
    // Convert to pgvector string format: "[1,2,3]"
    const embedding = JSON.stringify(embeddingArray)
    console.log('[Sources API] Embedding generated, length:', embeddingArray.length)

    // Insert source with metadata containing URL and type
    const metadata: { url?: string; type?: string } = {}
    if (url) metadata.url = url
    if (type) metadata.type = type

    const sourceData: SourceInsert = {
      chatbot_id: activeChatbotId,
      title: finalTitle || null,
      content: finalContent,
      embedding,
      metadata: Object.keys(metadata).length > 0 ? metadata as any : null,
    }

    console.log('[Sources API] Inserting source:', {
      chatbot_id: sourceData.chatbot_id,
      title: sourceData.title,
      contentLength: sourceData.content.length,
      hasEmbedding: !!sourceData.embedding,
      hasMetadata: !!sourceData.metadata
    })

    const { data, error } = await supabaseServer
      .from('sources')
      .insert([sourceData])
      .select()
      .single()

    if (error) {
      console.error('[Sources API] Database error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log('[Sources API] Source created successfully:', data?.id)
    return NextResponse.json({ source: data })
  } catch (error: unknown) {
    console.error('Error creating source:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
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
