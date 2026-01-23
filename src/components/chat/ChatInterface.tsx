'use client'

import { useChat } from '@ai-sdk/react'
import { ThumbsDownIcon, ThumbsUpIcon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage, isTextUIPart } from 'ai'
import { AlertCircleIcon, CheckIcon, SearchIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
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
  type Citation,
  MessageWithCitations,
} from '@/components/leads-page/MessageWithCitations'
import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from '@/components/ai-elements/web-preview'
import { Button } from '@/components/ui/button'

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

interface ThinkingStep {
  label: string
  description: string
  status: 'complete' | 'active' | 'pending'
}

// Tool part from AI SDK - type is `tool-${toolName}`
interface ToolPart {
  type: string
  toolName?: string
  toolCallId?: string
  input?: {
    steps?: ThinkingStep[]
  }
  args?: {
    url?: string
    title?: string
    description?: string
    // For send_email_summary
    recipientEmail?: string
    recipientName?: string
    summaryText?: string
  }
}

export function ChatInterface({
  chatbotId,
  initialMessage,
  collectFeedback = true,
  playgroundSettings,
}: ChatInterfaceProps) {
  const [messageFeedback, setMessageFeedback] = useState<
    Map<string, 'positive' | 'negative'>
  >(new Map())
  const [messageCitations, setMessageCitations] = useState<Record<string, Citation[]>>({})
  const [pendingCitations, setPendingCitations] = useState<Citation[] | null>(null)
  const [emailSentForConversation, setEmailSentForConversation] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Handle chat response to extract citations from X-Sources-Used header
  const handleChatResponse = useCallback((response: Response) => {
    // Extract conversation ID for email sending
    const convId = response.headers.get('x-conversation-id')
    if (convId) {
      setConversationId(convId)
    }

    const header = response.headers.get('x-sources-used')
    if (!header) {
      setPendingCitations(null)
      return
    }

    try {
      const parsed = JSON.parse(header) as Array<{
        title: string
        url?: string | null
        snippet?: string
      }>
      const formatted: Citation[] = parsed
        .map((item) => ({
          title: item.title,
          url: item.url ?? undefined,
          description: item.snippet,
        }))
        .filter((item) => item.title || item.description || item.url)

      if (formatted.length > 0) {
        setPendingCitations(formatted)
      } else {
        setPendingCitations(null)
      }
    } catch {
      setPendingCitations(null)
    }
  }, [])

  // Handle chat finish to associate citations with messages
  const handleChatFinish = useCallback(
    ({ message }: { message: UIMessage }) => {
      if (message.role !== 'assistant') {
        setPendingCitations(null)
        return
      }

      if (pendingCitations && pendingCitations.length > 0) {
        setMessageCitations((prev) => ({
          ...prev,
          [message.id]: pendingCitations,
        }))
      }

      // Check for send_email_summary tool call and trigger email send
      const toolParts = message.parts.filter((part) =>
        part.type.startsWith('tool-')
      ) as unknown as ToolPart[]

      const emailToolPart = toolParts.find(
        (tp) => tp.toolName === 'send_email_summary' || tp.type === 'tool-send_email_summary'
      )

      if (emailToolPart?.args?.recipientEmail && emailToolPart?.args?.summaryText && !emailSentForConversation) {
        // Fire off email send request
        setEmailSentForConversation(true)
        fetch('/api/email-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recipientEmail: emailToolPart.args.recipientEmail,
            recipientName: emailToolPart.args.recipientName,
            summaryText: emailToolPart.args.summaryText,
            conversationId: conversationId,
          }),
        }).catch((error) => {
          console.error('[ChatInterface] Failed to send email:', error)
        })
      }

      setPendingCitations(null)
    },
    [pendingCitations, emailSentForConversation, conversationId]
  )

  // Intercepting fetch to capture response headers
  const interceptingFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(input, init)
      handleChatResponse(response.clone())
      return response
    },
    [handleChatResponse]
  )

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: {
          ...(chatbotId ? { chatbotId } : {}),
          ...(playgroundSettings
            ? {
              model: playgroundSettings.model,
              temperature: playgroundSettings.temperature,
              instructions: playgroundSettings.instructions,
            }
            : {}),
        },
        fetch: interceptingFetch,
      }),
    [chatbotId, playgroundSettings, interceptingFetch]
  )

  const { messages, sendMessage, status, setMessages } = useChat<UIMessage>({
    transport: chatTransport,
    onFinish: handleChatFinish,
  })

  const handleFeedback = useCallback(
    (messageId: string, feedback: 'positive' | 'negative') => {
      const isTogglingOff = messageFeedback.get(messageId) === feedback

      setMessageFeedback((prev) => {
        const next = new Map(prev)
        if (isTogglingOff) {
          next.delete(messageId)
        } else {
          next.set(messageId, feedback)
        }
        return next
      })

      const existingFeedback = JSON.parse(
        localStorage.getItem('chat-message-feedback') || '[]'
      ) as MessageFeedback[]

      const filteredFeedback = existingFeedback.filter((f) => f.messageId !== messageId)

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

  const getToolParts = (message: UIMessage): ToolPart[] => {
    return message.parts.filter((part) =>
      part.type.startsWith('tool-')
    ) as unknown as ToolPart[]
  }

  const renderChainOfThought = (toolPart: ToolPart) => {
    if (toolPart.type !== 'tool-thinking' || !toolPart.input?.steps) return null

    const getIcon = (status: string) => {
      switch (status) {
        case 'complete':
          return CheckIcon
        case 'active':
          return SearchIcon
        case 'pending':
          return AlertCircleIcon
        default:
          return CheckIcon
      }
    }

    return (
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader>Thinking...</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {toolPart.input.steps.map((step: ThinkingStep, index: number) => (
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

  const renderCaseStudyPreview = (toolPart: ToolPart) => {
    const isShowCaseStudy =
      toolPart.toolName === 'show_case_study' || toolPart.type === 'tool-show_case_study'

    if (!isShowCaseStudy || !toolPart.args?.url) return null

    return (
      <div
        className="case-study-preview"
        style={{
          margin: 'var(--op-space-medium) 0',
          maxWidth: '100%',
        }}
      >
        {toolPart.args.title && (
          <p
            style={{
              marginBottom: 'var(--op-space-small)',
              fontWeight: 500,
              color: 'var(--op-color-text)',
            }}
          >
            {toolPart.args.title}
          </p>
        )}
        {toolPart.args.description && (
          <p
            style={{
              marginBottom: 'var(--op-space-small)',
              fontSize: '0.875rem',
              color: 'var(--op-color-text-secondary)',
            }}
          >
            {toolPart.args.description}
          </p>
        )}
        <WebPreview defaultUrl={toolPart.args.url}>
          <WebPreviewNavigation>
            <WebPreviewUrl readOnly />
          </WebPreviewNavigation>
          <WebPreviewBody />
        </WebPreview>
      </div>
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
              const toolParts = getToolParts(message)
              const chainOfThought = toolParts.find((tp) => tp.type === 'tool-thinking')
              const caseStudyParts = toolParts.filter(
                (tp) => tp.toolName === 'show_case_study' || tp.type === 'tool-show_case_study'
              )
              const citations = messageCitations[message.id]
              const hasCitations =
                message.role === 'assistant' && citations && citations.length > 0

              return (
                <Message
                  key={message.id}
                  from={message.role === 'user' ? 'user' : 'assistant'}
                >
                  <MessageContent>
                    {chainOfThought && renderChainOfThought(chainOfThought)}
                    {caseStudyParts.map((tp, idx) => (
                      <div key={`case-study-${idx}`}>{renderCaseStudyPreview(tp)}</div>
                    ))}
                    {hasCitations ? (
                      <MessageWithCitations message={message} citations={citations} />
                    ) : (
                      <MessageResponse>{getMessageContent(message)}</MessageResponse>
                    )}
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
