'use client'

import { useState, useRef, useCallback, useMemo, Fragment } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import gsap from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

gsap.registerPlugin(ScrollToPlugin)
import {
  ArrowRight02Icon,
  Tick01Icon,
  ArtificialIntelligence04Icon,
  Time01Icon,
  File01Icon,
  SecurityCheckIcon,
  Idea01Icon,
  DashboardSpeed01Icon,
  Link01Icon,
  ThumbsUpIcon,
  ThumbsDownIcon,
  Copy01Icon,
  Refresh01Icon,
  PlusSignIcon,
} from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import './page.css'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useLeadsPageSettings,
  LeadsPageSettingsProvider,
} from '@/contexts/LeadsPageSettingsContext'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport, isTextUIPart, type UIMessage } from 'ai'
import { Message, MessageContent, MessageResponse, MessageActions, MessageAction } from '@/components/ai-elements/message'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion'
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputProvider,
  PromptInputBody,
  PromptInputFooter,
  PromptInputMessage,
  PromptInputTools,
  PromptInputSpeechButton,
  PromptInputActionMenuContent,
  PromptInputActionMenu,
  PromptInputActionMenuTrigger,
  PromptInputActionAddAttachments,
} from '@/components/ai-elements/prompt-input'
import { MessageWithCitations, type Citation } from '@/components/leads-page/MessageWithCitations'
import Favicon from '@/components/intro/Favicon'
import Logo from '@/components/intro/Logo'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import '@/styles/ai-elements.css'

interface AssessmentToolProps {
  chatbotId?: string
}

