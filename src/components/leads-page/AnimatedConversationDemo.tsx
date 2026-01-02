'use client'

import { Calendar03Icon, Mail01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { AlertCircleIcon, CheckIcon, SearchIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from '@/components/ai-elements/chain-of-thought'
import { Conversation, ConversationContent } from '@/components/ai-elements/conversation'
import {
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardBody,
  InlineCitationCardTrigger,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselItem,
  InlineCitationCarouselNext,
  InlineCitationCarouselPrev,
  InlineCitationSource,
} from '@/components/ai-elements/inline-citation'
import {
  Message,
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
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import Favicon from '@/components/intro/Favicon'
import { Button } from '@/components/ui/button'

import { useLeadsPageSettings } from '@/contexts/LeadsPageSettingsContext'

interface ChainOfThoughtData {
  steps: {
    label: string
    description?: string
    status: 'complete' | 'active' | 'pending'
    icon?: 'search' | 'check' | 'alert'
  }[]
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  delay?: number
  citations?: Array<{
    url: string
    title: string
    description?: string
  }>
  chainOfThought?: ChainOfThoughtData
}

const demoConversation: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm here to help you thoughtfully assess whether custom software might be a worthwhile investment for your business. To get started: What problem or opportunity is prompting you to consider custom software?",
    delay: 1000,
  },
  {
    id: '2',
    role: 'user',
    content: "I'm Sarah, CEO at TechFlow Solutions.",
    delay: 2000,
  },
  {
    id: '3',
    role: 'assistant',
    content:
      "Nice to meet you, Sarah! What's the biggest operational challenge you're facing right now?",
    delay: 2500,
  },
  {
    id: '4',
    role: 'user',
    content:
      "We're managing customer data across multiple spreadsheets and it's becoming unmanageable as we scale.",
    delay: 3000,
  },
  {
    id: '5',
    role: 'assistant',
    content:
      "That's a common pain point - manual data management can really slow growth. What's your ideal timeline for having a solution in place?",
    delay: 2500,
    chainOfThought: {
      steps: [
        {
          label: 'Analyzing pain point',
          description: 'Manual data management causing scalability issues',
          status: 'complete',
          icon: 'search',
        },
        {
          label: 'Assessing urgency',
          description: 'Need to understand implementation timeline',
          status: 'complete',
          icon: 'check',
        },
        {
          label: 'Qualifying timeline',
          description: 'Determining project scheduling requirements',
          status: 'active',
          icon: 'alert',
        },
      ],
    },
  },
  {
    id: '6',
    role: 'user',
    content: "We'd like to have something in place within the next 6 months.",
    delay: 2200,
  },
  {
    id: '7',
    role: 'assistant',
    content: 'Got it. And what budget range have you allocated for solving this?',
    delay: 2000,
  },
  {
    id: '8',
    role: 'user',
    content: 'We have around $50k-$75k allocated for this.',
    delay: 2500,
  },
  {
    id: '9',
    role: 'assistant',
    content:
      "That's a great starting point for a custom solution [1]. Who else would be involved in evaluating and deciding on a solution?",
    delay: 2500,
    citations: [
      {
        url: 'https://rolemodelsoftware.com/focuses/iterative-value',
        title: 'Iterative Value',
        description:
          'Our approach delivers incremental progress upon a sustainable foundation that provides you with an early return on your investment while staying aligned to your business goals with tight feedback loops.',
      },
    ],
  },
  {
    id: '10',
    role: 'user',
    content: "I'll be working with our CTO on the final decision.",
    delay: 2500,
  },
  {
    id: '11',
    role: 'assistant',
    content:
      "Perfect. I'd love to send you a personalized summary of what we discussed. What's the best email to reach you?",
    delay: 2500,
  },
  {
    id: '12',
    role: 'user',
    content: 'sarah@techflow.com',
    delay: 2200,
  },
  {
    id: '13',
    role: 'assistant',
    content:
      "Thanks Sarah! Here's a summary of our conversation and recommended next steps.",
    delay: 2500,
  },
]

const TypingIndicator = () => (
  <div
    style={{
      display: 'flex',
      gap: '4px',
      padding: '12px',
    }}
  >
    {[0, 1, 2].map((i) => (
      <motion.div
        key={i}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--op-color-neutral-minus-six)',
          color: 'black',
        }}
        animate={{
          y: [0, -8, 0],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          delay: i * 0.15,
          ease: 'easeInOut',
        }}
      />
    ))}
  </div>
)

