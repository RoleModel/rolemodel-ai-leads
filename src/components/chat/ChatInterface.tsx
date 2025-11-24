'use client'

import { useChat } from '@ai-sdk/react'
import { ThumbsDownIcon, ThumbsUpIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { TextStreamChatTransport, type UIMessage, isTextUIPart } from 'ai'
import { useEffect, useMemo, useState } from 'react'

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputBody,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
} from '@/components/ai-elements/prompt-input'

interface ChatInterfaceProps {
  chatbotId?: string
  initialMessage?: string
  collectFeedback?: boolean
}

interface MessageFeedback {
  messageId: string
  feedback: 'positive' | 'negative'
  timestamp: number
}

export function ChatInterface({
  chatbotId,
  initialMessage,
  collectFeedback = true,
}: ChatInterfaceProps) {
  const [messageFeedback, setMessageFeedback] = useState<Map<string, 'positive' | 'negative'>>(
    new Map()
  )

  const chatTransport = useMemo(
    () =>
      new TextStreamChatTransport<UIMessage>({
        api: '/api/chat',
        body: chatbotId ? { chatbotId } : undefined,
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: {
            ...body,
            messages: messages.map((msg) => ({
              role: msg.role,
              content: msg.parts
                .filter((part) => part.type === 'text')
                .map((part) => (part as { type: 'text'; text: string }).text)
                .join('\n'),
            })),
          },
        }),
      }),
    [chatbotId]
  )

  const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
    transport: chatTransport,
  })

  const handleFeedback = (messageId: string, feedback: 'positive' | 'negative') => {
    const isTogglingOff = messageFeedback.get(messageId) === feedback

    setMessageFeedback((prev) => {
      const next = new Map(prev)
      if (isTogglingOff) {
        // Toggle off if clicking the same button
        next.delete(messageId)
      } else {
        next.set(messageId, feedback)
      }
      return next
    })

    // Store feedback in localStorage
    const existingFeedback = JSON.parse(
      localStorage.getItem('chat-message-feedback') || '[]'
    ) as MessageFeedback[]

    // Remove existing feedback for this message
    const filteredFeedback = existingFeedback.filter((f) => f.messageId !== messageId)

    // Add new feedback if not toggling off
    if (!isTogglingOff) {
      const feedbackData: MessageFeedback = {
        messageId,
        feedback,
        timestamp: Date.now(),
      }
      filteredFeedback.push(feedbackData)
    }

    localStorage.setItem('chat-message-feedback', JSON.stringify(filteredFeedback))
  }

  // Set initial message on mount
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      setMessages([
        {
          id: 'initial',
          role: 'assistant',
          parts: [{ type: 'text', text: initialMessage }],
        },
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
    return textParts.map((part) => part.text).join('\n')
  }

  const isStreaming = status === 'streaming'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        backgroundColor: 'inherit',
      }}
    >
      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'var(--op-space-medium)',
        }}
      >
        <Conversation>
          <ConversationContent>
            {messages.map((message) => (
              <Message
                key={message.id}
                from={message.role === 'user' ? 'user' : 'assistant'}
              >
                <MessageContent>
                  <MessageResponse>{getMessageContent(message)}</MessageResponse>
                  {collectFeedback && message.role === 'assistant' && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 'var(--op-space-x-small)',
                        marginTop: 'var(--op-space-small)',
                      }}
                    >
                      <button
                        onClick={() => handleFeedback(message.id, 'positive')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--op-color-border)',
                          borderRadius: 'var(--op-radius-small)',
                          padding: 'var(--op-space-x-small)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color:
                            messageFeedback.get(message.id) === 'positive'
                              ? 'var(--op-color-alerts-notice-base)'
                              : 'var(--op-color-neutral-on-plus-max)',
                          backgroundColor:
                            messageFeedback.get(message.id) === 'positive'
                              ? 'var(--op-color-alerts-notice-minus-eight)'
                              : 'transparent',
                        }}
                        aria-label="Thumbs up"
                      >
                        <HugeiconsIcon icon={ThumbsUpIcon} size={16} />
                      </button>
                      <button
                        onClick={() => handleFeedback(message.id, 'negative')}
                        style={{
                          background: 'none',
                          border: '1px solid var(--op-color-border)',
                          borderRadius: 'var(--op-radius-small)',
                          padding: 'var(--op-space-x-small)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          color:
                            messageFeedback.get(message.id) === 'negative'
                              ? 'var(--op-color-alerts-danger-base)'
                              : 'var(--op-color-neutral-on-plus-max)',
                          backgroundColor:
                            messageFeedback.get(message.id) === 'negative'
                              ? 'var(--op-color-alerts-danger-minus-eight)'
                              : 'transparent',
                        }}
                        aria-label="Thumbs down"
                      >
                        <HugeiconsIcon icon={ThumbsDownIcon} size={16} />
                      </button>
                    </div>
                  )}
                </MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: 'var(--op-space-medium)',
          backgroundColor: 'inherit',
        }}
      >
        <PromptInputProvider>
          <PromptInput
            onSubmit={async (message) => {
              if (message.text) {
                await handleSubmit(message.text)
              }
            }}
          >
            <PromptInputBody>
              <PromptInputTextarea placeholder="Message..." disabled={isStreaming} />
            </PromptInputBody>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
              <PromptInputSubmit disabled={isStreaming} />
            </div>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  )
}
