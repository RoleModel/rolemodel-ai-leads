import { supabaseServer } from '@/lib/supabase/server'
import { generateEmbedding } from './embeddings'

export interface Source {
  id: string
  title: string | null
  content: string
  similarity?: number
}

/**
 * Retrieve relevant sources for a query using vector similarity search
 */
export async function retrieveRelevantSources(
  chatbotId: string,
  query: string,
  limit: number = 5,
  threshold: number = 0.5
): Promise<Source[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    // Perform vector similarity search
    const { data, error } = await supabaseServer.rpc('match_sources', {
      chatbot_id: chatbotId,
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error('Error retrieving sources:', error)

      // Fallback: get all sources for this chatbot (keyword-based matching could be added here)
      const { data: fallbackData } = await supabaseServer
        .from('sources')
        .select('id, title, content')
        .eq('chatbot_id', chatbotId)
        .limit(limit)

      return fallbackData || []
    }

    return data || []
  } catch (error) {
    console.error('Error in retrieveRelevantSources:', error)
    return []
  }
}

/**
 * Build context string from sources
 */
export function buildSourceContext(sources: Source[]): string {
  if (sources.length === 0) {
    return ''
  }

  const sourceTexts = sources.map((source, idx) => {
    const title = source.title ? `[${source.title}]` : `[Source ${idx + 1}]`
    return `${title}\n${source.content}`
  }).join('\n\n---\n\n')

  return `
## Available Knowledge Base

${sourceTexts}

---

Use the above information to provide accurate, helpful responses. When referencing information from the knowledge base, be natural and conversational. If the knowledge base doesn't contain relevant information for the user's question, be honest about it and suggest connecting them with a specialist.
`
}

/**
 * Get chatbot configuration
 */
export async function getChatbot(chatbotId: string): Promise<any> {
  const { data, error } = await supabaseServer
    .from('chatbots')
    .select('*')
    .eq('id', chatbotId)
    .single()

  if (error) {
    console.error('Error fetching chatbot:', error)
    return null
  }

  return data
}