// --- Assessment Tool Component with Real AI Chat ---
const AssessmentToolInner = ({ chatbotId }: AssessmentToolProps) => {
  useLeadsPageSettings()
  const [step, setStep] = useState<'intro' | 'chat'>('intro')
  const [formData, setFormData] = useState({ name: '', email: '' })
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
      const parsed = JSON.parse(header) as Array<{ title: string; url?: string | null; snippet?: string }>
      const formatted: Citation[] = parsed
        .map((item) => ({ title: item.title, url: item.url ?? undefined, description: item.snippet }))
        .filter((item) => item.title || item.description || item.url)
      setPendingCitations(formatted.length > 0 ? formatted : null)
    } catch {
      setPendingCitations(null)
    }
  }, [])

  const handleChatFinish = useCallback(({ message }: { message: UIMessage }) => {
    if (message.role !== 'assistant') {
      setPendingCitations(null)
      return
    }
    if (pendingCitations && pendingCitations.length > 0) {
      setMessageCitations((prev) => ({ ...prev, [message.id]: pendingCitations }))
    }
    setPendingCitations(null)
  }, [pendingCitations])

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
    () => new DefaultChatTransport({
      api: '/api/chat',
      body: { chatbotId: activeChatbotId },
      fetch: interceptingFetch,
    }),
    [activeChatbotId, interceptingFetch]
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

  const handleStartChat = () => {
    if (!formData.name || !formData.email) return
    setStep('chat')
  }

  const suggestions = [
    "We're drowning in spreadsheets and manual processes",
    "I need to modernize our legacy software",
  ]

  return (
    <Card className="intro-c-card">
      <div className="intro-c-card__content">
        <AnimatePresence mode="wait">

          {/* Intro Step */}
          {step === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="intro-c-intro"
            >
              <div className="intro-c-intro__header">
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="intro-c-intro__emoji"
                >
                  {String.fromCodePoint(0x1F44B)}
                </motion.span>
                <h3 className="intro-c-intro__title">
                  Let&apos;s see if we fit.
                </h3>
                <p className="intro-c-intro__subtitle">
                  We&apos;ll ask a few key questions to understand your needs. We&apos;ll email you the results.
                </p>
              </div>
              <div className="intro-c-intro__form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="form-control form-control--large"
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="form-control form-control--large"
                    placeholder="jane@company.com"
                  />
                </div>

                <Button onClick={handleStartChat}
                  size="lg"
                  variant="primary">
                  Start Conversation
                  <HugeiconsIcon icon={ArrowRight02Icon} size={20} />
                </Button>

                <p className="intro-c-intro__disclaimer">
                  By continuing, you agree to our privacy policy. Your data is secure.
                </p>
              </div>
            </motion.div>
          )}

          {/* Chat Step - Real AI Chat */}
          {step === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="intro-c-chat"
            >
              <Conversation className="intro-c-chat__conversation">
                <ConversationContent>
                  {messages.length === 0 && (
                    <Message from="assistant">
                      <div className="message-avatar">
                        <Favicon className="message-avatar__image" style={{ width: 'var(--op-space-large)', height: 'var(--op-space-large)' }} />
                      </div>
                      <MessageContent>
                        <MessageResponse>
                          {`Hi ${formData.name.split(' ')[0]}! To start, could you describe the primary business problem you want to solve with custom software?`}
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
                                      <Favicon className="message-avatar__image" style={{ width: 'var(--op-space-large)', height: 'var(--op-space-large)' }} />
                                    </div>
                                  )}
                                  <MessageContent>
                                    {isClient ? (
                                      messageCitations[message.id]?.length ? (
                                        <MessageWithCitations message={message} citations={messageCitations[message.id]} />
                                      ) : (
                                        <MessageResponse>{part.text}</MessageResponse>
                                      )
                                    ) : (
                                      <div>{part.text}</div>
                                    )}
                                    {message.role === 'assistant' && (
                                      <MessageActions>
                                        <MessageAction label="Like" onClick={() => setLiked((prev) => ({ ...prev, [message.id]: !prev[message.id] }))} tooltip="Like this response">
                                          <HugeiconsIcon icon={ThumbsUpIcon} size={16} color={liked[message.id] ? "currentColor" : "none"} />
                                        </MessageAction>
                                        <MessageAction label="Dislike" onClick={() => setDisliked((prev) => ({ ...prev, [message.id]: !prev[message.id] }))} tooltip="Dislike this response">
                                          <HugeiconsIcon icon={ThumbsDownIcon} size={16} color={disliked[message.id] ? "currentColor" : "none"} />
                                        </MessageAction>
                                        <MessageAction onClick={() => regenerate()} label="Retry">
                                          <HugeiconsIcon icon={Refresh01Icon} size={16} />
                                        </MessageAction>
                                        <MessageAction onClick={() => navigator.clipboard.writeText(part.text)} label="Copy">
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

              <div className="prompt-input-wrapper">
                <div className="gradient" style={{ top: '80%' }}></div>
                <PromptInputProvider>
                  <PromptInput onSubmit={handlePromptSubmit}>
                    <PromptInputBody>
                      <PromptInputTextarea ref={textareaRef} placeholder="Describe your challenge..." />
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
                <div className="intro-c-chat__suggestions">
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
          )}

        </AnimatePresence>
      </div>
    </Card>
  )
}

// Wrap with provider
const AssessmentTool = (props: AssessmentToolProps) => (
  <LeadsPageSettingsProvider>
    <AssessmentToolInner {...props} />
  </LeadsPageSettingsProvider>
)

// Feature items data
const features = [
  { icon: Time01Icon, title: "Respects your time", text: "Complete the assessment in under 5 minutes. No lengthy calls required for initial discovery." },
  { icon: File01Icon, title: "Instant Structured Summary", text: "Receive a summary of your business goals and potential ROI  via email." },
  { icon: SecurityCheckIcon, title: "Low Risk Exploration", text: "Get AI-driven feedback on technical feasibility before committing to a consultation." }
]

