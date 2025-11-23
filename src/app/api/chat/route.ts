import { NextRequest } from "next/server"
import { streamText } from "ai"
import { openai } from "@/lib/ai/gateway"
import { retrieveRelevantSources, buildSourceContext, getChatbot } from "@/lib/ai/rag"
import { supabaseServer } from "@/lib/supabase/server"
import { nanoid } from "nanoid"

export const runtime = "edge"
export const maxDuration = 30

const DEFAULT_CHATBOT_ID = "a0000000-0000-0000-0000-000000000001"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { messages, chatbotId, conversationId } = body

    const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID

    // Get chatbot configuration
    const chatbot = await getChatbot(activeChatbotId)
    if (!chatbot) {
      return new Response(JSON.stringify({ error: "Chatbot not found", chatbotId: activeChatbotId }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get the last user message for RAG
    const lastUserMessage = messages.filter((m: { role: string }) => m.role === 'user').pop()
    const userQuery = lastUserMessage?.content || ""

    // Retrieve relevant sources using vector search
    const relevantSources = await retrieveRelevantSources(
      activeChatbotId,
      userQuery,
      5,
      0.3 // Lower threshold to get more results
    )

    // Build context from sources
    const sourceContext = buildSourceContext(relevantSources)

    // Build system message
    const systemMessage = {
      role: "system" as const,
      content: `${chatbot?.business_context || ""}

${chatbot?.instructions || ""}

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
        // @ts-expect-error - Supabase type inference issue, types work at runtime
        .insert([conversationData])
        .select()
        .single()

      activeConversationId = (newConversation as NewConversationType | null)?.id
    }

    // Save user message
    if (activeConversationId && userQuery) {
      type MessageInsert = { conversation_id: string; role: 'user' | 'assistant'; content: string }
      const messageData: MessageInsert = {
        conversation_id: activeConversationId,
        role: 'user',
        content: userQuery,
      }
      // @ts-expect-error - Supabase type inference issue, types work at runtime
      await supabaseServer.from('messages').insert([messageData])
    }

    // Stream response
    // Vercel AI Gateway uses provider/model format (e.g., openai/gpt-4o-mini)
    const modelName = chatbot?.model || 'gpt-4o-mini'
    const modelId = modelName.includes('/') ? modelName : `openai/${modelName}`

    const result = streamText({
      model: openai(modelId),
      messages: fullMessages,
      temperature: chatbot?.temperature || 0.7,
      async onFinish({ text }) {
        // Save assistant message
        if (activeConversationId) {
          type MessageInsert = { conversation_id: string; role: 'user' | 'assistant'; content: string; sources_used?: unknown[] }
          const assistantMessage: MessageInsert = {
            conversation_id: activeConversationId,
            role: 'assistant',
            content: text,
            sources_used: relevantSources.map(s => ({ id: s.id, title: s.title })),
          }
          // @ts-expect-error - Supabase type inference issue, types work at runtime
          await supabaseServer.from('messages').insert([assistantMessage])

          // Track analytics event
          type AnalyticsInsert = { chatbot_id: string; conversation_id: string; event_type: string; metadata?: Record<string, unknown> }
          const analyticsData: AnalyticsInsert = {
            chatbot_id: activeChatbotId,
            conversation_id: activeConversationId,
            event_type: 'message',
            metadata: {
              message_count: messages.length + 1,
              sources_count: relevantSources.length,
            },
          }
          // @ts-expect-error - Supabase type inference issue, types work at runtime
          await supabaseServer.from('analytics_events').insert([analyticsData])
        }
      },
    })

    return result.toTextStreamResponse({
      headers: {
        'X-Conversation-ID': activeConversationId || '',
        'X-Sources-Used': JSON.stringify(relevantSources.map(s => ({ id: s.id, title: s.title }))),
      },
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
