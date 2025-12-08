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
        .in(
          'id',
          data.map((row: { id: string }) => row.id)
        )

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

interface RagConfig {
  // Knowledge Base Retrieval
  sourceLimit?: number // Number of sources to retrieve (default: 5)
  similarityThreshold?: number // Minimum similarity score (default: 0.5)

  // Citation & Case Studies
  enableCitations?: boolean
  enableCaseStudies?: boolean
  citationStyle?: string

  // Conversation Flow
  enableBANT?: boolean // Use BANT qualification (default: true)
  askForName?: boolean // Ask for visitor's name (default: true)
  askForEmail?: boolean // Ask for visitor's email (default: true)
  maxQuestions?: number // Max qualification questions (default: 5)

  // Response Style
  responseConciseness?: 'brief' | 'moderate' | 'detailed' // Response length (default: 'moderate')
  enablePersonalization?: boolean // Use name/context in responses (default: true)

  // Custom Instructions
  customInstructions?: string
}

/**
 * Build context string from sources with workflow
 */
export function buildSourceContext(
  sources: Source[],
  chatbot?: Chatbot | null,
  ragConfig?: RagConfig | null
): string {
  if (sources.length === 0) {
    return ''
  }

  // Extract config with defaults
  const enableCitations = ragConfig?.enableCitations ?? true
  const enableCaseStudies = ragConfig?.enableCaseStudies ?? true
  const customInstructions = ragConfig?.customInstructions || ''
  const enableBANT = ragConfig?.enableBANT ?? true
  const askForName = ragConfig?.askForName ?? true
  const askForEmail = ragConfig?.askForEmail ?? true
  const maxQuestions = ragConfig?.maxQuestions ?? 5
  const responseConciseness = ragConfig?.responseConciseness ?? 'moderate'
  const enablePersonalization = ragConfig?.enablePersonalization ?? true

  // Build response length guidance
  const conciseGuidance = {
    brief: 'Keep responses very concise (1-2 sentences). Be direct and to the point.',
    moderate:
      'Keep responses concise (2-4 sentences max). Balance brevity with helpfulness.',
    detailed:
      'Provide thorough, detailed responses. Include context and explanations where helpful.',
  }[responseConciseness]

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

  // Parse workflow questions from chatbot business context if available
  let workflowQuestions: Array<{ question: string; required?: boolean }> = []
  if (chatbot?.business_context) {
    try {
      const context = JSON.parse(chatbot.business_context)
      if (context.workflow?.questions) {
        workflowQuestions = context.workflow.questions
      }
    } catch {
      // If not JSON or no workflow, use default
    }
  }

  // Build contact collection instructions based on config
  const contactInstructions = []
  if (askForName) {
    contactInstructions.push(
      '- Early in the conversation (after 1-2 messages), naturally ask for their name: "Who am I speaking with?"'
    )
  }
  if (askForEmail) {
    contactInstructions.push(
      '- After establishing rapport and discussing their needs, ask for their email: "I\'d love to send you a summary of our discussion. What\'s the best email to reach you at?"'
    )
    if (askForName) {
      contactInstructions.push(
        '- ALWAYS collect name and email before offering to provide a summary or next steps'
      )
    }
    contactInstructions.push(
      '- Frame email collection as providing value: "Let me send you a detailed summary" or "I\'ll email you the information we discussed"'
    )
  }

  // Build workflow questions section if available
  const workflowQuestionsSection =
    workflowQuestions.length > 0
      ? `
Questions to weave into the conversation naturally:
${workflowQuestions
  .map(
    (q, i: number) => `
${i + 1}. ${q.question}
   - ${q.required ? 'Important to understand' : 'Ask if relevant to the conversation'}
`
  )
  .join('')}`
      : ''

  // Build BANT instructions if enabled (and no custom workflow questions)
  const bantInstructions =
    enableBANT && workflowQuestions.length === 0
      ? `
Ask targeted questions to pre-qualify the prospect using BANT:
   - Budget
   - Authority
   - Need (primary business problem or goal)
   - Timeline`
      : ''

  // Build unified qualification instructions - always uses ragConfig settings
  const qualificationInstructions = `
CONVERSATION GUIDELINES:
You are having a natural, helpful conversation. Your goal is to understand the prospect's needs and provide valuable information.
${workflowQuestionsSection}
${bantInstructions}

CONVERSATION FLOW:
${contactInstructions.length > 0 ? contactInstructions.join('\n') : ''}
1. Ask ONE question at a time. Do not show future questions.
2. Complete qualification within ${maxQuestions} total questions.
3. If an answer is unclear, ask a single clarifying question.
4. Maintain a professional, consultative, and encouraging tone.
5. When appropriate, offer brief educational insights about custom software ROI,
   cross-platform integration, or RoleModel's approach.
6. Suggest relevant RoleModel content only when it supports the conversation,
   and limit suggestions to one resource at a time.
7. Avoid recommending competitors or non–RoleModel solutions.
8. If the user appears disqualified (e.g., no meaningful need, extremely low budget,
   no authority and no path to authority), be gentle but clear.
9. If you cannot answer a question, ask the user to rephrase OR suggest scheduling
   a conversation with RoleModel for more clarity.
10. ${conciseGuidance}
11. When the final question is answered, produce a structured summary for the client that outlines their potential opportunity and is foundation for the sales team. Also ask them to schedule a call if they'd like to discuss further.

CRITICAL: NEVER mention lead qualification, lead scoring, thresholds, or that you are evaluating the user. NEVER say things like "you're a qualified lead" or "your score is..." - this is all internal and must remain invisible to the user.
`

  // Build citation instructions conditionally
  const citationInstructions = enableCitations
    ? `
- MANDATORY CITATION RULE: Every fact, statistic, case study, or specific claim MUST include an inline citation like [1], [2], etc.
  - Example: "We helped a manufacturing company reduce data entry time by 40% [1]."
  - Example: "Our typical project timeline is 3-6 months [2]."
  - If you mention a case study or client example, you MUST cite the source it came from
  - Do NOT make claims without citations - if there's no source for something, don't say it`
    : ''

  // Build case study instructions conditionally
  const caseStudyInstructions = enableCaseStudies
    ? `
- PROACTIVELY SHARE CASE STUDIES: When discussing the prospect's industry or challenges, actively share relevant case studies from the Available Knowledge Base
  - Example: "Speaking of manufacturing challenges, we helped a similar company achieve 40% efficiency gains${enableCitations ? ' [1]' : ''}. Would you like to hear more?"
  - Make case studies a natural part of the conversation - don't wait to be asked
  - Look for opportunities to share success stories that relate to the prospect's situation`
    : ''

  // Build custom instructions section
  const customInstructionsSection = customInstructions.trim()
    ? `

CUSTOM INSTRUCTIONS:
${customInstructions}`
    : ''

  return `
## Available Knowledge Base

${sourceTexts}

---

CRITICAL INSTRUCTIONS:
- You MUST answer questions using ONLY the information provided in the Available Knowledge Base above${citationInstructions}${caseStudyInstructions}${
    enablePersonalization
      ? `
- Be highly personalized: Use the prospect's name, industry context, and prior answers from the conversation`
      : ''
  }
- Be natural and conversational when using the knowledge base information
- If the knowledge base contains relevant information, use it to provide a complete, detailed answer
- NEVER use phrases like "connect you with a specialist" or "I'd be happy to help you explore"
- Conservative fallback: If you cannot answer from the knowledge base, suggest the prospect rephrase their question or offer to schedule a call to discuss their specific needs
- Stay focused on the business context and knowledge provided above
- DO NOT fabricate case studies or examples - only reference what exists in the knowledge base${enableCitations ? ' with proper citations' : ''}
${customInstructionsSection}
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
