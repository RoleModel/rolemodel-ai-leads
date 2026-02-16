import { NextRequest, NextResponse } from 'next/server'

import { generateEmbedding } from '@/lib/ai/embeddings'
import type { Database } from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

type SourceInsert = Database['public']['Tables']['sources']['Insert']

// GET - List all sources
export async function GET(req: NextRequest) {
  const supabaseServer = await createClient()
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

  // Add type to metadata for old sources that don't have it
  const sourcesWithType = data?.map((source) => {
    if (
      source.metadata &&
      typeof source.metadata === 'object' &&
      !Array.isArray(source.metadata)
    ) {
      const metadata = source.metadata as Record<string, unknown>
      if (!metadata.type) {
        // Infer type from other metadata fields
        if (metadata.url) {
          metadata.type = 'website'
        } else if (metadata.filename) {
          metadata.type = 'file'
        } else {
          metadata.type = 'text'
        }
      }
    } else if (!source.metadata) {
      // No metadata at all, assume it's text
      source.metadata = { type: 'text' }
    }
    return source
  })

  return NextResponse.json({ sources: sourcesWithType })
}

// POST - Create new source
export async function POST(req: NextRequest) {
  const supabaseServer = await createClient()
  try {
    const body = await req.json()
    const { title, content, url, type, chatbotId } = body

    console.log('[Sources API] Received request:', {
      title,
      hasContent: !!content,
      url,
      type,
      chatbotId,
    })

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

          // Smart HTML content extraction
          let workingHtml = html

          // Remove script, style, noscript tags first
          workingHtml = workingHtml.replace(
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            ''
          )
          workingHtml = workingHtml.replace(
            /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
            ''
          )
          workingHtml = workingHtml.replace(
            /<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi,
            ''
          )

          // Remove navigation, header, footer, aside elements (common non-content areas)
          workingHtml = workingHtml.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '')
          workingHtml = workingHtml.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '')
          workingHtml = workingHtml.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '')
          workingHtml = workingHtml.replace(/<aside\b[^>]*>[\s\S]*?<\/aside>/gi, '')

          // Remove common navigation/menu class patterns
          workingHtml = workingHtml.replace(
            /<[^>]+(class|id)="[^"]*\b(nav|menu|sidebar|footer|header|breadcrumb|cookie|banner|popup|modal|advertisement|social-share)[^"]*"[^>]*>[\s\S]*?<\/[^>]+>/gi,
            ''
          )

          // Try to extract content from semantic elements first
          let mainContent = ''

          // Priority 1: Look for <main> content
          const mainMatch = workingHtml.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)
          if (mainMatch && mainMatch[1]) {
            mainContent = mainMatch[1]
          }

          // Priority 2: Look for <article> content
          if (!mainContent) {
            const articleMatch = workingHtml.match(
              /<article\b[^>]*>([\s\S]*?)<\/article>/i
            )
            if (articleMatch && articleMatch[1]) {
              mainContent = articleMatch[1]
            }
          }

          // Priority 3: Look for common content container classes
          if (!mainContent) {
            const contentPatterns = [
              /<div[^>]+class="[^"]*\b(content|main-content|page-content|post-content|entry-content|article-content|body-content)[^"]*"[^>]*>([\s\S]*?)<\/div>/i,
              /<section[^>]+class="[^"]*\b(content|main|hero|intro)[^"]*"[^>]*>([\s\S]*?)<\/section>/i,
            ]
            for (const pattern of contentPatterns) {
              const match = workingHtml.match(pattern)
              if (match && match[2]) {
                mainContent = match[2]
                break
              }
            }
          }

          // Fallback: use the cleaned working HTML
          if (!mainContent) {
            mainContent = workingHtml
          }

          // Now extract text from the content
          let textContent = mainContent.replace(/<[^>]+>/g, ' ')

          // Decode HTML entities
          textContent = textContent.replace(/&#(\d+);/g, (_, code) =>
            String.fromCharCode(parseInt(code, 10))
          )
          textContent = textContent.replace(/&#x([0-9a-fA-F]+);/g, (_, code) =>
            String.fromCharCode(parseInt(code, 16))
          )
          textContent = textContent.replace(/&nbsp;/g, ' ')
          textContent = textContent.replace(/&amp;/g, '&')
          textContent = textContent.replace(/&lt;/g, '<')
          textContent = textContent.replace(/&gt;/g, '>')
          textContent = textContent.replace(/&quot;/g, '"')
          textContent = textContent.replace(/&apos;/g, "'")

          // Clean up whitespace - collapse multiple spaces/newlines
          textContent = textContent.replace(/\s+/g, ' ').trim()

          // Remove common noise patterns
          textContent = textContent.replace(/Skip to (main )?content/gi, '')
          textContent = textContent.replace(/Cookie (Policy|Consent|Notice)/gi, '')
          textContent = textContent.replace(/Accept (All )?Cookies/gi, '')
          textContent = textContent.replace(/Privacy Policy/gi, '')
          textContent = textContent.replace(/Terms (of|and) (Service|Use)/gi, '')
          textContent = textContent.trim()

          if (textContent && textContent.length > 100) {
            finalContent = textContent

            // Try to extract title from HTML if not provided
            if (!finalTitle) {
              // First try og:title meta tag (often cleaner)
              const ogTitleMatch = html.match(
                /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i
              )
              if (ogTitleMatch && ogTitleMatch[1]) {
                finalTitle = ogTitleMatch[1].trim()
              } else {
                // Fallback to <title> tag
                const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
                if (titleMatch && titleMatch[1]) {
                  const extractedTitle = titleMatch[1].trim()
                  // Clean up repetitive title patterns like "Services | Company Services | Company"
                  // Take just the first meaningful part
                  const titleParts = extractedTitle.split(/\s*[|–—-]\s*/)
                  if (titleParts.length > 1) {
                    // Use the first part that's not just the company name
                    finalTitle = titleParts[0].trim()
                  } else {
                    finalTitle = extractedTitle
                  }
                }
              }
            }

            // Also try to get meta description for better context
            const metaDescMatch = html.match(
              /<meta[^>]+name="description"[^>]+content="([^"]+)"/i
            )
            const ogDescMatch = html.match(
              /<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i
            )
            const metaDescription = ogDescMatch?.[1] || metaDescMatch?.[1]

            if (metaDescription && metaDescription.length > 50) {
              // Prepend meta description as it's often a good summary
              finalContent = metaDescription.trim() + '\n\n' + finalContent
            }
          }
        }
      } catch (fetchError) {
        console.error('Error fetching URL content:', fetchError)
        // Continue with original content if fetch fails
      }
    }

    // Generate embedding (returns number[])
    console.log(
      '[Sources API] Generating embedding for content length:',
      finalContent.length
    )
    const embeddingArray = await generateEmbedding(finalContent)
    // Convert to pgvector string format: "[1,2,3]"
    const embedding = JSON.stringify(embeddingArray)
    console.log('[Sources API] Embedding generated, length:', embeddingArray.length)

    // Insert source with metadata containing URL and type
    const metadata: Record<string, string> = {}
    if (url) metadata.url = url
    if (type) metadata.type = type

    const sourceData: SourceInsert = {
      chatbot_id: activeChatbotId,
      title: finalTitle || null,
      content: finalContent,
      embedding,
      metadata:
        Object.keys(metadata).length > 0
          ? (metadata as unknown as Database['public']['Tables']['sources']['Insert']['metadata'])
          : null,
    }

    console.log('[Sources API] Inserting source:', {
      chatbot_id: sourceData.chatbot_id,
      title: sourceData.title,
      contentLength: sourceData.content.length,
      hasEmbedding: !!sourceData.embedding,
      hasMetadata: !!sourceData.metadata,
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
  const supabaseServer = await createClient()
  const searchParams = req.nextUrl.searchParams
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Source ID is required' }, { status: 400 })
  }

  const { error } = await supabaseServer.from('sources').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
