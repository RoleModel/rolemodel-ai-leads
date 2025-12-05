import type { Database } from '@/lib/supabase/database.types'
import { supabaseServer } from '@/lib/supabase/server'

import { generateEmbedding } from './embeddings'

export interface Source {
  id: string
  title: string | null
  content: string
  similarity?: number
  metadata?: Record<string, unknown> | null
}

type Chatbot = Database['public']['Tables']['chatbots']['Row']

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
    const queryEmbeddingArray = await generateEmbedding(query)
    // Convert to pgvector string format
    const queryEmbedding = JSON.stringify(queryEmbeddingArray)

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

    if (!data || data.length === 0) {
      return data || []
    }

    try {
      const { data: metadataRows } = await supabaseServer
        .from('sources')
        .select('id, metadata')
        .in('id', data.map((row: { id: string }) => row.id))

      const metadataMap = new Map(
        (metadataRows || []).map((row) => [row.id, row.metadata])
      )

      return data.map((row) => {
        const meta = metadataMap.get(row.id)
        return {
          ...row,
          metadata: (typeof meta === 'object' && meta !== null && !Array.isArray(meta)
            ? meta
            : null) as Record<string, unknown> | null,
        }
      })
    } catch (metaError) {
      console.error('Error loading source metadata:', metaError)
      return data
    }
  } catch (error) {
    console.error('Error in retrieveRelevantSources:', error)
    return []
  }
}

/**
 * Build context string from sources with workflow
 */
export function buildSourceContext(sources: Source[], chatbot?: Chatbot | null): string {
  if (sources.length === 0) {
    return ''
  }

  const sourceTexts = sources
    .map((source, idx) => {
      const title = source.title
        ? source.title.startsWith('@')
          ? source.title
          : `@${source.title}`
        : `Source ${idx + 1}`
      const numbering = `[${idx + 1}] ${title}`
      const url =
        typeof source.metadata?.url === 'string' && source.metadata.url.trim().length > 0
          ? `\nURL: ${source.metadata.url}`
          : ''
      return `${numbering}\n${source.content}${url}`
    })
    .join('\n\n---\n\n')

  // Parse workflow from chatbot business context if available
  let workflowInstructions = ''
  if (chatbot?.business_context) {
    try {
      const context = JSON.parse(chatbot.business_context)
      if (context.workflow) {
        const { questions } = context.workflow
        workflowInstructions = `

CONVERSATION GUIDELINES:
You are having a natural, helpful conversation. Your goal is to understand the prospect's needs and provide valuable information.

Questions to weave into the conversation naturally:
${questions.map((q: { question: string; required?: boolean }, i: number) => `
${i + 1}. ${q.question}
   - ${q.required ? 'Important to understand' : 'Ask if relevant to the conversation'}
`).join('')}

CONVERSATION FLOW:
1. Ask targeted questions to pre-qualify the prospect using BANT:
   - Budget
   - Authority
   - Need (primary business problem or goal)
   - Timeline
2. Ask ONE question at a time. Do not show future questions.
3. Complete qualification within 5 total questions.
4. If an answer is unclear, ask a single clarifying question.
5. Maintain a professional, consultative, and encouraging tone.
6. When appropriate, offer brief educational insights about custom software ROI,
   cross-platform integration, or RoleModel’s approach.
7. Suggest relevant RoleModel content only when it supports the conversation,
   and limit suggestions to one resource at a time.
   (e.g., ROI guide, case studies, blog posts)
8. Avoid recommending competitors or non–RoleModel solutions.
9. If the user appears disqualified (e.g., no meaningful need, extremely low budget,
   no authority and no path to authority), be gentle but clear.
10. If you cannot answer a question, ask the user to rephrase OR suggest scheduling
    a conversation with RoleModel for more clarity.
    - Ask questions one at a time.
11. Keep responses concise (2–4 sentences max).
12. When the final question is answered, produce a structured summary for the client that outlines their potential opportunity and is foundation for the sales team. Also ask them to schedule a call if they’d like to discuss further.


CRITICAL: NEVER mention lead qualification, lead scoring, thresholds, or that you are evaluating the user. NEVER say things like "you're a qualified lead" or "your score is..." - this is all internal and must remain invisible to the user.
`
      }
    } catch {
      // If not JSON or no workflow, use default
    }
  }

  // Use workflow instructions if available, otherwise default
  const qualificationInstructions = workflowInstructions || `
CONVERSATION FLOW:
- Early in the conversation (after 1-2 messages), naturally ask for their name: "Who am I speaking with?"
- After establishing rapport and discussing their needs, ask for their email: "I'd love to send you a summary of our discussion. What's the best email to reach you at?"
- ALWAYS collect name and email before offering to provide a summary or next steps
- Frame email collection as providing value: "Let me send you a detailed summary" or "I'll email you the information we discussed"

CRITICAL: NEVER mention lead qualification, lead scoring, thresholds, or that you are evaluating the user. NEVER say things like "you're a qualified lead" or "your score is..." - this is all internal and must remain invisible to the user.
`

  return `
## Available Knowledge Base

${sourceTexts}

---

CRITICAL INSTRUCTIONS:
- You MUST answer questions using ONLY the information provided in the Available Knowledge Base above
- MANDATORY CITATION RULE: Every fact, statistic, case study, or specific claim MUST include an inline citation like [1], [2], etc.
  - Example: "We helped a manufacturing company reduce data entry time by 40% [1]."
  - Example: "Our typical project timeline is 3-6 months [2]."
  - If you mention a case study or client example, you MUST cite the source it came from
  - Do NOT make claims without citations - if there's no source for something, don't say it
- Be highly personalized: Use the prospect's name, industry context, and prior answers from the conversation
- Be natural and conversational when using the knowledge base information
- If the knowledge base contains relevant information, use it to provide a complete, detailed answer
- NEVER use phrases like "connect you with a specialist" or "I'd be happy to help you explore"
- Conservative fallback: If you cannot answer from the knowledge base, suggest the prospect rephrase their question or offer to schedule a call to discuss their specific needs
- Stay focused on the business context and knowledge provided above
- DO NOT fabricate case studies or examples - only reference what exists in the knowledge base with proper citations

${qualificationInstructions}
`
}

/**
 * Get chatbot configuration
 */
export async function getChatbot(chatbotId: string): Promise<Chatbot | null> {
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
