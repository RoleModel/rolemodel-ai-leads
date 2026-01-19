'use client'

import { useChat } from '@ai-sdk/react'
import { useGSAP } from '@gsap/react'
import {
  Copy01Icon,
  PlusSignIcon,
  Refresh01Icon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import gsap from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

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
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import Favicon from '@/components/intro/Favicon'
import Logo from '@/components/intro/Logo'
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
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import ScrollIndicator from '@/components/ui/ScrollIndicator'
import { Card, CardAction, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

import { trackConversion, trackEngagement, trackView } from '@/lib/ab-testing/tracking'

import {
  LeadsPageSettingsProvider,
  useLeadsPageSettings,
} from '@/contexts/LeadsPageSettingsContext'

import '@/styles/ai-elements.css'

import '../leads-page/LeadsPageView.css'
import styles from './landing-page-b.module.css'

gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger, ScrollSmoother)

const AnimatedPath = dynamic(() => import('./AnimatedPath'), { ssr: false })

const STORAGE_KEY = 'intro-b-visitor'

interface VisitorData {
  name: string
  email: string
  conversationId: string
}

// Use useSyncExternalStore to safely read sessionStorage
function useSessionStorage<T>(key: string): T | null {
  const subscribe = (callback: () => void) => {
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }

  const getSnapshot = () => {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(key)
  }

  const getServerSnapshot = () => null

  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  if (!stored) return null
  try {
    return JSON.parse(stored) as T
  } catch {
    return null
  }
}

interface FloatingQuestion {
  id: string
  text: string
  angle: number
  distance: number
}

const questions: FloatingQuestion[] = [
  { id: 'fit', text: 'Will this scale as we grow?', angle: 0, distance: 550 },
  { id: 'cost', text: 'What investment should I expect?', angle: 60, distance: 550 },
  { id: 'timeline', text: 'How long until I see value?', angle: 120, distance: 550 },
  {
    id: 'integration',
    text: 'Will this work with our existing tools?',
    angle: 180,
    distance: 550,
  },
  { id: 'roi', text: 'What kind of ROI is realistic?', angle: 240, distance: 550 },
  { id: 'risk', text: 'How can we reduce risk?', angle: 300, distance: 550 },
]

export interface LandingPageBProps {
  title?: string
  line2?: string
  highlight?: string
  punctuation?: string
  subheadline?: string
  className?: string
  chatbotId?: string
  isEmbed?: boolean
}

export function LandingPageB(props: LandingPageBProps) {
  return (
    <LeadsPageSettingsProvider>
      <LandingBInner {...props} />
    </LeadsPageSettingsProvider>
  )
}

export function HeroChatComponent(props: HeroChatProps) {
  return (
    <LeadsPageSettingsProvider>
      <HeroChat {...props} />
    </LeadsPageSettingsProvider>
  )
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export interface HeroChatProps {
  chatbotId?: string
  initialQuestion?: string | null
  onQuestionConsumed?: () => void
}

export function HeroChat(props: HeroChatProps) {
  const { chatbotId, initialQuestion, onQuestionConsumed } = props
  useLeadsPageSettings()

  // Check for existing session
  const storedVisitor = useSessionStorage<VisitorData>(STORAGE_KEY)
  const hasExistingSession = storedVisitor !== null

  // Initialize state with defaults
  const [step, setStep] = useState<'intro' | 'chat'>('intro')
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)

  // Track if we've restored the session
  const hasRestoredSessionRef = useRef(false)

  // Restore session from storage after hydration
  useEffect(() => {
    if (hasExistingSession && step === 'intro' && !hasRestoredSessionRef.current) {
      hasRestoredSessionRef.current = true
      setStep('chat')
      setFormData({
        name: storedVisitor?.name || '',
        email: storedVisitor?.email || '',
      })
      setConversationId(storedVisitor?.conversationId || null)
    }
  }, [hasExistingSession, step, storedVisitor])
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [disliked, setDisliked] = useState<Record<string, boolean>>({})
  const [messageCitations, setMessageCitations] = useState<Record<string, Citation[]>>({})
  const [pendingCitations, setPendingCitations] = useState<Citation[] | null>(null)

  const activeChatbotId = chatbotId || 'a0000000-0000-0000-0000-000000000001'

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
        setMessageCitations((prev) => ({ ...prev, [message.id]: pendingCitations }))
      }
      setPendingCitations(null)
    },
    [pendingCitations]
  )

  const interceptingFetch = useCallback(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      try {
        const response = await fetch(input, init)
        handleChatResponse(response.clone())
        return response
      } catch (error) {
        throw error
      }
    },
    [handleChatResponse]
  )

  const chatTransport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/chat',
        body: { chatbotId: activeChatbotId, conversationId },
        fetch: interceptingFetch,
      }),
    [activeChatbotId, conversationId, interceptingFetch]
  )

  // Create initial greeting message for returning visitors
  const initialGreetingMessages = useMemo((): UIMessage[] => {
    if (!storedVisitor) return []

    const greeting = storedVisitor.name
      ? `Welcome back, ${storedVisitor.name}! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`
      : `Hi! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`

    return [{
      id: `greeting-${Date.now()}`,
      role: 'assistant' as const,
      parts: [{ type: 'text' as const, text: greeting }],
    }]
  }, [storedVisitor])

  const { messages, setMessages, sendMessage, regenerate, status, error } = useChat<UIMessage>({
    transport: chatTransport,
    messages: initialGreetingMessages,
    onFinish: handleChatFinish,
    onError: (err) => console.error('[Chat] Error:', err),
  })

  useEffect(() => {
    if (error) console.error('[Chat] Hook error state:', error)
  }, [error])

  const isStreaming = status === 'streaming'
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return

    // Dispatch conversion event for A/B tracking (only on first message)
    if (messages.length === 0 && typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('intro-b-conversion'))
    }

    await sendMessage({ text: message.text })
  }

  const handleStartChat = async () => {
    if (!formData.name || !formData.email) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/intro-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          chatbotId: activeChatbotId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const result = await response.json()
      setConversationId(result.conversationId)

      // Persist to sessionStorage for page refresh
      const visitor: VisitorData = {
        name: formData.name,
        email: formData.email,
        conversationId: result.conversationId,
      }
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visitor))

      // Add initial greeting message
      const greeting: UIMessage = {
        id: `greeting-${Date.now()}`,
        role: 'assistant',
        parts: [{
          type: 'text',
          text: `Hi ${formData.name}! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`,
        }],
      }
      setMessages([greeting])

      // Dispatch conversion event for A/B tracking
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('intro-b-conversion'))
      }

      setStep('chat')
    } catch (error) {
      console.error('Error submitting lead form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      sendMessage({ text: initialQuestion })
      onQuestionConsumed?.()
    }
  }, [initialQuestion, onQuestionConsumed, sendMessage])

  const isClient = typeof window !== 'undefined'

  const suggestions = [
    "I have a workflow problem I'd like to discuss",
    "We're exploring options for our business",
  ]

  const handleExternalSuggestion = useCallback(
    (event: Event) => {
      const custom = event as CustomEvent<{ text?: string }>
      const text = custom?.detail?.text?.trim()
      if (!text) return
      sendMessage({ text })
      textareaRef.current?.focus()
    },
    [sendMessage]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const listener = handleExternalSuggestion as EventListener
    window.addEventListener('hero-submit-suggestion', listener)
    return () => window.removeEventListener('hero-submit-suggestion', listener)
  }, [handleExternalSuggestion])

  return (<>

    {step === 'intro' ? (
      <Card
        variant="dark"
        borderBottom="var(--brand-Light-Purple)"
        className={styles['lead-card']}
      >
        <CardHeader>
          <h2 className={styles['card-title']}>
            <span>Let&apos;s see if we&apos;re a </span>
            <span className={styles['chat-title-text']}>
              fit.
              <span className={styles['chat-title-underline']}></span>
            </span>
          </h2>
        </CardHeader>
        <CardContent>
          <p className={styles['lead-form__subtitle']}>
            Share a few details and we&apos;ll help you explore whether custom software
            makes sense for your business.
          </p>
          <form
            className={styles['lead-form__form']}
            onSubmit={(e) => {
              e.preventDefault()
              void handleStartChat()
            }}
          >
            <div className="form-group form-group--on-dark">
              <label className="form-label" htmlFor="lead-name">
                Full Name
              </label>
              <Input
                id="lead-name"
                type="text"
                name="name"
                autoComplete="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-control--large form-control--no-border form-control-border-bottom"
                placeholder="Jane Doe"
              />
            </div>
            <div className="form-group form-group--on-dark">
              <label className="form-label" htmlFor="lead-email">
                Work Email
              </label>
              <Input
                id="lead-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="form-control--large form-control--no-border form-control-border-bottom"
                placeholder="jane@company.com"
              />
            </div>
            <CardAction>
              <button
                type="submit"
                className="btn btn--primary btn--large"
                disabled={!formData.name || !formData.email || isSubmitting}
              >
                {isSubmitting ? 'Starting...' : 'Start Conversation'}
              </button>
            </CardAction>
          </form>
        </CardContent>
      </Card>
    ) : (
      <div className={`chat-container ${styles['chat-container']}`}>
        <Conversation className="conversation-wrapper conversation-wrapper--flex">
          <ConversationContent>
            {messages.map((message) => (
              <Fragment key={message.id}>
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${index}`}>
                          <Message from={message.role}>
                            {message.role === 'assistant' && (
                              <div className="message-avatar">
                                <Favicon
                                  className="message-avatar__image"
                                  style={{
                                    width: 'var(--op-space-x-large)',
                                    height: 'var(--op-space-x-large)',
                                  }}
                                />
                              </div>
                            )}
                            <MessageContent>
                              {isClient ? (
                                messageCitations[message.id]?.length ? (
                                  <MessageWithCitations
                                    message={message}
                                    citations={messageCitations[message.id]}
                                  />
                                ) : (
                                  <MessageResponse>{part.text}</MessageResponse>
                                )
                              ) : (
                                <div>{part.text}</div>
                              )}
                              {message.role === 'assistant' && (
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
                      // Debug: log all non-text parts
                      console.log('[LandingPageB] Non-text part:', part.type, JSON.stringify(part).slice(0, 500))

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

                        console.log('[LandingPageB] Tool part detected:', toolPart.toolName, toolPart.args)

                        // Check for show_case_study tool
                        const isShowCaseStudy =
                          toolPart.toolName === 'show_case_study' ||
                          part.type === 'tool-show_case_study'

                        if (isShowCaseStudy && toolPart.args?.url) {
                          console.log('[LandingPageB] Rendering case study preview:', toolPart.args.url)
                          return (
                            <div
                              key={`${message.id}-${index}`}
                              className="case-study-preview"
                              style={{
                                margin: 'var(--op-space-medium) 0',
                                maxWidth: '100%',
                              }}
                            >
                              {toolPart.args.title && (
                                <p style={{
                                  marginBottom: 'var(--op-space-small)',
                                  fontWeight: 500,
                                  color: 'var(--op-color-text)',
                                }}>
                                  {toolPart.args.title}
                                </p>
                              )}
                              {toolPart.args.description && (
                                <p style={{
                                  marginBottom: 'var(--op-space-small)',
                                  fontSize: '0.875rem',
                                  color: 'var(--op-color-text-secondary)',
                                }}>
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

        <div className="prompt-input-wrapper">
          <div className="gradient" style={{ top: '80%' }} />
          <PromptInputProvider>
            <PromptInput onSubmit={handlePromptSubmit}>
              <PromptInputBody>
                <PromptInputTextarea
                  ref={textareaRef}
                  placeholder="Ask a question..."
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
        {messages.length < 3 && (
          <div className="suggestions-container">
            <Suggestions>
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  size="lg"
                  onClick={() => handlePromptSubmit({ text: suggestion, files: [] })}
                  suggestion={suggestion}
                />
              ))}
            </Suggestions>
          </div>
        )}
      </div>
    )}
  </>
  )
}

const AB_TEST_PATH = '/intro/b'

function LandingBInner({
  title = 'Is custom software',
  line2 = 'the right',
  highlight = 'fit',
  punctuation = '?',
  className,
  chatbotId,
  isEmbed = false,
}: LandingPageBProps) {
  useLeadsPageSettings()
  const [isMobile, setIsMobile] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)

  // Track page view and scroll engagement
  useEffect(() => {
    trackView(AB_TEST_PATH)

    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercentage > 50) {
        trackEngagement(AB_TEST_PATH, { scrollDepth: scrollPercentage })
        window.removeEventListener('scroll', handleScroll)
      }
    }

    const handleConversion = () => {
      trackConversion(AB_TEST_PATH, { action: 'chat_started' })
    }

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('intro-b-conversion', handleConversion)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('intro-b-conversion', handleConversion)
    }
  }, [])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 768px)')
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const checkMobile = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsMobile(e.matches)
    const checkDark = (e: MediaQueryListEvent | MediaQueryList) =>
      setIsDarkMode(e.matches)

    checkMobile(mobileQuery)
    checkDark(darkQuery)

    mobileQuery.addEventListener('change', checkMobile)
    darkQuery.addEventListener('change', checkDark)

    return () => {
      mobileQuery.removeEventListener('change', checkMobile)
      darkQuery.removeEventListener('change', checkDark)
    }
  }, [])

  const containerRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const gridOpacityRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([])
  const titleBoxRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const descriptionRef = useRef<HTMLDivElement>(null)
  const cardsWrapperRef = useRef<HTMLDivElement>(null)
  const scrollIndicatorRef = useRef<HTMLDivElement>(null)
  const formBoxRef = useRef<HTMLDivElement>(null)
  const glowRef = useRef<HTMLDivElement>(null)

  const progressRef = useRef(0)
  const mouseRef = useRef({ x: 0.5, y: 0.5 })
  const smoothMouseRef = useRef({ x: 0.5, y: 0.2 })
  const rotationRef = useRef(0)
  const panelSizeRef = useRef({ width: 0, height: 0 })
  const panelOffsetRef = useRef({ x: 0, y: 0 })
  const panelRef = useRef<HTMLDivElement | null>(null)

  const [progress, setProgress] = useState(0)

  const orbitRadiusScale = 1.1
  const orbitVerticalScale = 0.4

  const getGridOffset = useCallback((index: number): { x: number; y: number } => {
    const col = index % 2
    const row = Math.floor(index / 2)
    const { width, height } = panelSizeRef.current
    const offset = panelOffsetRef.current

    if (width > 0 && height > 0) {
      const cols = 3
      const rows = 3
      const paddingX = width * 0.15
      const paddingY = height * 0.18
      const usableWidth = width - paddingX * 2
      const usableHeight = height - paddingY * 2
      const stepX = cols > 1 ? usableWidth / (cols - 1) : 0
      const stepY = rows > 1 ? usableHeight / (rows - 1) : 0
      const localX = -usableWidth / 2 + col * stepX
      const localY = -usableHeight / 2 + row * stepY
      return { x: localX + offset.x, y: localY + offset.y }
    }

    const cardWidth = 65 * 4 // calc(var(--op-size-unit) * 65) = 260px
    const cardHeight = 12.5 * 4 // calc(var(--op-size-unit) * 12.5) = 50px
    const gap = 16 // var(--op-space-medium) = 16px
    const gridWidth = cardWidth * 2 + gap
    const gridHeight = cardHeight * 3 + gap * 2
    const x = col * (cardWidth + gap) - gridWidth / 2 + cardWidth / 2
    const y = row * (cardHeight + gap) - gridHeight / 2 + cardHeight / 2
    return { x, y }
  }, [])

  const { contextSafe } = useGSAP(
    () => {
      const smoother = ScrollSmoother.create({
        wrapper: wrapperRef.current,
        content: contentRef.current,
        smooth: 0.5,
        effects: true,
        smoothTouch: 0.8,
      })

      smoother.scrollTo(0)

      ScrollTrigger.create({
        trigger: containerRef.current,
        scroller: smoother.wrapper(),
        start: 'top top',
        end: '30% top',
        scrub: 0.3,
        onUpdate: (self) => {
          const p = self.progress
          progressRef.current = p
          setProgress(p)

          const t = p * p

          const titleParallax = -300 * t
          const descParallax = -220 * t
          const cardsParallax = -100 * t
          const scrollIndicatorParallax = -250 * t
          const gridOpacity = 0.3 * (1 - t)

          if (titleRef.current) gsap.set(titleRef.current, { y: titleParallax })
          if (descriptionRef.current)
            gsap.set(descriptionRef.current, { y: descParallax })
          if (cardsWrapperRef.current)
            gsap.set(cardsWrapperRef.current, {
              opacity: Math.max(0, 1 - t),
              y: cardsParallax,
            })
          if (gridOpacityRef.current)
            gsap.set(gridOpacityRef.current, { opacity: gridOpacity })
          if (scrollIndicatorRef.current)
            gsap.set(scrollIndicatorRef.current, {
              opacity: Math.max(0, 1 - t),
              y: scrollIndicatorParallax,
            })

          // Fade glow based on scroll progress - restore when scrolling back up
          if (glowRef.current) {
            // Fade out as user scrolls, fade back in when scrolling up
            const glowOpacity = Math.max(0, 1 - p * 2)
            const glowScale = Math.max(0.5, 1 - p)
            gsap.set(glowRef.current, { opacity: glowOpacity, scale: glowScale })
          }
        },
      })

      gsap.fromTo(
        '#get-started',
        {
          y: 100,
          scale: 0.5,
        },
        {
          scale: 1,
          y: 0,
          scrollTrigger: {
            trigger: '#get-started',
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: true,
          },
        }
      )

      const handleMouse = (e: MouseEvent) => {
        mouseRef.current = {
          x: e.clientX / window.innerWidth,
          y: e.clientY / window.innerHeight,
        }

        // Animate glow to follow cursor (centered on mouse) - skip in dark mode or mobile
        // Only handle position here - scroll handler controls opacity/scale
        if (glowRef.current && !isMobile && !isDarkMode) {
          gsap.to(glowRef.current, {
            left: e.clientX,
            top: e.clientY,
            xPercent: -50,
            yPercent: -50,
            duration: 0.6,
            ease: 'power2.out',
          })
        }
      }
      window.addEventListener('mousemove', handleMouse)

      const updatePanelSize = () => {
        if (!panelRef.current || !cardsContainerRef.current) return
        const panelRect = panelRef.current.getBoundingClientRect()
        const containerRect = cardsContainerRef.current.getBoundingClientRect()
        panelSizeRef.current = { width: panelRect.width, height: panelRect.height }
        panelOffsetRef.current = {
          x:
            panelRect.left +
            panelRect.width / 2 -
            (containerRect.left + containerRect.width / 2),
          y:
            panelRect.top +
            panelRect.height / 2 -
            (containerRect.top + containerRect.height / 2),
        }
      }
      updatePanelSize()
      window.addEventListener('resize', updatePanelSize)

      let ticker: (() => void) | null = null

      if (!isMobile) {
        ticker = () => {
          // Use gsap's deltaRatio for frame-rate independent animation (1.0 at 60fps)
          const deltaRatio = gsap.ticker.deltaRatio(60)

          smoothMouseRef.current.x = lerp(
            smoothMouseRef.current.x,
            mouseRef.current.x,
            0.1 * deltaRatio
          )
          smoothMouseRef.current.y = lerp(
            smoothMouseRef.current.y,
            mouseRef.current.y,
            0.1 * deltaRatio
          )

          // Rotation speed: ~2.5 degrees per second at 60fps
          const rotationSpeed = 0.0417 * deltaRatio
          rotationRef.current += rotationSpeed * (1 - progressRef.current)

          const t = progressRef.current * progressRef.current

          const mouseInfluence = 40 * (1 - t)
          const mouseX = (smoothMouseRef.current.x - 0.5) * -mouseInfluence
          const mouseY = (smoothMouseRef.current.y - 0.5) * -mouseInfluence

          // Use raw mouse position for instant scale response
          const mousePxX = (mouseRef.current.x - 0.5) * window.innerWidth
          const mousePxY = (mouseRef.current.y - 0.5) * window.innerHeight

          const viewportPadding = 20
          const halfViewportW = window.innerWidth / 2 - viewportPadding
          const halfViewportH = window.innerHeight / 2 - viewportPadding

          // Mouse direction from center (normalized)
          const mouseLen = Math.sqrt(mousePxX * mousePxX + mousePxY * mousePxY) || 1
          const mouseDirX = mousePxX / mouseLen
          const mouseDirY = mousePxY / mouseLen

          questions.forEach((q, index) => {
            const cardEl = cardRefs.current[index]
            if (!cardEl) return

            const angle = q.angle + rotationRef.current
            const rad = (angle * Math.PI) / 180

            // Card direction (normalized)
            const cardDirX = Math.cos(rad)
            const cardDirY = Math.sin(rad) * orbitVerticalScale
            const cardLen = Math.sqrt(cardDirX * cardDirX + cardDirY * cardDirY) || 1
            const normCardX = cardDirX / cardLen
            const normCardY = cardDirY / cardLen

            // Dot product: 1 = same direction, -1 = opposite
            const dot = normCardX * mouseDirX + normCardY * mouseDirY

            // Scale: cards toward mouse scale up (1.12), cards away scale down (0.88)
            const baseScale = 0.8
            const scaleDelta = 0.22 * (1 - t)
            const cardScale = baseScale + (dot + 1) * 0.5 * scaleDelta

            let x = Math.cos(rad) * q.distance * orbitRadiusScale + mouseX
            let y =
              Math.sin(rad) * q.distance * orbitRadiusScale * orbitVerticalScale + mouseY

            const cardRect = cardEl.getBoundingClientRect()
            const halfCardW = cardRect.width / 2
            const halfCardH = cardRect.height / 2
            const maxX = halfViewportW - halfCardW
            const maxY = halfViewportH - halfCardH
            x = Math.max(-maxX, Math.min(maxX, x))
            y = Math.max(-maxY, Math.min(maxY, y))

            gsap.set(cardEl, { x, y, xPercent: -50, yPercent: -50 })
            cardEl.style.scale = String(cardScale)
          })
        }
        ticker()
        gsap.ticker.add(ticker)
      }

      return () => {
        window.removeEventListener('mousemove', handleMouse)
        window.removeEventListener('resize', updatePanelSize)
        if (ticker) gsap.ticker.remove(ticker)
      }
    },
    { scope: containerRef, dependencies: [isMobile, isDarkMode, getGridOffset] }
  )

  const handleCardClick = contextSafe(() => {
    const smoother = ScrollSmoother.get()
    if (smoother) {
      smoother.scrollTo('#get-started', true)
      return
    }
    gsap.to(window, { duration: 0.9, scrollTo: '#get-started' })
  })

  const handleScrollToSection = contextSafe((id: string) => {
    const target = `#${id}`
    const smoother = ScrollSmoother.get()
    if (smoother) {
      smoother.scrollTo(target, true)
      return
    }
    gsap.to(window, { duration: 1.3, scrollTo: target })
  })

  // Only render glow in light mode on desktop (expensive effect)
  const showGlow = !isMobile && !isDarkMode

  return (
    <div className="intro-b-page">
      <div ref={containerRef} className={`${styles.root} ${className || ''}`}>
        {showGlow && <div ref={glowRef} className={styles['hero-glow']} />}
        {!isEmbed && (
          <div className={styles.logo}>
            <Logo
              variant="auto"
              style={{ width: 'calc(var(--op-size-unit) * 30)', height: 'auto' }}
            />
          </div>
        )}
        <div className={styles['grid-background']} />
        <div ref={gridOpacityRef} className={styles.grid} />
        <div ref={wrapperRef} className={styles['smooth-wrapper']}>
          <div ref={contentRef} className={styles['smooth-content']}>
            <div className={styles.viewport}>
              <div ref={titleBoxRef} className={styles['title-box']}>
                <h1
                  ref={titleRef}
                  className={styles.title}
                  style={{ fontSize: isMobile ? '5.5rem' : '6.5vw' }}
                >
                  <span>{title}</span>{' '}
                  <div>
                    <span>{line2}</span>{' '}
                    <span className={styles.highlight}>
                      {highlight}
                      <AnimatedPath
                        className={styles['highlight-circle']}
                        stroke="var(--brand-RM-Logo-Blue)"
                        strokeWidth={4}
                        unit="em"
                        wunit="em"
                        height={1.3}
                        width={2.8}
                        speed={2}
                        delay={2}
                        trigger="in-view"
                        scrollProgress={progress}
                        preserveAspectRatio="none"
                        d="M1 52.6501C115.88 -2.08648 483.388 1.16489 499.75 52.6501C510.213 85.5762 454.384 99.1037 355.471 112.631C256.559 126.159 48.5456 125.915 17.3586 92.0694C-20.5347 50.9459 89.9842 -1.65508 260.277 3.32941C519.086 10.9048 527.267 80.7065 459.59 112.631"
                      />
                    </span>
                    {punctuation}
                  </div>
                </h1>
                <p ref={descriptionRef} className={styles.description}>
                  Our AI-powered tool helps you explore whether custom software makes
                  sense for your business—and connects you with the right resources either
                  way.
                </p>
              </div>

              {!isMobile && (
                <div ref={cardsContainerRef} className={styles['suggestions-container']}>
                  <div ref={cardsWrapperRef} className={styles.suggestions}>
                    {questions.map((q, index) => {
                      const rad = (q.angle * Math.PI) / 180
                      const initialX = Math.round(
                        Math.cos(rad) * q.distance * orbitRadiusScale
                      )
                      const initialY = Math.round(
                        Math.sin(rad) * q.distance * orbitRadiusScale * orbitVerticalScale
                      )
                      return (
                        <Suggestion
                          key={q.id}
                          ref={(el) => {
                            cardRefs.current[index] = el
                          }}
                          suggestion={q.text}
                          onClick={() => handleCardClick()}
                          tabIndex={index + 1}
                          className={styles.suggestion}
                          style={{
                            transform: `translate(calc(-50% + ${initialX}px), calc(-50% + ${initialY}px))`,
                          }}
                        >
                          <span className={styles['suggestion-text']}>{q.text}</span>
                        </Suggestion>
                      )
                    })}
                  </div>
                </div>
              )}

              <div ref={scrollIndicatorRef} className={styles.scroll}>
                <ScrollIndicator
                  borderColor="var(--brand-RM-Logo-Blue)"
                  borderOpacity={1}
                  dotColor="var(--brand-RM-Logo-Blue)"
                  pillWidth={24}
                  pillHeight={40}
                  dotSize={8}
                  borderWidth={2}
                  borderRadius={9999}
                  animationSpeed={1.5}
                  scrollType="section"
                  sectionName="get-started"
                  animationPreset="default"
                  minimalistFontSize={10}
                  minimalistSpeed={1}
                  onScrollToSection={handleScrollToSection}
                />
              </div>
            </div>

            <div ref={formBoxRef} id="get-started" className={styles['form-box']}>
              <HeroChat chatbotId={chatbotId} />
            </div>
          </div>
        </div>
      </div>
      <PrivacyTermsLinks variant="dark" className="intro-page__footer-links" />
    </div>
  )
}