interface AnimatedConversationDemoProps {
  onInterrupt?: () => void
  editMode?: boolean
}

export function AnimatedConversationDemo({ onInterrupt }: AnimatedConversationDemoProps) {
  const { settings } = useLeadsPageSettings()
  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [typingText, setTypingText] = useState('')
  const [isTypingInInput, setIsTypingInInput] = useState(false)
  const [showPlan, setShowPlan] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping, showPlan])

  // Auto-start demo
  useEffect(() => {
    if (!isRunning) return

    if (currentIndex >= demoConversation.length) {
      // Conversation complete, show plan after delay
      const planTimer = setTimeout(() => {
        setShowPlan(true)
      }, 1500)

      return () => clearTimeout(planTimer)
    }

    const currentMessage = demoConversation[currentIndex]
    const timer = setTimeout(() => {
      if (currentMessage.role === 'assistant') {
        setIsTyping(true)
        // Show typing indicator, then message
        setTimeout(() => {
          setIsTyping(false)
          setMessages((prev) => [...prev, currentMessage])
          setCurrentIndex((prev) => prev + 1)
        }, 1500)
      } else {
        // User messages: type in input field first
        setIsTypingInInput(true)
        const text = currentMessage.content
        let charIndex = 0

        const typeInterval = setInterval(() => {
          if (charIndex < text.length) {
            setTypingText(text.slice(0, charIndex + 1))
            charIndex++
          } else {
            clearInterval(typeInterval)
            // After typing completes, show as message
            setTimeout(() => {
              setIsTypingInInput(false)
              setTypingText('')
              setMessages((prev) => [...prev, currentMessage])
              setCurrentIndex((prev) => prev + 1)
            }, 500)
          }
        }, 30) // Type at ~30ms per character

        return () => clearInterval(typeInterval)
      }
    }, currentMessage.delay || 1000)

    return () => clearTimeout(timer)
  }, [currentIndex, isRunning])

  const handleInterrupt = () => {
    setIsRunning(false)
    onInterrupt?.()
  }

  const renderChainOfThought = (chainOfThought: ChainOfThoughtData) => {
    const getIcon = (icon?: string) => {
      switch (icon) {
        case 'search':
          return SearchIcon
        case 'check':
          return CheckIcon
        case 'alert':
          return AlertCircleIcon
        default:
          return CheckIcon
      }
    }

    return (
      <ChainOfThought defaultOpen={false}>
        <ChainOfThoughtHeader>Thinking...</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          {chainOfThought.steps.map((step, index) => (
            <ChainOfThoughtStep
              key={index}
              label={step.label}
              description={step.description}
              status={step.status}
              icon={getIcon(step.icon)}
            />
          ))}
        </ChainOfThoughtContent>
      </ChainOfThought>
    )
  }

  const renderMessageWithCitations = (message: Message) => {
    if (!message.citations || message.citations.length === 0) {
      return message.content
    }

    // Split text by citation markers like [1], [2], etc.
    const parts = message.content.split(/(\[\d+\])/g)

    return parts.map((segment, i) => {
      const citationMatch = segment.match(/\[(\d+)\]/)
      if (citationMatch) {
        const citationIndex = parseInt(citationMatch[1]) - 1
        const citation = message.citations?.[citationIndex]

        if (citation) {
          return (
            <InlineCitation key={i}>
              <InlineCitationCard>
                <InlineCitationCardTrigger sources={[citation.url]} />
                <InlineCitationCardBody>
                  <InlineCitationCarousel>
                    <InlineCitationCarouselHeader>
                      <InlineCitationCarouselPrev />
                      <InlineCitationCarouselIndex />
                      <InlineCitationCarouselNext />
                    </InlineCitationCarouselHeader>
                    <InlineCitationCarouselContent>
                      <InlineCitationCarouselItem>
                        <InlineCitationSource
                          title={citation.title}
                          url={citation.url}
                          description={citation.description}
                        />
                      </InlineCitationCarouselItem>
                    </InlineCitationCarouselContent>
                  </InlineCitationCarousel>
                </InlineCitationCardBody>
              </InlineCitationCard>
            </InlineCitation>
          )
        }
      }
      return <span key={i}>{segment}</span>
    })
  }

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((currentIndex / demoConversation.length) * 100)
  )

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 700,
        margin: '0 auto',
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        padding: 'var(--op-space-x-large) var(--op-space-small)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 'var(--op-space-small)',
        height: '100%',
      }}
    >
      {/* Landing Header */}
      <motion.div
        initial={{ opacity: 0, filter: 'blur(4px)' }}
        animate={{ opacity: 1, filter: 'blur(0px)' }}
        transition={{ duration: 0.4 }}
        style={{
          textAlign: 'center',
          flex: '0 0 auto',
          marginBottom: 'var(--op-space-medium)',
        }}
      >
        <span
          className="aligned-header"
          style={{
            fontSize: 'var(--op-font-5x-large)',
            fontWeight: 700,
            marginBottom: 'var(--op-space-x-small)',
            lineHeight: 1,
            letterSpacing: '-0.05em',
          }}
        >
          {settings.pageTitle}
        </span>
        <p
          style={{
            fontSize: 'var(--op-font-medium)',
            color: 'var(--op-color-on-background-alt)',
            margin: 0,
            marginBottom: 'var(--op-space-small)',
          }}
        >
          {settings.introText || settings.pageDescription}
        </p>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--op-space-x-small)',
            fontSize: 'var(--op-font-small)',
            color: 'var(--op-color-neutral-on-plus-max)',
            backgroundColor: 'var(--op-color-neutral-plus-six)',
            padding: 'var(--op-space-2x-small) var(--op-space-small)',
            borderRadius: 'var(--op-radius-pill)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
          {settings.timeEstimate || '3-5 minutes'}
        </span>
      </motion.div>

      {/* Messages Container */}
      <div
        // Scrollable messages column – fills remaining space between progress bar and input
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--op-space-small)',
          flex: '1',
          minHeight: 0,
          maxHeight: 500,
          overflowY: 'auto',
          width: '98%',
        }}
      >
        <Conversation>
          <ConversationContent
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--op-space-small)',
            }}
          >
            <AnimatePresence initial={false} mode="sync">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Message from={message.role}>
                    {message.role === 'assistant' && (
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 'var(--op-radius-circle)',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                          flexShrink: 0,
                          fontSize: 'var(--op-font-small)',
                          fontWeight: 600,
                        }}
                      >
                        <Favicon
                          style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: 'var(--op-radius-circle)',
                          }}
                        />
                      </div>
                    )}
                    <MessageContent>
                      {message.chainOfThought && message.role === 'assistant' ? (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 'var(--op-space-small)',
                          }}
                        >
                          {renderChainOfThought(message.chainOfThought)}
                          {message.citations && message.citations.length > 0 ? (
                            <div style={{ width: '100%', fontSize: 'inherit' }}>
                              {renderMessageWithCitations(message)}
                            </div>
                          ) : (
                            <MessageResponse>{message.content}</MessageResponse>
                          )}
                        </div>
                      ) : message.citations && message.citations.length > 0 ? (
                        <div style={{ width: '100%', fontSize: 'inherit' }}>
                          {renderMessageWithCitations(message)}
                        </div>
                      ) : (
                        <MessageResponse>{message.content}</MessageResponse>
                      )}
                    </MessageContent>
                  </Message>
                </motion.div>
              ))}
            </AnimatePresence>
          </ConversationContent>
        </Conversation>

        {isTyping && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
              filter: 'blur(4px)',
            }}
            animate={{
              opacity: 1,
              y: 0,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              filter: 'blur(4px)',
            }}
            transition={{
              duration: 0.3,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
            }}
          >
            <motion.div
              animate={{
                boxShadow: [
                  '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
                  '0 4px 12px -2px rgba(0, 0, 0, 0.12)',
                  '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
                ],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--op-radius-medium)',
                backgroundColor: 'var(--op-color-neutral-plus-eight)',
              }}
            >
              <TypingIndicator />
            </motion.div>
          </motion.div>
        )}

        {/* Qualification Summary */}
        {showPlan && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              border: '1px solid var(--op-color-border)',
              borderRadius: 'var(--op-radius-large)',
              padding: 'var(--op-space-x-large)',
              backgroundColor: 'var(--op-color-background)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--op-font-large)',
                fontWeight: 600,
                textAlign: 'left',
                marginBottom: 'var(--op-space-x-small)',
              }}
            >
              Qualification Summary
            </h3>
            <p
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                textAlign: 'left',
                lineHeight: 1.6,
                marginBottom: 'var(--op-space-medium)',
              }}
            >
              Based on our conversation, here&apos;s what I&apos;ve learned about your
              needs.
            </p>

            {/* Summary Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 'var(--op-space-medium)',
                marginBottom: 'var(--op-space-large)',
              }}
            >
              <div
                style={{
                  padding: 'var(--op-space-medium)',
                  backgroundColor: 'var(--op-color-neutral-plus-seven)',
                  borderRadius: 'var(--op-radius-medium)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}
                >
                  Contact
                </span>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    fontWeight: 500,
                    margin: '4px 0 0 0',
                  }}
                >
                  Sarah, CEO
                </p>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    margin: 0,
                  }}
                >
                  sarah@techflow.com
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--op-space-medium)',
                  backgroundColor: 'var(--op-color-neutral-plus-seven)',
                  borderRadius: 'var(--op-radius-medium)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}
                >
                  Budget
                </span>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    fontWeight: 500,
                    margin: '4px 0 0 0',
                  }}
                >
                  $50k - $75k
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--op-space-medium)',
                  backgroundColor: 'var(--op-color-neutral-plus-seven)',
                  borderRadius: 'var(--op-radius-medium)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}
                >
                  Timeline
                </span>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    fontWeight: 500,
                    margin: '4px 0 0 0',
                  }}
                >
                  6 months
                </p>
              </div>

              <div
                style={{
                  padding: 'var(--op-space-medium)',
                  backgroundColor: 'var(--op-color-neutral-plus-seven)',
                  borderRadius: 'var(--op-radius-medium)',
                }}
              >
                <span
                  style={{
                    fontSize: 'var(--op-font-x-small)',
                    color: 'var(--op-color-neutral-on-plus-max)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 500,
                  }}
                >
                  Decision Makers
                </span>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    fontWeight: 500,
                    margin: '4px 0 0 0',
                  }}
                >
                  CEO + CTO
                </p>
              </div>
            </div>

            {/* Challenge & Need */}
            <div style={{ marginBottom: 'var(--op-space-large)' }}>
              <h4
                style={{
                  fontSize: 'var(--op-font-medium)',
                  fontWeight: 600,
                  textAlign: 'left',
                  marginBottom: 'var(--op-space-x-small)',
                }}
              >
                Challenge
              </h4>
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-on-background)',
                  margin: 0,
                  textAlign: 'left',
                  lineHeight: 1.6,
                }}
              >
                Managing customer data across multiple spreadsheets is becoming
                unmanageable as the company scales.
              </p>
            </div>

            {/* Recommendation */}
            <div
              style={{
                padding: 'var(--op-space-medium)',
                backgroundColor: 'var(--op-color-primary-plus-seven)',
                borderRadius: 'var(--op-radius-medium)',
                borderLeft: '3px solid var(--op-color-primary-base)',
                marginBottom: 'var(--op-space-large)',
              }}
            >
              <h4
                style={{
                  fontSize: 'var(--op-font-medium)',
                  fontWeight: 600,
                  textAlign: 'left',
                  marginBottom: 'var(--op-space-x-small)',
                  color: 'var(--op-color-primary-on-plus-max)',
                }}
              >
                Recommendation
              </h4>
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  margin: 0,
                  textAlign: 'left',
                  lineHeight: 1.6,
                }}
              >
                A custom data management solution would help TechFlow consolidate customer
                data, automate manual processes, and scale efficiently. We recommend a
                30-minute discovery call to explore the specifics.
              </p>
            </div>

            {/* CTA Section */}
            <div
              style={{
                paddingTop: 'var(--op-space-large)',
                borderTop: '1px solid var(--op-color-border)',
              }}
            >
              <p
                style={{
                  fontSize: 'var(--op-font-small)',
                  color: 'var(--op-color-neutral-on-plus-max)',
                  textAlign: 'center',
                  marginBottom: 'var(--op-space-medium)',
                }}
              >
                Ready to take the next step?
              </p>
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--op-space-small)',
                }}
              >
                <Button variant="primary" style={{ flex: 1, cursor: 'default' }}>
                  <HugeiconsIcon icon={Calendar03Icon} size={18} />
                  <span>Schedule a Call</span>
                </Button>
                <Button variant="secondary" style={{ flex: 1, cursor: 'default' }}>
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                  <span>Email Summary</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
      {/* Progress Indicator */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--op-space-small)',
          padding: 'var(--op-space-x-small) var(--op-space-medium)',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            flex: 1,
            height: 'var(--op-space-x-small)',
            backgroundColor: 'var(--op-color-neutral-plus-six)',
            borderRadius: 'var(--op-radius-pill)',
            overflow: 'hidden',
          }}
        >
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              height: '100%',
              backgroundColor: 'var(--op-color-primary-base)',
              borderRadius: 'var(--op-radius-pill)',
            }}
          />
        </div>
        <motion.span
          key={progressPercentage}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            fontSize: 'var(--op-font-x-small)',
            fontFamily: 'var(--font-geist-mono)',
            fontWeight: 600,
            color: 'var(--op-color-neutral-on-plus-max)',
            minWidth: '38px',
            textAlign: 'right',
          }}
        >
          {progressPercentage}%
        </motion.span>
      </motion.div>
      {/* Real PromptInput Component with Typing Animation */}
      <div
        onClick={handleInterrupt}
        style={{
          width: '100%',
          position: 'relative',
          cursor: isRunning ? 'pointer' : 'default',
        }}
      >
        <div className="gradient" />
        <PromptInputProvider>
          <PromptInput
            onSubmit={() => { }} // No-op during demo
            style={{ width: '100%', zIndex: 1 }}
          >
            <PromptInputAttachments>
              {(attachment) => (
                <PromptInputAttachment key={attachment.id} data={attachment} />
              )}
            </PromptInputAttachments>
            <PromptInputBody style={{ height: '80px' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                {isTypingInInput && typingText ? (
                  <div
                    style={{
                      width: '100%',
                      padding: 'var(--op-space-medium)',
                      fontSize: 'var(--op-font-small)',
                      color: 'var(--op-color-on-background)',
                      minHeight: '56px',
                      display: 'block',
                      textAlign: 'left',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      boxSizing: 'border-box',
                    }}
                  >
                    {typingText}
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ marginLeft: '2px' }}
                    >
                      |
                    </motion.span>
                  </div>
                ) : (
                  <PromptInputTextarea
                    placeholder="Tell me about your project..."
                    disabled={true}
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </div>
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools>
                <PromptInputActionMenu>
                  <PromptInputActionMenuTrigger />
                  <PromptInputActionMenuContent>
                    <PromptInputActionAddAttachments />
                  </PromptInputActionMenuContent>
                </PromptInputActionMenu>
                <PromptInputSpeechButton textareaRef={textareaRef} />
              </PromptInputTools>
              <PromptInputSubmit disabled={true} />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>
    </div>
  )
}
