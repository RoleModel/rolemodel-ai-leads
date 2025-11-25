import { streamText, tool } from 'ai'
import { nanoid } from 'nanoid'
import { NextRequest } from 'next/server'
import { z } from 'zod'

import { openai } from '@/lib/ai/gateway'
import { extractLeadData, isQualifiedLead } from '@/lib/ai/lead-extraction'
import { buildSourceContext, getChatbot, retrieveRelevantSources } from '@/lib/ai/rag'
import type { Database } from '@/lib/supabase/database.types'
import { supabaseServer } from '@/lib/supabase/server'

export const runtime = 'edge'
export const maxDuration = 30

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, chatbotId, conversationId, model, temperature, instructions } = body

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Get chatbot configuration
    const chatbot = await getChatbot(activeChatbotId)
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

    // Get the last user message for RAG
    const lastUserMessage = messages
      .filter((m: { role: string }) => m.role === 'user')
      .pop()
    const userQuery = lastUserMessage?.content || ''

    // Retrieve relevant sources using vector search
    const relevantSources = await retrieveRelevantSources(
      activeChatbotId,
      userQuery,
      5,
      0.3 // Lower threshold to get more results
    )

    // Debug logging
    console.log('[RAG Debug] Query:', userQuery)
    console.log('[RAG Debug] Chatbot ID:', activeChatbotId)
    console.log('[RAG Debug] Sources retrieved:', relevantSources.length)
    console.log(
      '[RAG Debug] Source titles:',
      relevantSources.map((s) => s.title).join(', ')
    )
    if (relevantSources.length > 0) {
      console.log('[RAG Debug] Top source similarity:', relevantSources[0].similarity)
    }

    // Build context from sources with workflow
    const sourceContext = buildSourceContext(relevantSources, chatbot)

    // Build system message
    const systemMessage = {
      role: 'system' as const,
      content: `${chatbot?.business_context || ''}

${effectiveInstructions}

THINKING TOOL USAGE:
You have access to a 'thinking' tool that displays your reasoning process to users. Use it when:
- Analyzing complex questions that require multiple considerations
- Comparing options or evaluating trade-offs
- Breaking down multi-part questions
- Researching or looking up information from the knowledge base

When using the thinking tool, provide steps with clear labels and descriptions. Mark steps as 'complete' when finished, 'active' for current step, and 'pending' for upcoming steps.

${sourceContext}`,
    }

    // Combine system message with user messages
    const fullMessages = [systemMessage, ...messages]

    // Create or get conversation ID
    let activeConversationId = conversationId
    if (!activeConversationId) {
      type NewConversationType = { id: string }
      type ConversationInsert = { chatbot_id: string; visitor_id: string }
      const conversationData: ConversationInsert = {
        chatbot_id: activeChatbotId,
        visitor_id: nanoid(),
      }
      const { data: newConversation } = await supabaseServer
        .from('conversations')
        .insert([conversationData])
        .select()
        .single()

      activeConversationId = (newConversation as NewConversationType | null)?.id
    }

    // Save user message
    if (activeConversationId && userQuery) {
      type MessageInsert = Database['public']['Tables']['messages']['Insert']
      const messageData: MessageInsert = {
        conversation_id: activeConversationId,
        role: 'user',
        content: userQuery,
      }
      await supabaseServer.from('messages').insert([messageData])
    }

    // Stream response
    // Vercel AI Gateway uses provider/model format (e.g., openai/gpt-4o-mini)
    const modelId = effectiveModel.includes('/') ? effectiveModel : `openai/${effectiveModel}`

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
              // Get all conversation messages
              const { data: allMessages } = await supabaseServer
                .from('messages')
                .select('role, content')
                .eq('conversation_id', activeConversationId)
                .order('created_at', { ascending: true })

              if (allMessages && allMessages.length > 0) {
                // Extract lead data
                const leadData = await extractLeadData(allMessages)

                // Check if lead is qualified and hasn't been saved yet
                if (leadData && isQualifiedLead(leadData)) {
                  // Check if lead already exists for this conversation
                  const { data: existingLead } = await supabaseServer
                    .from('leads')
                    .select('id')
                    .eq('conversation_id', activeConversationId)
                    .single()

                  if (!existingLead) {
                    // Save the lead
                    type LeadInsert = Database['public']['Tables']['leads']['Insert']
                    const leadInsert: LeadInsert = {
                      conversation_id: activeConversationId,
                      visitor_name: leadData.contactInfo?.name || null,
                      visitor_email: leadData.contactInfo?.email || null,
                      summary:
                        leadData as Database['public']['Tables']['leads']['Insert']['summary'],
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
          relevantSources.map((s) => ({ id: s.id, title: s.title }))
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
