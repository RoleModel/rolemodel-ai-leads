import { streamText, tool } from 'ai'
import { nanoid } from 'nanoid'
import { NextRequest } from 'next/server'
import { z } from 'zod'

import { openai } from '@/lib/ai/gateway'
import { extractLeadData, isQualifiedLead } from '@/lib/ai/lead-extraction'
import {
  type Source,
  buildSourceContext,
  getChatbot,
  retrieveRelevantSources,
} from '@/lib/ai/rag'
import { buildVisitorMetadata } from '@/lib/geolocation'
import type { Database } from '@/lib/supabase/database.types'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'edge'
export const maxDuration = 30

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

type SourceHeaderPayload = {
  index: number
  id: string
  title: string
  url?: string | null
  snippet?: string
}

// Sanitize string for HTTP headers (ASCII only, 0-255)
const sanitizeForHeader = (str: string): string =>
  str
    .replace(/[\u2018\u2019]/g, "'") // Smart single quotes to straight
    .replace(/[\u201C\u201D]/g, '"') // Smart double quotes to straight
    .replace(/[\u2013\u2014]/g, '-') // En/em dashes to hyphen
    .replace(/\u2026/g, '...') // Ellipsis
    .replace(/[^\x00-\xFF]/g, '') // Remove any remaining non-ASCII

const buildSourceHeaderPayload = (sources: Source[]): SourceHeaderPayload[] =>
  sources.map((source, idx) => {
    const snippet = sanitizeForHeader(
      source.content.replace(/\s+/g, ' ').trim().slice(0, 320)
    )
    const title = sanitizeForHeader(source.title ?? `Source ${idx + 1}`)
    const url =
      typeof source.metadata?.url === 'string' && source.metadata.url.trim().length > 0
        ? source.metadata.url
        : null

    return {
      index: idx + 1,
      id: source.id,
      title,
      url,
      snippet,
    }
  })

