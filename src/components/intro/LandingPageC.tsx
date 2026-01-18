'use client'

import { useChat } from '@ai-sdk/react'
import { useGSAP } from '@gsap/react'
import {
  ArrowRight02Icon,
  ArtificialIntelligence04Icon,
  Copy01Icon,
  DashboardSpeed01Icon,
  File01Icon,
  Idea01Icon,
  Link01Icon,
  MaximizeScreenIcon,
  MinimizeScreenIcon,
  PlusSignIcon,
  Refresh01Icon,
  SecurityCheckIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  Time01Icon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { DefaultChatTransport, type UIMessage } from 'ai'
import gsap from 'gsap'
import { ScrollSmoother } from 'gsap/ScrollSmoother'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AnimatePresence, motion } from 'motion/react'
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

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
import AnimatedPath from '@/components/intro/AnimatedPath'
import Favicon from '@/components/intro/Favicon'
import Logo from '@/components/intro/Logo'
import '@/components/leads-page/LeadsPageView.css'
import {
  type Citation,
  MessageWithCitations,
} from '@/components/leads-page/MessageWithCitations'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import {
  LeadsPageSettingsProvider,
  useLeadsPageSettings,
} from '@/contexts/LeadsPageSettingsContext'

import '@/styles/ai-elements.css'

import styles from './landing-page-c.module.css'

gsap.registerPlugin(useGSAP, ScrollToPlugin, ScrollTrigger, ScrollSmoother)

interface AssessmentToolProps {
  chatbotId?: string
}

