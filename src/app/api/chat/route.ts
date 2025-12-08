import { streamText, tool } from 'ai'
import { nanoid } from 'nanoid'
import { NextRequest } from 'next/server'
import { z } from 'zod'

import { openai } from '@/lib/ai/gateway'
import { extractLeadData, isQualifiedLead } from '@/lib/ai/lead-extraction'
import { buildSourceContext, getChatbot, retrieveRelevantSources, type Source } from '@/lib/ai/rag'
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
      source.content
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 320)
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

// Guardrail instructions to prevent token abuse
const GUARDRAIL_INSTRUCTIONS = `IMPORTANT GUARDRAILS - You must follow these rules:

1. TOPIC SCOPE: You are a lead qualification assistant. ONLY discuss topics related to:
   - The business/product you represent and its services
   - Business challenges that software or services could solve
   - Project timelines, budgets, and requirements
   - Scheduling calls or next steps with the team

2. OFF-TOPIC HANDLING: If a user asks about unrelated topics (homework help, coding tutorials, general knowledge questions, jokes, creative writing, personal advice, etc.), politely redirect:
   "I'm here to help you explore whether our solutions are right for your business needs. Is there a specific business challenge I can help you with?"

3. ABUSE PREVENTION: If a user continues with off-topic requests after 2 redirects, respond with:
   "It seems I might not be the right resource for what you're looking for today. If you'd like to discuss how we can help your business, I'm happy to continue. Otherwise, feel free to reach out when you have business-related questions."
   Then keep responses brief and focused only on business topics.

4. DO NOT provide: code examples, homework solutions, general trivia, creative stories, medical/legal/financial advice, or act as a general-purpose assistant.

---

`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, chatbotId, conversationId, model, temperature, instructions } = body

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Get the last user message for RAG - do this FIRST before parallel ops
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()

    // Extract content - handle both formats
    let userQuery = ''
    if (lastUserMessage) {
      if (lastUserMessage.content) {
        userQuery = typeof lastUserMessage.content === 'string'
          ? lastUserMessage.content
          : ''
      } else if (lastUserMessage.parts) {
        userQuery = lastUserMessage.parts
          .filter((p: { type: string }) => p.type === 'text')
          .map((p: { text: string }) => p.text)
          .join('\n')
      }
    }

    // Run chatbot fetch and RAG in parallel for better performance
    // Only run RAG if there's actual content to search for
    const [chatbot, relevantSources] = await Promise.all([
      getChatbot(activeChatbotId),
      userQuery.trim().length > 0
        ? retrieveRelevantSources(activeChatbotId, userQuery, 5, 0.3)
        : Promise.resolve([]),
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
    const effectiveTemperature = temperature !== undefined ? temperature : (chatbot?.temperature || 0.7)
    const effectiveInstructions = instructions || chatbot?.instructions || ''

    // Build context from sources with workflow
    const sourceContext = buildSourceContext(relevantSources, chatbot)

    // Build system message with guardrails prepended
    const systemMessage = {
      role: 'system' as const,
      content: `${GUARDRAIL_INSTRUCTIONS}${chatbot?.business_context || ''}

${effectiveInstructions}

THINKING TOOL USAGE:
You have access to a 'thinking' tool that displays your reasoning process to users. Use it when:
- Analyzing complex questions that require multiple considerations
- Comparing options or evaluating trade-offs
- Breaking down multi-part questions
- Researching or looking up information from the knowledge base

When using the thinking tool, provide steps with clear labels and descriptions. Mark steps as 'complete' when finished, 'active' for current step, and 'pending' for upcoming steps.

INLINE CITATIONS:
When you reference information from the RELEVANT SOURCES section below, cite them using numbered brackets that match the source number.
- Use [1] for Source 1, [2] for Source 2, etc.
- Place citations immediately after the relevant statement
- Example: "Custom software can significantly reduce manual work [1] and has been shown to improve customer satisfaction [2]."
- ALWAYS cite when mentioning specific facts, case studies, statistics, or recommendations from the knowledge base
- This creates clickable citation badges that users can hover over to see the source details

SUGGESTED QUESTIONS:
After each response, use the 'suggest_questions' tool to provide 2 relevant follow-up questions the user might want to ask.
- Questions should be natural continuations of the conversation
- Focus on helping the user explore their business needs further
- Make questions specific to what was just discussed

BANT PROGRESS TRACKING:
Use the 'report_bant_progress' tool to update what qualification information you have gathered from the user.
Call this tool whenever you learn new information about:
- need: What challenges, goals, or problems they want to solve
- timeline: When they need a solution implemented
- budget: Their investment range or budget considerations
- authority: Who makes decisions, their role in the organization
- contact: Their name or email address

This updates the progress indicator shown to the user. Mark items as true when you have gathered that information.

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
          visitor_metadata: visitorMetadata as unknown as Database['public']['Tables']['conversations']['Insert']['visitor_metadata'],
        }
        await supabaseServer
          .from('conversations')
          .insert([conversationData])
      })()
    }

    // OPTIMIZATION: Save user message in background (non-blocking)
    if (activeConversationId && userQuery) {
      const insertMessage = () =>
        supabaseServer.from('messages').insert([{
          conversation_id: activeConversationId,
          role: 'user',
          content: userQuery,
        }])
      // Ensure ordering: insert message only after conversation creation (if needed)
      if (conversationPromise) {
        void conversationPromise
          .then(() => insertMessage())
          .catch((err) => console.error('Error creating conversation before inserting message:', err))
      } else {
        void insertMessage().then(
          () => {},
          (err) => console.error('Error inserting user message:', err)
        )
      }
    }

    // Stream response - START IMMEDIATELY without waiting for DB writes
    // Vercel AI Gateway uses provider/model format (e.g., openai/gpt-4o-mini)
    const modelId = effectiveModel.includes('/') ? effectiveModel : `openai/${effectiveModel}`

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
            steps: z.array(z.object({
              label: z.string(),
              description: z.string().optional(),
              status: z.enum(['complete', 'active', 'pending']),
            })),
          }),
        }),
        suggest_questions: tool({
          description: 'Provide suggested follow-up questions for the user to click. Call this at the end of each response.',
          inputSchema: z.object({
            questions: z.array(z.string()).min(1).max(3).describe('1-3 relevant follow-up questions'),
          }),
        }),
        report_bant_progress: tool({
          description: 'Report what BANT qualification information has been gathered from the user. Call this when you learn new information.',
          inputSchema: z.object({
            need: z.boolean().describe('True if you know their challenges, goals, or problems'),
            timeline: z.boolean().describe('True if you know when they need a solution'),
            budget: z.boolean().describe('True if you know their budget or investment range'),
            authority: z.boolean().describe('True if you know their role or decision-making power'),
            contact: z.boolean().describe('True if you have their name or email'),
          }),
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
              const [messagesResult, conversationResult, sourcesResult] = await Promise.all([
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
                const leadData = await extractLeadData(
                  allMessages,
                  allSources || []
                )

                // Use conversation's visitor info if AI didn't extract it
                // (from intro forms where name/email are captured before chat)
                const visitorName = leadData?.contactInfo?.name || conversation?.visitor_name || undefined
                const visitorEmail = leadData?.contactInfo?.email || conversation?.visitor_email || undefined

                // Merge conversation visitor info into leadData for qualification check
                const enrichedLeadData = leadData ? {
                  ...leadData,
                  contactInfo: {
                    ...leadData.contactInfo,
                    name: visitorName,
                    email: visitorEmail,
                  }
                } : null

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
        'X-Sources-Used': JSON.stringify(
          sourceHeaderPayload
        ),
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
