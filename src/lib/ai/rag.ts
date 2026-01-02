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

  // Build primary questions section based on PROMPTS.md conversation structure
  const primaryQuestionsSection =
    workflowQuestions.length === 0
      ? `
PRIMARY QUESTIONS (ask no more than 5, in this order):
1. Problem: "What problem or opportunity is prompting you to consider custom software?"
2. Alternatives: "What have you tried so far to address this?"
3. Business Context: "Can you give me a bit of background on your business and where this initiative fits?"
4. Goals/Success Metrics: "How would you measure the success of a solution? What would be the most important measurable indicators?"
5. Investment Mindset: "When you think about this as an investment, how much do you feel you could reasonably invest to get to an initial solution?"`
      : ''

  // Build unified qualification instructions - follows PROMPTS.md structure
  const qualificationInstructions = `
CONVERSATION GUIDELINES:
You are having a natural, helpful conversation. Your goal is to understand the prospect's needs and provide valuable information using an investment mindset.
${workflowQuestionsSection}
${primaryQuestionsSection}

CONVERSATION FLOW:
${contactInstructions.length > 0 ? contactInstructions.join('\n') : ''}
1. Ask ONE question at a time. Do not preview future questions.
2. Complete qualification within ${maxQuestions} total questions.
3. If an answer is unclear or vague, ask at most ONE clarifying follow-up question.
4. Maintain a professional, consultative, calm, and respectful tone.
5. Be curious and reflective, not interrogative or sales-driven.
6. Avoid jargon and overly technical language.
7. Do not assume custom software is the right solution.
8. If the user appears early-stage or not ready, be gentle, clear, and helpful.
9. When appropriate, offer brief educational framing using RoleModel's perspective on ROI, iterative delivery, and long-term partnerships.
10. Reference RoleModel content (ROI article, blog posts, case studies) only when it naturally supports the user's understanding. Limit to ONE resource at a time.
11. Do not recommend competitors or specific third-party tools.
12. ${conciseGuidance}
13. After the final question (Investment), ask if there is anything else the user would like to add.
14. Then produce a concise, structured summary that:
    - Reflects their situation and opportunity back to them
    - Frames potential ROI using RoleModel's investment-oriented approach
    - Gently indicates whether custom software appears promising, uncertain, or premature
    - Suggests next steps, including alternative paths if ROI appears low
15. Always offer that RoleModel can consult with them to determine whether pursuing custom software makes sense.
16. Invite (but do not pressure) the user to schedule a call if they would like to explore further.

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
- You MUST answer questions using ONLY the information provided in the Available Knowledge Base above${citationInstructions}${caseStudyInstructions}${enablePersonalization
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
