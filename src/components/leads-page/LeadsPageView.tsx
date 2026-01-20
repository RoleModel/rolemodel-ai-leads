'use client'

import { useChat } from '@ai-sdk/react'
import {
  Copy01Icon,
  Delete02Icon,
  PlusSignIcon,
  Refresh01Icon,
  Settings02Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage, isTextUIPart } from 'ai'
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
import Logo from '@/components/intro/Logo'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { useLeadsPageSettings } from '@/contexts/LeadsPageSettingsContext'

import {
  WebPreview,
  WebPreviewBody,
  WebPreviewNavigation,
  WebPreviewUrl,
} from '@/components/ai-elements/web-preview'

import './LeadsPageView.css'
import { type Citation, MessageWithCitations } from './MessageWithCitations'

interface Suggestion {
  id: string
  text: string
  isSelected?: boolean
}

interface ChatHistory {
  id: string
  title: string
  messages: UIMessage[]
  timestamp: number
}

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

const DEFAULT_SUGGESTIONS: Suggestion[] = [
  { id: '1', text: 'Are we outgrowing our current tools?' },
  { id: '2', text: 'How do we reduce manual work?' },
]

export function LeadsPageView({
  chatbotId,
  showSidebar = true,
  forceSidebarCollapsed = false,
  editMode = false,
  theme,
  onThemeChange,
  visitorName,
  visitorEmail,
  initialConversationId,
}: LeadsPageViewProps) {
  useLeadsPageSettings() // Keep the hook for context loading
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [disliked, setDisliked] = useState<Record<string, boolean>>({})
  const [suggestions, setSuggestions] = useState<Suggestion[]>(DEFAULT_SUGGESTIONS)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [activeSuggestionId, setActiveSuggestionId] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Check if we're on the client to avoid SSR issues
  const isClient = typeof window !== 'undefined'

  const [showDemo, setShowDemo] = useState(true)
  const [messageCitations, setMessageCitations] = useState<Record<string, Citation[]>>({})
  const [pendingCitations, setPendingCitations] = useState<Citation[] | null>(null)

  const handleChatResponse = useCallback((response: Response) => {
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
          const toolPart = part as { type: string; input?: Record<string, unknown> }

          // Handle suggest_questions tool
          if (part.type === 'tool-suggest_questions' && toolPart.input?.questions) {
            const questions = toolPart.input.questions as string[]
            if (questions.length > 0) {
              const newSuggestions: Suggestion[] = questions.map((q, i) => ({
                id: `suggestion-${Date.now()}-${i}`,
                text: q,
              }))
              setSuggestions(newSuggestions)
              setShowSuggestions(true)
            }
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
    if (!message.text.trim()) return
    setShowDemo(false)

    // Check if this was triggered by a suggestion click
    const isSuggestionClick = suggestions.some((s) => s.text === message.text)
    if (isSuggestionClick) {
      setShowSuggestions(false)
    }

    await sendMessage({
      text: message.text,
    })
  }

  const getMessageContent = useCallback((message: UIMessage) => {
    const textParts = message.parts.filter(isTextUIPart)
    return textParts.map((part) => part.text).join('\n')
  }, [])

  const isStreaming = status === 'streaming'

  // Suggestion handlers
  const handleAddSuggestion = () => {
    const newSuggestion: Suggestion = {
      id: `suggestion-${Date.now()}`,
      text: 'Suggestion',
      isSelected: true,
    }
    setSuggestions([
      ...suggestions.map((s) => ({ ...s, isSelected: false })),
      newSuggestion,
    ])
  }

  const handleDeleteSuggestion = (id: string) => {
    setSuggestions(suggestions.filter((s) => s.id !== id))
  }

  const handleUpdateSuggestion = (id: string, newText: string) => {
    setSuggestions(suggestions.map((s) => (s.id === id ? { ...s, text: newText } : s)))
  }

  // Dark mode handler
  const handleToggleDarkMode = () => {
    if (onThemeChange) {
      const newTheme = theme === 'dark' ? 'light' : 'dark'
      onThemeChange(newTheme)
    }
  }

  return (
    <div className="leads-page">
      {/* Logo Header */}
      <div className="leads-page__logo-header">
        <Logo variant="auto" style={{ width: 120, height: 'auto' }} />
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
          {/* Suggestions - always at bottom, hide when clicked */}
          {showSuggestions && (
            <div className="leads-page__suggestions">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="leads-page__suggestion-wrapper">
                  <Button
                    variant="pill"
                    onClick={() => {
                      if (editMode) {
                        setActiveSuggestionId(
                          suggestion.id === activeSuggestionId ? null : suggestion.id
                        )
                      } else {
                        handlePromptSubmit({ text: suggestion.text, files: [] })
                      }
                    }}
                  >
                    {suggestion.text}
                  </Button>
                  {editMode && activeSuggestionId === suggestion.id && (
                    <div className="leads-page__suggestion-actions">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="icon" size="sm">
                            <HugeiconsIcon icon={Settings02Icon} size={12} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80">
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium leading-none">
                                Edit Suggestion
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                Update the suggestion text
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <div className="grid gap-2">
                                <Label htmlFor={`suggestion-text-${suggestion.id}`}>
                                  Text
                                </Label>
                                <Input
                                  id={`suggestion-text-${suggestion.id}`}
                                  defaultValue={suggestion.text}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateSuggestion(
                                        suggestion.id,
                                        e.currentTarget.value
                                      )
                                      setActiveSuggestionId(null)
                                    }
                                  }}
                                  onBlur={(e) => {
                                    handleUpdateSuggestion(suggestion.id, e.target.value)
                                    setActiveSuggestionId(null)
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                      <Button
                        variant="icon"
                        size="sm"
                        onClick={() => {
                          handleDeleteSuggestion(suggestion.id)
                          setActiveSuggestionId(null)
                        }}
                      >
                        <HugeiconsIcon icon={Delete02Icon} size={12} />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {editMode && (
                <Button
                  variant="pill"
                  onClick={handleAddSuggestion}
                  style={{ borderStyle: 'dashed' }}
                >
                  <HugeiconsIcon icon={PlusSignIcon} size={16} />
                  Add Suggestion
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      <PrivacyTermsLinks className="leads-page__footer-links" />
    </div>
  )
}
