'use client'

import { useChat } from '@ai-sdk/react'
import {
  Copy01Icon,
  PlusSignIcon,
  Refresh01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message'
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import Favicon from '@/components/intro/Favicon'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import { Button } from '@/components/ui/button'

import { useLeadsPageSettings } from '@/contexts/LeadsPageSettingsContext'

import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from '@/components/ai-elements/web-preview'

import './LeadsPageView.css'
import { type Citation, MessageWithCitations } from './MessageWithCitations'

interface LeadsPageViewProps {
  chatbotId: string
  showSidebar?: boolean
  forceSidebarCollapsed?: boolean
  editMode?: boolean
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
  visitorName?: string
  visitorEmail?: string
  initialConversationId?: string
}

export function LeadsPageView({
  chatbotId,
  showSidebar: _showSidebar = true,
  forceSidebarCollapsed: _forceSidebarCollapsed = false,
  editMode: _editMode = false,
  theme,
  onThemeChange,
  visitorName,
  visitorEmail,
  initialConversationId,
}: LeadsPageViewProps) {
  // Prefixed with _ to indicate intentionally unused (reserved for future use)
  void _showSidebar
  void _forceSidebarCollapsed
  void _editMode

  useLeadsPageSettings() // Keep the hook for context loading
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [disliked, setDisliked] = useState<Record<string, boolean>>({})
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if we're on the client to avoid SSR issues
  const isClient = typeof window !== 'undefined'

  const [, setShowDemo] = useState(true)
  const [messageCitations, setMessageCitations] = useState<Record<string, Citation[]>>({})
  const [pendingCitations, setPendingCitations] = useState<Citation[] | null>(null)
  const [, setEmailSentForConversation] = useState(false)
  const [, setConversationId] = useState<string | null>(initialConversationId ?? null)

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

      setPendingCitations(formatted.length > 0 ? formatted : null)
    } catch {
      setPendingCitations(null)
    }
  }, [])

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

      // Check for tool invocations
      for (const part of message.parts) {
        if (part.type.startsWith('tool-') && 'input' in part) {
          // Handle send_email_summary tool - now handled server-side
          if (part.type === 'tool-send_email_summary') {
            // Email is sent by the tool execution on the server
            // Just track that it was sent for this conversation
            setEmailSentForConversation(true)
          }
        }
      }

      setPendingCitations(null)
    },
    [pendingCitations]
  )

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
          chatbotId,
          conversationId: initialConversationId,
          // Pass visitor context to the AI
          instructions: visitorName
            ? `The visitor's name is ${visitorName}${visitorEmail ? ` and their email is ${visitorEmail}` : ''}. Greet them by name and make them feel welcome. They have just submitted the intro form to start their assessment.`
            : undefined,
        },
        fetch: interceptingFetch,
      }),
    [chatbotId, initialConversationId, visitorName, visitorEmail, interceptingFetch]
  )

  const { messages, sendMessage, status, setMessages, regenerate } = useChat<UIMessage>({
    transport: chatTransport,
    onFinish: handleChatFinish,
  })

  // Load existing messages when continuing a conversation
  const hasLoadedConversationRef = useRef(false)
  useEffect(() => {
    if (!initialConversationId || hasLoadedConversationRef.current) return
    hasLoadedConversationRef.current = true

    const loadExistingMessages = async () => {
      try {
        const response = await fetch(
          `/api/conversations?conversationId=${initialConversationId}`
        )
        if (!response.ok) return

        const data = await response.json()
        if (data.messages && data.messages.length > 0) {
          // Convert database messages to UIMessage format
          const uiMessages: UIMessage[] = data.messages.map(
            (msg: { id: string; role: string; content: string }) => ({
              id: msg.id,
              role: msg.role as 'user' | 'assistant',
              parts: [{ type: 'text', text: msg.content }],
            })
          )
          setMessages(uiMessages)
          setShowDemo(false)
        }
      } catch (error) {
        console.error('Failed to load conversation:', error)
      }
    }

    loadExistingMessages()
  }, [initialConversationId, setMessages])

  // Create initial AI greeting when visitor info is provided (only for new conversations)
  const hasInitialGreetingRef = useRef(false)
  useEffect(() => {
    // Don't show greeting if we're loading an existing conversation
    if (initialConversationId && hasLoadedConversationRef.current) return
    if (visitorName && !hasInitialGreetingRef.current && messages.length === 0) {
      hasInitialGreetingRef.current = true
      // Set the initial AI greeting message directly
      const greetingMessage: UIMessage = {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Hi ${visitorName}! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`,
          },
        ],
      }
      setMessages([greetingMessage])
    }
  }, [visitorName, messages.length, setMessages, initialConversationId])

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim() && message.files.length === 0) return
    setShowDemo(false)

    await sendMessage({
      text: message.text,
      files: message.files.length > 0 ? message.files : undefined,
    })
  }

  const isStreaming = status === 'streaming'

  // Suppress unused variable warnings for future use
  void theme
  void onThemeChange

  return (
    <div className="leads-page">
      {/* Titlebar */}
      <div className="leads-page__titlebar" role="banner">
        <div className="leads-page__titlebar-content">
          <Favicon className="leads-page__titlebar-icon" aria-hidden="true" />
          <h1 className="leads-page__titlebar-title">A.I. Consultation</h1>
        </div>
        <div className="leads-page__titlebar-content">
          <p className="leads-page__titlebar-subtitle">Powered by RoleModel Software</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="app__content">
        <div className="leads-page__content">
          {/* Conversation Messages Container */}

          <Conversation className="conversation-wrapper conversation-wrapper--scrollable">
            <ConversationContent>
              {messages.map((message, messageIndex) => (
                <Fragment key={message.id}>
                  {message.parts.map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        const isLastMessage = messageIndex === messages.length - 1
                        const citations = messageCitations[message.id]
                        const shouldRenderCitations =
                          message.role === 'assistant' &&
                          citations &&
                          citations.length > 0
                        if (shouldRenderCitations && i > 0) {
                          return null
                        }
                        return (
                          <Fragment key={`${message.id}-${i}`}>
                            <Message from={message.role}>
                              {message.role === 'assistant' && (
                                <div className="message-avatar">
                                  <Favicon style={{ width: 32, height: 32 }} />
                                </div>
                              )}
                              <MessageContent>
                                {shouldRenderCitations ? (
                                  <MessageWithCitations
                                    message={message}
                                    citations={citations}
                                  />
                                ) : isClient ? (
                                  <MessageResponse>{part.text}</MessageResponse>
                                ) : (
                                  <div>{part.text}</div>
                                )}

                                {message.role === 'assistant' && isLastMessage && (
                                  <MessageActions>
                                    <MessageAction
                                      label="Like"
                                      onClick={() =>
                                        setLiked((prev) => ({
                                          ...prev,
                                          [message.id]: !prev[message.id],
                                        }))
                                      }
                                      tooltip="Like this response"
                                    >
                                      <HugeiconsIcon
                                        icon={ThumbsUpIcon}
                                        size={16}
                                        color={
                                          liked[message.id] ? 'currentColor' : 'none'
                                        }
                                      />
                                    </MessageAction>
                                    <MessageAction
                                      label="Dislike"
                                      onClick={() =>
                                        setDisliked((prev) => ({
                                          ...prev,
                                          [message.id]: !prev[message.id],
                                        }))
                                      }
                                      tooltip="Dislike this response"
                                    >
                                      <HugeiconsIcon
                                        icon={ThumbsDownIcon}
                                        size={16}
                                        color={
                                          disliked[message.id] ? 'currentColor' : 'none'
                                        }
                                      />
                                    </MessageAction>
                                    <MessageAction
                                      onClick={() => regenerate()}
                                      label="Retry"
                                    >
                                      <HugeiconsIcon icon={Refresh01Icon} size={16} />
                                    </MessageAction>
                                    <MessageAction
                                      onClick={() =>
                                        navigator.clipboard.writeText(part.text)
                                      }
                                      label="Copy"
                                    >
                                      <HugeiconsIcon icon={Copy01Icon} size={16} />
                                    </MessageAction>
                                  </MessageActions>
                                )}
                              </MessageContent>
                            </Message>
                          </Fragment>
                        )
                      default: {
                        // Handle tool invocations
                        if (part.type === 'tool-invocation' || part.type.startsWith('tool-')) {
                          const toolPart = part as {
                            type: string
                            toolName?: string
                            toolCallId?: string
                            state?: string
                            result?: unknown
                            args?: { url?: string; title?: string; description?: string }
                          }

                          // Check for show_case_study tool
                          const isShowCaseStudy =
                            toolPart.toolName === 'show_case_study' ||
                            part.type === 'tool-show_case_study'

                          if (isShowCaseStudy && toolPart.args?.url) {
                            return (
                              <div
                                key={`${message.id}-${i}`}
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
                        }
                        return null
                      }
                    }
                  })}
                </Fragment>
              ))}
            </ConversationContent>
          </Conversation>

          <div className="leads-page__input-container">
            <div className="gradient" />
            <PromptInputProvider>
              <PromptInput onSubmit={handlePromptSubmit}>
                <PromptInputAttachments>
                  {(attachment) => (
                    <PromptInputAttachment key={attachment.id} data={attachment} />
                  )}
                </PromptInputAttachments>
                <PromptInputBody style={{ height: '80px' }}>
                  <PromptInputTextarea
                    placeholder="Tell me about your project..."
                    ref={textareaRef}
                  />
                </PromptInputBody>
                <PromptInputFooter>
                  <PromptInputTools>
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger>
                        <HugeiconsIcon icon={PlusSignIcon} size={20} />
                      </PromptInputActionMenuTrigger>
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                    <PromptInputSpeechButton textareaRef={textareaRef} />
                  </PromptInputTools>
                  <PromptInputSubmit status={isStreaming ? 'streaming' : undefined} />
                </PromptInputFooter>
              </PromptInput>
            </PromptInputProvider>
          </div>
          {/* Schedule a Call Button */}
          <div className="leads-page__suggestions">
            <Button
              variant="pill"
              onClick={() => {
                const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 'https://calendly.com/rolemodel-software/45-minute-conversation'
                window.open(calendlyUrl, '_blank')
              }}
            >
              Schedule a Call
            </Button>
          </div>
        </div>
      </div>

      <PrivacyTermsLinks className="leads-page__footer-links" />
    </div>
  )
}
