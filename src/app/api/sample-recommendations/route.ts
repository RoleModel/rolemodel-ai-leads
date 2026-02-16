import { NextRequest, NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { decodeHtmlEntities } from '@/lib/utils'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

/**
 * GET - Fetch sample recommendations from sources for the landing page demo
 * Returns up to 3 sources formatted as recommendations
 */
export async function GET(req: NextRequest) {
  const supabaseServer = await createClient()
  const searchParams = req.nextUrl.searchParams
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  const { data, error } = await supabaseServer
    .from('sources')
    .select('id, title, content, metadata')
    .eq('chatbot_id', chatbotId)
    .limit(5)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform sources into recommendation format
  const recommendations = (data || []).slice(0, 3).map((source) => {
    const metadata = source.metadata as Record<string, string> | null
    const type = metadata?.type || 'article'

    // Generate a brief description from the content (first ~150 chars)
    // and decode HTML entities
    const content = decodeHtmlEntities(source.content || '')
    const description =
      content.length > 150 ? content.substring(0, 150).trim() + '...' : content

    return {
      title: decodeHtmlEntities(source.title || 'Resource'),
      description,
      url: metadata?.url || null,
      type: type as 'case-study' | 'guide' | 'article' | 'tool' | 'other',
    }
  })

  return NextResponse.json({ recommendations })
}