// --- Assessment Tool Component with Real AI Chat ---
const AssessmentToolInner = ({ chatbotId }: AssessmentToolProps) => {
  useLeadsPageSettings()
  const [step, setStep] = useState<'intro' | 'chat'>('intro')
  const [isExpanded, setIsExpanded] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)

  // Set up portal container on mount
  useEffect(() => {
    setPortalContainer(document.body)
  }, [])

  const handleToggleExpand = () => {
    setIsExpanded((prev) => !prev)
  }

  const handleCloseExpanded = () => {
    setIsExpanded(false)
  }
  const [formData, setFormData] = useState({ name: '', email: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [liked, setLiked] = useState<Record<string, boolean>>({})
  const [disliked, setDisliked] = useState<Record<string, boolean>>({})
  const [messageCitations, setMessageCitations] = useState<Record<string, Citation[]>>({})
  const [pendingCitations, setPendingCitations] = useState<Citation[] | null>(null)

  const activeChatbotId = chatbotId || 'a0000000-0000-0000-0000-000000000001'
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const { messages, sendMessage, status, regenerate } = useChat<UIMessage>({
    transport: chatTransport,
    onFinish: handleChatFinish,
  })

  const isStreaming = status === 'streaming'
  const isClient = typeof window !== 'undefined'

  const handlePromptSubmit = async (message: PromptInputMessage) => {
    if (!message.text.trim()) return
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

      setStep('chat')
      setIsExpanded(true)
    } catch (error) {
      console.error('Error submitting lead form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const suggestions = [
    "We're drowning in spreadsheets and manual processes",
    'I need to modernize our legacy software',
  ]

  // Chat content shared between inline and expanded modes
  const chatContent = (
    <motion.div
      key="chat"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles['intro-c-chat']}
    >
      <Conversation className={styles['intro-c-chat__conversation']}>
        <ConversationContent>
          {messages.length === 0 && (
            <Message from="assistant">
              <div className="message-avatar">
                <Favicon
                  className="message-avatar__image"
                  style={{
                    width: 'var(--op-space-large)',
                    height: 'var(--op-space-large)',
                  }}
                />
              </div>
              <MessageContent>
                <MessageResponse>
                  {`Hi ${formData.name.split(' ')[0]}! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business.\n\nTo get started: What problem or opportunity is prompting you to consider custom software?`}
                </MessageResponse>
              </MessageContent>
            </Message>
          )}
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
                                  width: 'var(--op-space-large)',
                                  height: 'var(--op-space-large)',
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
                                    color={liked[message.id] ? 'currentColor' : 'none'}
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
                                    color={disliked[message.id] ? 'currentColor' : 'none'}
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
                  default:
                    return null
                }
              })}
            </Fragment>
          ))}
        </ConversationContent>
      </Conversation>

      <div
        className={styles['intro-c-chat__input-wrapper']}
        style={{ paddingBottom: 'var(--op-space-medium)' }}
      >
        <div className="gradient" style={{ top: '80%' }} />
        <PromptInputProvider>
          <PromptInput onSubmit={handlePromptSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                ref={textareaRef}
                placeholder="Describe your challenge..."
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

      {messages.length < 2 && (
        <div className={styles['intro-c-chat__suggestions']}>
          <Suggestions>
            {suggestions.map((suggestion) => (
              <Suggestion
                key={suggestion}
                size="sm"
                onClick={() => handlePromptSubmit({ text: suggestion, files: [] })}
                suggestion={suggestion}
              />
            ))}
          </Suggestions>
        </div>
      )}
    </motion.div>
  )

  // Expanded modal rendered via portal (outside smooth-wrapper stacking context)
  const expandedModal =
    step === 'chat' && isExpanded && portalContainer
      ? createPortal(
        <>
          {/* Backdrop */}
          <div
            className={styles['intro-c-lightbox-backdrop']}
            onClick={handleCloseExpanded}
            aria-hidden="true"
          />
          {/* Modal Card */}
          <Card className={styles['intro-c-lightbox']}>
            <Button
              variant="ghost"
              size="sm"
              className={styles['intro-c-card__expand-btn']}
              onClick={handleCloseExpanded}
              aria-label="Minimize"
            >
              <HugeiconsIcon icon={MinimizeScreenIcon} size={20} />
            </Button>
            <div className={styles['intro-c-card__content']}>{chatContent}</div>
          </Card>
        </>,
        portalContainer
      )
      : null

  return (
    <>
      {/* Inline card (when not expanded or intro step) */}
      <Card className={styles['intro-c-card']}>
        {step === 'chat' && !isExpanded && (
          <Button
            variant="ghost"
            size="sm"
            className={styles['intro-c-card__expand-btn']}
            onClick={handleToggleExpand}
            aria-label="Maximize"
          >
            <HugeiconsIcon icon={MaximizeScreenIcon} size={20} />
          </Button>
        )}
        <div className={styles['intro-c-card__content']}>
          <AnimatePresence mode="wait">
            {/* Intro Step */}
            {step === 'intro' && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className={styles['intro-c-intro']}
              >
                <div className={styles['intro-c-intro__header']}>
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={styles['intro-c-intro__emoji']}
                  >
                    {String.fromCodePoint(0x1f44b)}
                  </motion.span>
                  <h3 className={styles['intro-c-intro__title']}>
                    Let&apos;s see if we fit.
                  </h3>
                  <p className={styles['intro-c-intro__subtitle']}>
                    We&apos;ll ask a few key questions to understand your needs.
                    We&apos;ll email you the results.
                  </p>
                </div>
                <form
                  className={styles['intro-c-intro__form']}
                  onSubmit={(e) => {
                    e.preventDefault()
                    void handleStartChat()
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      autoComplete="name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className="form-control form-control--large"
                      placeholder="Jane Doe"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Work Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="form-control form-control--large"
                      placeholder="jane@company.com"
                      disabled={isSubmitting}
                    />
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    variant="primary"
                    style={{ width: 'fit-content' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Starting...' : 'Start Conversation'}
                    {!isSubmitting && <HugeiconsIcon icon={ArrowRight02Icon} size={20} />}
                  </Button>

                  <p className={styles['intro-c-intro__disclaimer']}>
                    By continuing, you agree to our privacy policy. Your data is secure.
                  </p>
                </form>
              </motion.div>
            )}

            {/* Chat Step - inline (non-expanded) */}
            {step === 'chat' && !isExpanded && chatContent}
          </AnimatePresence>
        </div>
      </Card>

      {/* Portal-rendered expanded modal */}
      {expandedModal}
    </>
  )
}

// Wrap with provider
const AssessmentTool = ({ chatbotId }: AssessmentToolProps) => (
  <LeadsPageSettingsProvider>
    <AssessmentToolInner chatbotId={chatbotId} />
  </LeadsPageSettingsProvider>
)

// Feature items data
const features = [
  {
    icon: Time01Icon,
    title: 'Respects your time',
    text: 'Complete the assessment in under 5 minutes. No lengthy calls required for initial discovery.',
  },
  {
    icon: File01Icon,
    title: 'Instant Structured Summary',
    text: 'Receive a summary of your business goals and potential ROI.',
  },
  {
    icon: SecurityCheckIcon,
    title: 'Low Risk Exploration',
    text: 'Get AI-driven feedback on technical feasibility before committing to a consultation.',
  },
]

const featureCards = [
  {
    icon: Idea01Icon,
    title: 'A Clearer Picture of Your Work',
    text: 'Your answers give us enough context about your workflow, pain points, and constraints that we can skip the generic intake and start by talking about what actually needs to change.',
  },
  {
    icon: DashboardSpeed01Icon,
    title: 'Realistic Next Steps',
    text: "We use what you share to get an honest first read on scope, risk, and timing so we can suggest a starting point that fits your situation—or let you know if custom software isn't the right move yet.",
  },
  {
    icon: Link01Icon,
    title: 'A More Useful First Conversation',
    text: 'Your responses shape the agenda, who from our team joins the call, and which examples we bring, so our time together feels like a working session focused on your business, not a sales script.',
  },
]

export interface LandingPageCProps {
  chatbotId?: string
  isEmbed?: boolean
}

// --- Main Component ---
export function LandingPageC({ chatbotId, isEmbed = false }: LandingPageCProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

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

      // Track scroll progress for AnimatedPath
      ScrollTrigger.create({
        trigger: heroRef.current,
        scroller: smoother.wrapper(),
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      })
    },
    { scope: wrapperRef }
  )

  const handleScrollToTool = contextSafe(() => {
    const smoother = ScrollSmoother.get()
    if (smoother) {
      smoother.scrollTo('#tool', true)
      return
    }
    gsap.to(window, { duration: 0.8, scrollTo: '#tool' })
  })

  return (
    <div className={styles['intro-c-page']} data-page="intro-c">
      <div ref={wrapperRef} className={styles['smooth-wrapper']}>
        <div ref={contentRef} className={styles['smooth-content']}>
          {/* Hero Section */}
          <section ref={heroRef} className={styles['intro-c-hero']}>
            {/* Logo */}
            {!isEmbed && (
              <div className={styles['intro-c-logo']}>
                <Logo
                  variant="dark"
                  style={{ width: 'calc(var(--op-size-unit) * 24)', height: 'auto' }}
                />
              </div>
            )}
            <div className={styles['intro-c-hero__gradient']} />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={styles['intro-c-hero__container']}
            >
              <div className={styles['intro-c-hero__badge']}>
                <HugeiconsIcon
                  icon={ArtificialIntelligence04Icon}
                  size={24}
                  color="var(--color---purple-700)"
                />
                <span>AI-Driven Analysis</span>
              </div>

              <h1 id="heading" className={styles.title}>
                <span className={styles.title}>Is{` `}</span>
                <span className={styles['title-highlight']}>custom software</span>
                <div>
                  <span className={styles.title}>right for{` `}</span>
                  <span className={`${styles.title} ${styles.circle}`}>
                    your
                    <AnimatedPath
                      className={styles['highlight-circle']}
                      stroke="var(--brand-Bright-Yellow)"
                      strokeWidth={4}
                      unit="%"
                      wunit="%"
                      height={110}
                      width={110}
                      speed={2}
                      delay={2}
                      trigger="in-view"
                      preserveAspectRatio="none"
                      d="M1 52.6501C115.88 -2.08648 483.388 1.16489 499.75 52.6501C510.213 85.5762 454.384 99.1037 355.471 112.631C256.559 126.159 48.5456 125.915 17.3586 92.0694C-20.5347 50.9459 89.9842 -1.65508 260.277 3.32941C519.086 10.9048 527.267 80.7065 459.59 112.631"
                    />
                  </span>{' '}
                  <span className={styles.title}>business?</span>
                </div>
              </h1>
              <p className={styles['intro-c-hero__subtitle']}>
                Determine your fit, explore ROI, and receive a structured consultation
                summary in 3-5 minutes with our intelligent assessment tool.
              </p>

              <div className={styles['intro-c-hero__actions']}>
                <Button variant="brightblue" size="lg" onClick={handleScrollToTool}>
                  Start Assessment
                  <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
                </Button>
              </div>
            </motion.div>
          </section>

          {/* Tool Section */}
          <section id="tool" className={styles['intro-c-tool']}>
            <div className={styles['intro-c-tool__container']}>
              <div className={styles['intro-c-tool__grid']}>
                {/* Left Side Context */}
                <div className={styles['intro-c-tool__content']}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <h2 className={styles['intro-c-tool__title']}>
                      Intelligent analysis
                      <br />
                      tailored to your context.
                    </h2>
                    <p className={styles['intro-c-tool__description']}>
                      Our AI tool moves beyond static forms. It evaluates your project
                      parameters, requirements, and timeline while providing real-time
                      insights into how RoleModel&apos;s custom solutions can scale your
                      operations.
                    </p>

                    <ul className={styles['intro-c-tool__features']}>
                      {features.map((item, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.1 }}
                          className={styles['intro-c-tool__feature']}
                        >
                          <div className={styles['intro-c-tool__feature-icon']}>
                            <HugeiconsIcon icon={item.icon} size={28} />
                          </div>
                          <div>
                            <h3 className={styles['intro-c-tool__feature-title']}>
                              {item.title}
                            </h3>
                            <p className={styles['intro-c-tool__feature-text']}>
                              {item.text}
                            </p>
                          </div>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </div>

                {/* Right Side App */}
                <div className={styles['intro-c-tool__app']}>
                  <AssessmentTool chatbotId={chatbotId} />
                </div>
              </div>
            </div>
          </section>

          {/* Features Grid */}
          <section className={styles['intro-c-features']}>
            <div className={styles['intro-c-features__container']}>
              <div className={styles['intro-c-features__header']}>
                <h2 className={styles['intro-c-features__title']}>
                  Why use the AI Assessment Tool?
                </h2>
                <p className={styles['intro-c-features__subtitle']}>
                  We balance innovation with structured discovery to respect your time and
                  provide immediate value.
                </p>
              </div>

              <div className={styles['intro-c-features__grid']}>
                {featureCards.map((feature, i) => {
                  const brandColors = [
                    'var(--brand-Bright-Blue)',
                    'var(--brand-Light-Purple)',
                    'var(--brand-Medium-Green)',
                  ]
                  const color = brandColors[i % brandColors.length]
                  return (
                    <Card
                      variant="dark"
                      borderBottom={color}
                      key={i}
                      className="card card--padded"
                    >
                      <div className={styles['intro-c-features__card-icon']}>
                        <HugeiconsIcon
                          icon={feature.icon}
                          strokeWidth={1}
                          size={40}
                          color={color}
                        />
                      </div>
                      <h3 className={styles['intro-c-features__card-title']}>
                        {feature.title}
                      </h3>
                      <p className={styles['intro-c-features__card-text']}>
                        {feature.text}
                      </p>
                    </Card>
                  )
                })}
              </div>
            </div>
          </section>
          {/* Privacy Footer */}
          <PrivacyTermsLinks variant="dark" className={styles['intro-c-footer-links']} />
        </div>
      </div>
    </div>
  )
}

export default LandingPageC
