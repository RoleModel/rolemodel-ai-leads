import { NextRequest, NextResponse } from 'next/server'

import { generateEmbedding } from '@/lib/ai/embeddings'
import { categorizeUrl, getFramerUrls, scrapePage } from '@/lib/framer/scraper'
import type { Database } from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

type SourceInsert = Database['public']['Tables']['sources']['Insert']

export interface SyncOptions {
  framerUrl: string
  chatbotId?: string
  includeBlog?: boolean
  includeCaseStudies?: boolean
  includePages?: boolean
  skipExisting?: boolean
}

export interface SyncResult {
  total: number
  created: number
  skipped: number
  failed: number
  errors: string[]
}

// GET - Check sync status / get existing Framer sources
export async function GET(req: NextRequest) {
  const supabaseServer = await createClient()
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  // Get sources that have a Framer URL in metadata
  const { data, error } = await supabaseServer
    .from('sources')
    .select('id, title, metadata')
    .eq('chatbot_id', chatbotId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Filter to only Framer sources
  const framerSources = data?.filter((source: any) => {
    const metadata = source.metadata as Record<string, unknown> | null
    const url = metadata?.url as string | undefined
    return url?.includes('.framer.app') || url?.includes('framer.website')
  })

  return NextResponse.json({
    count: framerSources?.length || 0,
    sources: framerSources,
  })
}

// POST - Trigger sync from Framer
export async function POST(req: NextRequest) {
  const supabaseServer = await createClient()
  try {
    const body = await req.json()
    const {
      framerUrl,
      chatbotId = DEFAULT_CHATBOT_ID,
      includeBlog = true,
      includeCaseStudies = true,
      includePages = true,
      skipExisting = true,
    }: SyncOptions = body

    if (!framerUrl) {
      return NextResponse.json({ error: 'Framer URL is required' }, { status: 400 })
    }

    console.log('[Framer Sync] Starting sync for:', framerUrl)

    // Get existing source URLs to avoid duplicates
    const existingUrls = new Set<string>()
    if (skipExisting) {
      const { data: existingSources } = await supabaseServer
        .from('sources')
        .select('metadata')
        .eq('chatbot_id', chatbotId)

      existingSources?.forEach((source: any) => {
        const metadata = source.metadata as Record<string, unknown> | null
        const url = metadata?.url as string | undefined
        if (url) existingUrls.add(url)
      })
      console.log('[Framer Sync] Found', existingUrls.size, 'existing source URLs')
    }

    // Get URLs from sitemap
    const urls = await getFramerUrls(framerUrl, {
      includeBlog,
      includeCaseStudies,
      includePages,
    })

    console.log('[Framer Sync] Found', urls.length, 'URLs to process')

    const result: SyncResult = {
      total: urls.length,
      created: 0,
      skipped: 0,
      failed: 0,
      errors: [],
    }

    // Process URLs in batches to avoid overwhelming the server
    const BATCH_SIZE = 5
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE)

      await Promise.all(
        batch.map(async (urlItem) => {
          const url = urlItem.loc

          // Skip if already exists
          if (existingUrls.has(url)) {
            result.skipped++
            return
          }

          try {
            // Scrape the page
            const page = await scrapePage(url)
            if (!page) {
              result.skipped++
              return
            }

            // Generate embedding
            const embeddingArray = await generateEmbedding(page.content)
            const embedding = JSON.stringify(embeddingArray)

            // Determine type for metadata
            const type = categorizeUrl(url)
            const metadata: Record<string, string> = {
              url,
              type:
                type === 'case-study'
                  ? 'case-study'
                  : type === 'blog'
                    ? 'blog'
                    : 'website',
              source: 'framer-sync',
            }
            if (page.description) {
              metadata.description = page.description
            }

            // Create source
            const sourceData: SourceInsert = {
              chatbot_id: chatbotId,
              title: page.title || url,
              content: page.content,
              embedding,
              metadata:
                metadata as unknown as Database['public']['Tables']['sources']['Insert']['metadata'],
            }

            const { error } = await supabaseServer.from('sources').insert([sourceData])

            if (error) {
              result.failed++
              result.errors.push(`${url}: ${error.message}`)
            } else {
              result.created++
              console.log('[Framer Sync] Created source:', page.title)
            }
          } catch (error) {
            result.failed++
            const message = error instanceof Error ? error.message : 'Unknown error'
            result.errors.push(`${url}: ${message}`)
          }
        })
      )

      // Small delay between batches to avoid rate limiting
      if (i + BATCH_SIZE < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }

    console.log('[Framer Sync] Complete:', result)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error('[Framer Sync] Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE - Remove all Framer-synced sources
export async function DELETE(req: NextRequest) {
  const supabaseServer = await createClient()
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  // Get all sources with framer-sync source tag
  const { data: sources, error: fetchError } = await supabaseServer
    .from('sources')
    .select('id, metadata')
    .eq('chatbot_id', chatbotId)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  // Filter to only Framer-synced sources
  const framerSourceIds = sources
    ?.filter((source: any) => {
      const metadata = source.metadata as Record<string, unknown> | null
      return metadata?.source === 'framer-sync'
    })
    .map((s: any) => s.id)

  if (!framerSourceIds || framerSourceIds.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 })
  }

  const { error: deleteError } = await supabaseServer
    .from('sources')
    .delete()
    .in('id', framerSourceIds)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, deleted: framerSourceIds.length })
}
