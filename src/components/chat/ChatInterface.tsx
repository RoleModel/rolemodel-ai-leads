"use client"

import { useMemo, useState, useEffect, KeyboardEvent } from "react"
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
import { HugeiconsIcon } from '@hugeicons/react'
import { SentIcon, SmartIcon } from '@hugeicons-pro/core-stroke-standard'
import { Button } from "@/components/ui/button"

interface ChatInterfaceProps {
  chatbotId?: string
  initialMessage?: string
}

export function ChatInterface({ chatbotId, initialMessage }: ChatInterfaceProps) {
  const [input, setInput] = useState('')

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

  const handleSubmit = async () => {
    if (!input.trim()) return

    const messageText = input
    setInput('')

    await sendMessage({
      text: messageText,
    })
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
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
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--op-space-small)',
          backgroundColor: 'var(--op-color-background)',
          border: '1px solid var(--op-color-border)',
          borderRadius: 'var(--op-radius-large)',
          padding: 'var(--op-space-small)',
        }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message..."
            disabled={isStreaming}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'transparent',
              fontFamily: 'inherit',
              fontSize: 'var(--op-font-medium)',
              minHeight: '24px',
              maxHeight: '120px',
              padding: '8px',
            }}
            rows={1}
          />
          <Button
            onClick={() => { }}
            variant="ghost"
            style={{
              flexShrink: 0,
              width: '32px',
              height: '32px',
              padding: 0,
            }}
          >
            <HugeiconsIcon icon={SmartIcon} size={24} />
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isStreaming || !input.trim()}
            size="md"
            variant="ghost"
          >
            <HugeiconsIcon icon={SentIcon} size={24} />
          </Button>
        </div>
      </div>
    </div>
  )
}
