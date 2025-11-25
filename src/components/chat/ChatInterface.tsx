'use client'

import { Button } from '@/components/ui/button'
import { useChat } from '@ai-sdk/react'
import { ThumbsDownIcon, ThumbsUpIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { TextStreamChatTransport, type UIMessage, isTextUIPart } from 'ai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckIcon, AlertCircleIcon, SearchIcon } from 'lucide-react'

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
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'

interface PlaygroundSettings {
  model: string
  temperature: number
  instructions: string
}

interface ChatInterfaceProps {
  chatbotId?: string
  initialMessage?: string
  collectFeedback?: boolean
  playgroundSettings?: PlaygroundSettings
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
  playgroundSettings,
}: ChatInterfaceProps) {
  const [messageFeedback, setMessageFeedback] = useState<Map<string, 'positive' | 'negative'>>(
    new Map()
  )

  const chatTransport = useMemo(
    () =>
      new TextStreamChatTransport<UIMessage>({
        api: '/api/chat',
        body: {
          ...(chatbotId ? { chatbotId } : {}),
          ...(playgroundSettings ? {
            model: playgroundSettings.model,
            temperature: playgroundSettings.temperature,
            instructions: playgroundSettings.instructions,
          } : {}),
        },
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
    [chatbotId, playgroundSettings]
  )

  const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
    transport: chatTransport,
  })

  const handleFeedback = useCallback(
    (messageId: string, feedback: 'positive' | 'negative') => {
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
        const now = Date.now()
        const feedbackData: MessageFeedback = {
          messageId,
          feedback,
          timestamp: now,
        }
        filteredFeedback.push(feedbackData)
      }

      localStorage.setItem('chat-message-feedback', JSON.stringify(filteredFeedback))
    },
    [messageFeedback]
  )

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

  const getToolCalls = (message: UIMessage) => {
    return message.parts.filter((part) => part.type === 'tool-call')
  }

  const renderChainOfThought = (toolCall: any) => {
    if (toolCall.name !== 'thinking' || !toolCall.args?.steps) return null

    const getIcon = (status: string) => {
      switch (status) {
        case 'complete': return CheckIcon
        case 'active': return SearchIcon
        case 'pending': return AlertCircleIcon
        default: return CheckIcon
      }
    }

    return (
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader>Thinking...</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {toolCall.args.steps.map((step: any, index: number) => (
            <ChainOfThoughtStep
              key={index}
              label={step.label}
              description={step.description}
              status={step.status}
              icon={getIcon(step.status)}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    )
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
            {messages.map((message) => {
              const toolCalls = getToolCalls(message)
              const chainOfThought = toolCalls.find((tc: any) => tc.name === 'thinking')

              return (
                <Message
                  key={message.id}
                  from={message.role === 'user' ? 'user' : 'assistant'}
                >
                  <MessageContent>
                    {chainOfThought && renderChainOfThought(chainOfThought)}
                    <MessageResponse>{getMessageContent(message)}</MessageResponse>
                    {collectFeedback && message.role === 'assistant' && (
                      <div
                        style={{
                          display: 'flex',
                          gap: 'var(--op-space-x-small)',
                          marginTop: 'var(--op-space-small)',
                        }}
                      >
                        <Button
                          variant="icon"
                          onClick={() => handleFeedback(message.id, 'positive')}
                          aria-label="Thumbs up"
                          style={{
                            backgroundColor: 'var(--op-color-background)',
                          }}
                        >
                          <HugeiconsIcon icon={ThumbsUpIcon} size={16} />
                        </Button>
                        <Button
                          variant="icon"
                          onClick={() => handleFeedback(message.id, 'negative')}
                          style={{
                            backgroundColor: 'var(--op-color-background)',
                          }}
                          aria-label="Thumbs down"
                        >
                          <HugeiconsIcon icon={ThumbsDownIcon} size={16} />
                        </Button>
                      </div>
                    )}
                  </MessageContent>
                </Message>
              )
            })}
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