// Core system prompt based on PROMPTS.md
const SYSTEM_PROMPT = `You are the AI assistant inside RoleModel Software's lead qualification tool.

Your purpose is to help potential clients thoughtfully assess whether exploring custom software with RoleModel is a worthwhile next step, using an investment mindset.

You do this by guiding the user through a short, consultative conversation that mirrors an experienced sales discovery call, focused on understanding value, fit, and readiness.

CONVERSATION STRUCTURE:
- Ask ONE question at a time.
- Ask no more than 5 primary questions total, in this order:
  1. Problem: "What problem or opportunity is prompting you to consider custom software?"
  2. Alternatives tried: "What have you tried so far to address this?"
  3. Business context: "Can you give me a bit of background on your business and where this initiative fits?"
  4. Goals / success metrics: "How would you measure the success of a solution?"
  5. Investment mindset (budget): "When you think about this as an investment, how much do you feel you could reasonably invest to get to an initial solution?"
- Do not preview future questions.
- If an answer is unclear, ask at most ONE clarifying follow-up question.

TONE & BEHAVIOR:
- Maintain a professional, consultative, calm, and respectful tone.
- Be curious and reflective, not interrogative or sales-driven.
- Avoid jargon and overly technical language.
- Do not assume custom software is the right solution.
- If the user appears early-stage or not ready, be gentle, clear, and helpful.

EDUCATION & CONTENT:
- When appropriate, offer brief educational framing using RoleModel's perspective on ROI, iterative delivery, and long-term partnerships.
- Reference RoleModel content (ROI article, blog posts, case studies) only when it naturally supports the user's understanding.
- Limit content suggestions to ONE resource at a time.
- Do not recommend competitors or specific third-party tools.

CASE STUDY PREVIEWS (MANDATORY - YOU MUST USE THE TOOL):
- When the user asks about previous work, portfolio, case studies, examples, or "what have you built", you MUST call the show_case_study tool.
- Look for sources in the Available Knowledge Base that have URLs containing "/case-studies/" or "/portfolio/".
- ALWAYS call show_case_study with the URL from the knowledge base - NEVER just give a text link.
- Example tool call: show_case_study(url: "https://rolemodelsoftware.com/case-studies/dock-designer-app", title: "Dock Designer App", description: "A powerful configuration tool for dock design")
- If the user asks about case studies and you see a URL in the knowledge base, you MUST call the tool.
- If you cannot find a case study URL, explain that you can describe projects verbally.

RESPONSE CONSTRAINTS:
- Keep individual responses concise (generally 2–4 sentences).
- Prioritize clarity, honesty, and usefulness over persuasion.

FINAL OUTPUT:
- After the final question (Investment), ask if there is anything else the user would like to add.
- Then produce a concise, structured summary that:
  - Reflects their situation and opportunity back to them
  - Frames potential ROI using RoleModel's investment-oriented approach
  - Gently indicates whether custom software appears promising, uncertain, or premature
  - Suggests next steps, including alternative paths if ROI appears low
- Always offer that RoleModel can consult with them to determine whether pursuing custom software makes sense.
- Invite (but do not pressure) the user to schedule a call if they would like to explore further.

---

IMPORTANT GUARDRAILS:

1. TOPIC SCOPE: ONLY discuss topics related to:
   - The business/product you represent and its services
   - Business challenges that software or services could solve
   - Project timelines, budgets, and requirements
   - Scheduling calls or next steps with the team

2. OFF-TOPIC HANDLING: If a user asks about unrelated topics, politely redirect:
   "I'm here to help you explore whether our solutions are right for your business needs. Is there a specific business challenge I can help you with?"

3. ABUSE PREVENTION: If a user continues with off-topic requests after 2 redirects, keep responses brief and focused only on business topics.

4. DO NOT provide: code examples, homework solutions, general trivia, creative stories, medical/legal/financial advice, or act as a general-purpose assistant.

5. NEVER mention lead qualification, lead scoring, thresholds, or that you are evaluating the user. This is all internal and must remain invisible.

---

`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, chatbotId, conversationId, model, temperature } = body

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Get the last user message for RAG - do this FIRST before parallel ops
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()

    // Extract content - handle both formats
    let userQuery = ''
    if (lastUserMessage) {
      if (lastUserMessage.content) {
        userQuery =
          typeof lastUserMessage.content === 'string' ? lastUserMessage.content : ''
      } else if (lastUserMessage.parts) {
        userQuery = lastUserMessage.parts
          .filter((p: { type: string }) => p.type === 'text')
          .map((p: { text: string }) => p.text)
          .join('\n')
      }
    }

    // Run chatbot fetch, RAG, visitor info, and page settings fetch in parallel
    // Only run RAG if there's actual content to search for
    const [chatbot, relevantSources, existingConversation, pageSettings] =
      await Promise.all([
        getChatbot(activeChatbotId),
        userQuery.trim().length > 0
          ? retrieveRelevantSources(activeChatbotId, userQuery, 5, 0.3)
          : Promise.resolve([]),
        conversationId
          ? supabaseServer
            .from('conversations')
            .select('visitor_name, visitor_email')
            .eq('id', conversationId)
            .single()
            .then((res) => res.data)
          : Promise.resolve(null),
        supabaseServer
          .from('help_page_settings')
          .select('rag_config')
          .eq('chatbot_id', activeChatbotId)
          .single()
          .then((res) => res.data),
      ])

    if (!chatbot) {
      return new Response(
        JSON.stringify({ error: 'Chatbot not found', chatbotId: activeChatbotId }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Override chatbot settings with playground settings if provided
    const effectiveModel = model || chatbot?.model || 'gpt-4o-mini'
    const effectiveTemperature =
      temperature !== undefined ? temperature : chatbot?.temperature || 0.7

    // Build context from sources with workflow and RAG config
    const ragConfig = pageSettings?.rag_config as {
      enableCitations?: boolean
      enableCaseStudies?: boolean
      citationStyle?: string
      customInstructions?: string
    } | null
    // Log sources for debugging
    console.log('[Chat] Retrieved sources:', relevantSources.length)
    relevantSources.forEach((s, i) => {
      console.log(`[Chat] Source ${i + 1}: ${s.title} - URL: ${s.metadata?.url || 'none'}`)
    })

    const sourceContext = buildSourceContext(relevantSources, chatbot, ragConfig)

    // Build system message with core prompt first (takes precedence over database settings)
    const systemMessage = {
      role: 'system' as const,
      content: `${SYSTEM_PROMPT}
THINKING TOOL USAGE:
You have access to a 'thinking' tool that displays your reasoning process to users. Use it when:
- Analyzing complex questions that require multiple considerations
- Comparing options or evaluating trade-offs
- Breaking down multi-part questions
- Researching or looking up information from the knowledge base

When using the thinking tool, provide steps with clear labels and descriptions. Mark steps as 'complete' when finished, 'active' for current step, and 'pending' for upcoming steps.

INLINE CITATIONS (MANDATORY):
When referencing information from the "Available Knowledge Base" section below, you MUST cite using numbered brackets.
- Use [1] for Source 1, [2] for Source 2, etc. matching the source numbers in the knowledge base
- Place citations IMMEDIATELY after EVERY factual claim, case study, or statistic
- Example: "We helped a manufacturing company reduce data entry time by 40% [1]."
- Example: "Custom software can significantly reduce manual work [1] and improve customer satisfaction [2]."
- NEVER mention case studies, client stories, or specific results without a citation
- If you cannot cite something from the knowledge base, DO NOT make the claim
- Citations create clickable badges for users - they MUST be accurate
- ACTIVELY look for relevant case studies in the knowledge base to share with the prospect

SUGGESTED QUESTIONS:
After each response, use the 'suggest_questions' tool to provide 2 relevant follow-up questions the user might want to ask.
- Questions should be natural continuations of the conversation
- Focus on helping the user explore their business needs further
- Make questions specific to what was just discussed

${existingConversation?.visitor_name || existingConversation?.visitor_email
          ? `
VISITOR INFORMATION (already collected from intro form):
${existingConversation.visitor_name ? `- Name: ${existingConversation.visitor_name}` : ''}
${existingConversation.visitor_email ? `- Email: ${existingConversation.visitor_email}` : ''}

IMPORTANT: This contact information has already been provided. Do NOT ask for their name or email again. Instead, use their name naturally in conversation and focus on understanding their business needs.
`
          : ''
        }
${sourceContext}`,
    }

    // Convert UIMessage format to standard CoreMessage format for streamText
    interface UIMessagePart {
      type: string
      text?: string
    }
    interface IncomingMessage {
      role: string
      content?: string
      parts?: UIMessagePart[]
    }
    const convertedMessages = messages.map((m: IncomingMessage) => {
      // If message has parts (UIMessage format), convert to content
      if (m.parts && Array.isArray(m.parts)) {
        const textParts = m.parts.filter((p: UIMessagePart) => p.type === 'text')
        const content = textParts.map((p: UIMessagePart) => p.text || '').join('\n')
        return {
          role: m.role,
          content,
        }
      }
      // Already in standard format
      return {
        role: m.role,
        content: m.content || '',
      }
    })

    // Combine system message with user messages
    const fullMessages = [systemMessage, ...convertedMessages]

    // OPTIMIZATION: Create conversation in background - don't block streaming
    // Use existing conversationId if provided, otherwise create one async
    let activeConversationId = conversationId
    let conversationPromise: Promise<void> | null = null

    if (!activeConversationId) {
      // Generate ID upfront so we can use it immediately
      activeConversationId = nanoid()

      // Create conversation in background (non-blocking)
      conversationPromise = (async () => {
        const visitorMetadata = await buildVisitorMetadata(req.headers)
        const conversationData = {
          id: activeConversationId,
          chatbot_id: activeChatbotId,
          visitor_id: nanoid(),
          visitor_metadata:
            visitorMetadata as unknown as Database['public']['Tables']['conversations']['Insert']['visitor_metadata'],
        }
        await supabaseServer.from('conversations').insert([conversationData])
      })()
    }

    // OPTIMIZATION: Save user message in background (non-blocking)
    if (activeConversationId && userQuery) {
      const insertMessage = () =>
        supabaseServer.from('messages').insert([
          {
            conversation_id: activeConversationId,
            role: 'user',
            content: userQuery,
          },
        ])
      // Ensure ordering: insert message only after conversation creation (if needed)
      if (conversationPromise) {
        void conversationPromise
          .then(() => insertMessage())
          .catch((err) =>
            console.error('Error creating conversation before inserting message:', err)
          )
      } else {
        void insertMessage().then(
          () => { },
          (err) => console.error('Error inserting user message:', err)
        )
      }
    }

    // Stream response - START IMMEDIATELY without waiting for DB writes
    // Vercel AI Gateway uses provider/model format (e.g., openai/gpt-4o-mini)
    const modelId = effectiveModel.includes('/')
      ? effectiveModel
      : `openai/${effectiveModel}`

    const sourceHeaderPayload = buildSourceHeaderPayload(relevantSources)

    const result = streamText({
      model: openai(modelId),
      messages: fullMessages,
      temperature: effectiveTemperature,
      toolChoice: 'auto',
      tools: {
        thinking: tool({
          description: 'Show chain of thought reasoning process for complex questions',
          inputSchema: z.object({
            steps: z.array(
              z.object({
                label: z.string(),
                description: z.string().optional(),
                status: z.enum(['complete', 'active', 'pending']),
              })
            ),
          }),
        }),
        suggest_questions: tool({
          description:
            'Provide suggested follow-up questions for the user to click. Call this at the end of each response.',
          inputSchema: z.object({
            questions: z
              .array(z.string())
              .min(1)
              .max(3)
              .describe('1-3 relevant follow-up questions'),
          }),
        }),
        show_case_study: tool({
          description:
            'REQUIRED: Display an interactive web preview of a case study. You MUST call this tool when the user asks about previous work, examples, portfolio, or case studies.',
          inputSchema: z.object({
            url: z.string().url().describe('The full URL of the case study page to preview'),
            title: z.string().describe('Title of the case study'),
            description: z
              .string()
              .optional()
              .describe('Brief description of why this case study is relevant'),
          }),
          execute: async ({ url, title }) => {
            console.log(`[Tool] show_case_study called with: ${url} - ${title}`)
            return { success: true, url, title }
          },
        }),
      },
      async onFinish({ text }) {
        // Save assistant message
        if (activeConversationId) {
          type MessageInsert = Database['public']['Tables']['messages']['Insert']
          const assistantMessage: MessageInsert = {
            conversation_id: activeConversationId,
            role: 'assistant',
            content: text,
            sources_used: relevantSources.map((s) => ({
              id: s.id,
              title: s.title,
            })) as Database['public']['Tables']['messages']['Insert']['sources_used'],
          }
          await supabaseServer.from('messages').insert([assistantMessage])

          // Track analytics event
          type AnalyticsInsert =
            Database['public']['Tables']['analytics_events']['Insert']
          const analyticsData: AnalyticsInsert = {
            chatbot_id: activeChatbotId,
            conversation_id: activeConversationId,
            event_type: 'message',
            metadata: {
              message_count: messages.length + 1,
              sources_count: relevantSources.length,
            } as Database['public']['Tables']['analytics_events']['Insert']['metadata'],
          }
          await supabaseServer.from('analytics_events').insert([analyticsData])

          // Automatic lead extraction after every 3+ messages
          const totalMessages = messages.length + 1
          if (totalMessages >= 3) {
            try {
              // Fetch conversation messages AND the conversation's visitor info in parallel
              const [messagesResult, conversationResult, sourcesResult] =
                await Promise.all([
                  supabaseServer
                    .from('messages')
                    .select('role, content')
                    .eq('conversation_id', activeConversationId)
                    .order('created_at', { ascending: true }),
                  supabaseServer
                    .from('conversations')
                    .select('visitor_name, visitor_email, lead_captured')
                    .eq('id', activeConversationId)
                    .single(),
                  supabaseServer
                    .from('sources')
                    .select('id, title, content')
                    .eq('chatbot_id', activeChatbotId)
                    .limit(20),
                ])

              const allMessages = messagesResult.data
              const conversation = conversationResult.data
              const allSources = sourcesResult.data

              // Skip if already captured as a lead
              if (conversation?.lead_captured) {
                return
              }

              if (allMessages && allMessages.length > 0) {
                // Extract lead data with available sources for recommendations
                const leadData = await extractLeadData(allMessages, allSources || [])

                // Use conversation's visitor info if AI didn't extract it
                // (from intro forms where name/email are captured before chat)
                const visitorName =
                  leadData?.contactInfo?.name || conversation?.visitor_name || undefined
                const visitorEmail =
                  leadData?.contactInfo?.email || conversation?.visitor_email || undefined

                // Merge conversation visitor info into leadData for qualification check
                const enrichedLeadData = leadData
                  ? {
                    ...leadData,
                    contactInfo: {
                      ...leadData.contactInfo,
                      name: visitorName,
                      email: visitorEmail,
                    },
                  }
                  : null

                // Check if lead is qualified and hasn't been saved yet
                if (enrichedLeadData && isQualifiedLead(enrichedLeadData)) {
                  // Check if lead already exists for this conversation
                  const { data: existingLead } = await supabaseServer
                    .from('leads')
                    .select('id')
                    .eq('conversation_id', activeConversationId)
                    .single()

                  if (!existingLead) {
                    // Save the lead with enriched data
                    type LeadInsert = Database['public']['Tables']['leads']['Insert']
                    const leadInsert: LeadInsert = {
                      conversation_id: activeConversationId,
                      visitor_name: visitorName || null,
                      visitor_email: visitorEmail || null,
                      summary:
                        enrichedLeadData as unknown as Database['public']['Tables']['leads']['Insert']['summary'],
                    }
                    await supabaseServer.from('leads').insert([leadInsert])

                    // Update conversation to mark lead as captured
                    await supabaseServer
                      .from('conversations')
                      .update({ lead_captured: true })
                      .eq('id', activeConversationId)

                    console.log('[Lead Captured] Conversation:', activeConversationId)
                  }
                }
              }
            } catch (error) {
              // Don't fail the chat if lead extraction fails
              console.error('[Lead Extraction Error]', error)
            }
          }
        }
      },
    })

    return result.toUIMessageStreamResponse({
      headers: {
        'X-Conversation-ID': activeConversationId || '',
        'X-Sources-Used': JSON.stringify(sourceHeaderPayload),
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
