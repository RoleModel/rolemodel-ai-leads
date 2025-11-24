"use client"

import { useMemo, useEffect } from "react"
import { useChat } from "@ai-sdk/react"
import { TextStreamChatTransport, isTextUIPart, type UIMessage } from "ai"
import {
  Conversation,
  ConversationContent,
} from "@/components/ai-elements/conversation"
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message"
import {
  PromptInput,
  PromptInputProvider,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input"

interface ChatInterfaceProps {
  chatbotId?: string
  initialMessage?: string
}

export function ChatInterface({ chatbotId, initialMessage }: ChatInterfaceProps) {
  const chatTransport = useMemo(
    () => new TextStreamChatTransport<UIMessage>({
      api: "/api/chat",
      body: chatbotId ? { chatbotId } : undefined,
      prepareSendMessagesRequest: ({ messages, body }) => ({
        body: {
          ...body,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.parts
              .filter(part => part.type === 'text')
              .map(part => (part as { type: 'text'; text: string }).text)
              .join('\n')
          }))
        }
      })
    }),
    [chatbotId]
  )

  const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
    transport: chatTransport,
  })

  // Set initial message on mount
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          role: 'assistant',
          parts: [{ type: 'text', text: initialMessage }],
        }
      ])
    }
  }, [initialMessage, messages.length, setMessages])

  const handleSubmit = async (text: string) => {
    await sendMessage({
      text,
    })
  }

  const getMessageContent = (message: UIMessage) => {
    const textParts = message.parts.filter(isTextUIPart)
    return textParts.map((part) => part.text).join("\n")
  }

  const isStreaming = status === "streaming"

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column' as const,
      height: '100%',
      backgroundColor: 'inherit',
    }}>
      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--op-space-medium)',
      }}>
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message
                key={message.id}
                from={message.role === 'user' ? 'user' : 'assistant'}
              >
                <MessageContent>
                  <MessageResponse>
                    {getMessageContent(message)}
                  </MessageResponse>
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
      </div>

      {/* Input Area */}
      <div style={{
        padding: 'var(--op-space-medium)',
        backgroundColor: 'inherit',
      }}>
        <PromptInputProvider>
          <PromptInput onSubmit={async (message) => {
            if (message.text) {
              await handleSubmit(message.text)
            }
          }}>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Message..."
                disabled={isStreaming}
              />
            </PromptInputBody>
            <PromptInputSubmit disabled={isStreaming} />
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  )
}
