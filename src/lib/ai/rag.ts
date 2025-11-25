import type { Database } from '@/lib/supabase/database.types'
import { supabaseServer } from '@/lib/supabase/server'

import { generateEmbedding } from './embeddings'

export interface Source {
  id: string
  title: string | null
  content: string
  similarity?: number
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

    return data || []
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
      const title = source.title ? `[${source.title}]` : `[Source ${idx + 1}]`
      return `${title}\n${source.content}`
    })
    .join('\n\n---\n\n')

  // Parse workflow from chatbot business context if available
  let workflowInstructions = ''
  if (chatbot?.business_context) {
    try {
      const context = JSON.parse(chatbot.business_context)
      if (context.workflow) {
        const { questions, threshold } = context.workflow
        workflowInstructions = `

LEAD QUALIFICATION WORKFLOW:
You must follow this specific qualification process:

${questions.map((q: any, i: number) => `
${i + 1}. ${q.question}
   - Look for keywords: ${q.keywords.join(', ')}
   - Weight: ${q.weight}% of total score
   - ${q.required ? 'REQUIRED - Must ask this question' : 'Optional based on conversation flow'}
`).join('')}

SCORING INSTRUCTIONS:
- Calculate lead score based on keyword matches and response quality
- Each question contributes its weight percentage to the total score
- Qualification threshold: ${threshold}%
- If score >= ${threshold}%, mark as QUALIFIED LEAD
- If score < ${threshold}%, mark as NURTURE LEAD

CONVERSATION FLOW:
1. Start naturally, understand their initial need
2. Weave qualification questions into the conversation
3. Don't ask all questions at once - make it conversational
4. Collect name early: "Who am I speaking with today?"
5. Collect email before detailed info: "What's the best email to send you details?"
6. Track responses mentally and calculate score
7. Based on score, either escalate to sales or nurture
`
      }
    } catch {
      // If not JSON or no workflow, use default
    }
  }

  // Use workflow instructions if available, otherwise default
  const qualificationInstructions = workflowInstructions || `
LEAD QUALIFICATION FLOW:
- Early in the conversation (after 1-2 messages), naturally ask for their name: "Who am I speaking with?"
- After establishing rapport and discussing their needs, ask for their email: "I'd love to send you a summary of our discussion. What's the best email to reach you at?"
- ALWAYS collect name and email before offering to provide a summary or next steps
- Frame email collection as providing value: "Let me send you a detailed summary" or "I'll email you the information we discussed"
`

  return `
## Available Knowledge Base

${sourceTexts}

---

CRITICAL INSTRUCTIONS:
- You MUST answer questions using ONLY the information provided in the Available Knowledge Base above
- Be highly personalized: Use the prospect's name, industry context, and prior answers from the conversation
- Be natural and conversational when using the knowledge base information
- If the knowledge base contains relevant information, use it to provide a complete, detailed answer
- NEVER use phrases like "connect you with a specialist" or "I'd be happy to help you explore"
- Conservative fallback: If you cannot answer from the knowledge base, suggest the prospect rephrase their question or offer to schedule a call to discuss their specific needs
- Stay focused on the business context and knowledge provided above

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
