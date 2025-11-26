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
1. Start naturally, understand their initial need
2. Weave these questions into the conversation organically
3. Don't ask all questions at once - make it conversational
4. Collect name early: "Who am I speaking with today?"
5. Collect email when appropriate: "What's the best email to send you details?"
6. Focus on being helpful and understanding their needs

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