const featureCards = [
  { icon: Idea01Icon, title: "Contextual Insights", text: "The tool doesn't just ask questions; it analyzes your business goals against our database of successful projects to offer relevant content." },
  { icon: DashboardSpeed01Icon, title: "Project Feasibility", text: "We analyze based on budget alignment, project scope, and timeline needs to ensure a consultation call is the right next step for you." },
  { icon: Link01Icon, title: "CRM Integration", text: "Seamlessly connects with our systems. Your responses prepare our sales team to offer a highly personalized consultation." }
]

// --- Main App Component ---
export default function IntroPageC() {
  const handleScrollToTool = () => {
    gsap.to(window, { duration: 0.3, scrollTo: { y: '#tool', offsetY: 40 }, ease: 'ease-in-out' })
  }

  return (
    <div className="intro-c-page">

      {/* Logo */}
      <div className="intro-c-logo">
        <Logo variant="dark" style={{ width: 'calc(var(--op-size-unit) * 24)', height: 'auto' }} />
      </div>

      {/* Hero Section */}
      <section className="intro-c-hero">
        <div className="intro-c-hero__gradient" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="intro-c-hero__container"
        >
          <div className="intro-c-hero__badge">
            <HugeiconsIcon icon={ArtificialIntelligence04Icon} size={24} color="var(--color---purple-700)" />
            <span>AI-Driven Analysis</span>
          </div>

          <h1 className="intro-c-hero__title">
            Is <span className="title-highlight">custom software</span><br />right for your business?
          </h1>

          <p className="intro-c-hero__subtitle">
            Determine your fit, explore ROI, and receive a structured consultation summary in 3-5 minutes with our intelligent assessment tool.
          </p>

          <div className="intro-c-hero__actions">
            <Button
              variant="brightblue"
              size="lg"
              onClick={handleScrollToTool}>
              Start Assessment
              <HugeiconsIcon icon={ArrowRight02Icon} size={16} />
            </Button>
            <Button variant="secondary" size="lg" href="#">
              View Methodology
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Tool Section */}
      <section id="tool" className="intro-c-tool">
        <div className="intro-c-tool__container">
          <div className="intro-c-tool__grid">

            {/* Left Side Context */}
            <div className="intro-c-tool__content">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="intro-c-tool__title">
                  Intelligent analysis tailored to your context.
                </h2>
                <p className="intro-c-tool__description">
                  Our AI tool moves beyond static forms. It evaluates your project parameters, requirements, and timeline while providing real-time insights into how RoleModel&apos;s custom solutions can scale your operations.
                </p>

                <ul className="intro-c-tool__features">
                  {features.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="intro-c-tool__feature"
                    >
                      <div className="intro-c-tool__feature-icon">
                        <HugeiconsIcon icon={item.icon} size={28} />
                      </div>
                      <div>
                        <h3 className="intro-c-tool__feature-title">{item.title}</h3>
                        <p className="intro-c-tool__feature-text">{item.text}</p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Right Side App */}
            <div className="intro-c-tool__app">
              <AssessmentTool />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="intro-c-features">
        <div className="intro-c-features__container">
          <div className="intro-c-features__header">
            <h2 className="intro-c-features__title">Why use the AI Assessment Tool?</h2>
            <p className="intro-c-features__subtitle">
              We balance innovation with structured discovery to respect your time and provide immediate value.
            </p>
          </div>

          <div className="intro-c-features__grid">
            {featureCards.map((feature, i) => {
              const brandColors = ['var(--brand-Bright-Blue)', 'var(--brand-Light-Purple)', 'var(--brand-Medium-Green)']
              const color = brandColors[i % brandColors.length]
              return (
                <Card variant="dark" borderBottom={color} key={i} className="card card--padded">
                  <div className="intro-c-features__card-icon">
                    <HugeiconsIcon icon={feature.icon} strokeWidth={1} size={40} color={color} />
                  </div>
                  <h3 className="intro-c-features__card-title">{feature.title}</h3>
                  <p className="intro-c-features__card-text">{feature.text}</p>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Privacy Footer */}
      <PrivacyTermsLinks variant="dark" className="intro-c-footer-links" />
    </div>
  )
}
