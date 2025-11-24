'use client'

import { Calendar03Icon, Globe02Icon, Mail01Icon } from '@hugeicons-pro/core-stroke-standard'
import { HugeiconsIcon } from '@hugeicons/react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

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
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputProvider,
  PromptInputSpeechButton,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input'
import { Button } from '@/components/ui/button'

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
}

const demoConversation: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content:
      "Hi! I'm here to help you explore whether custom software could be a good fit for your business. By the way, what's your name?",
    delay: 1000,
  },
  {
    id: '2',
    role: 'user',
    content: "I'm Sarah.",
    delay: 2000,
  },
  {
    id: '3',
    role: 'assistant',
    content:
      'Nice to meet you, Sarah! Tell me - what business challenge are you trying to solve?',
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
      "I understand - manual data management can definitely slow things down. What's your timeline for implementing a solution?",
    delay: 2500,
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
    content:
      "That's helpful. And what budget range are you working with for this project?",
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
      "Great, that budget range works well for a custom solution [1]. Last question - who's involved in making the final decision at your company?",
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
    content: "I'm the CEO, and I'll be working with our CTO on the final decision.",
    delay: 2500,
  },
  {
    id: '11',
    role: 'assistant',
    content:
      "Perfect, Sarah. I'd love to send you a summary of what we discussed. What's the best email to reach you at?",
    delay: 2500,
  },
  {
    id: '12',
    role: 'user',
    content: 'sarah@company.com',
    delay: 2200,
  },
  {
    id: '13',
    role: 'assistant',
    content: 'Thank you! Based on our conversation, here are the recommended next steps.',
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
}

export function AnimatedConversationDemo({ onInterrupt }: AnimatedConversationDemoProps) {
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

  const showButton = !isRunning || currentIndex >= demoConversation.length

  // Calculate progress percentage
  const progressPercentage = Math.min(
    100,
    Math.round((currentIndex / demoConversation.length) * 100)
  )

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 600,
        height: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--op-space-medium)',
      }}
    >
      {/* Progress Indicator */}
      {isRunning && currentIndex < demoConversation.length && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--op-space-small)',
            padding: 'var(--op-space-small) var(--op-space-medium)',
          }}
        >
          <div
            style={{
              flex: 1,
              height: '4px',
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
              fontWeight: 600,
              color: 'var(--op-color-neutral-on-plus-max)',
              minWidth: '38px',
              textAlign: 'right',
            }}
          >
            {progressPercentage}%
          </motion.span>
        </motion.div>
      )}

      {/* Messages Container */}
      <div
        ref={containerRef}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--op-space-small)',
          height: '40vh',
          flexGrow: 1,
          flexShrink: 0,
          overflowY: 'auto',
          paddingInline: 'var(--op-space-small)',
        }}
      >
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id + '-' + index}
              layout
              initial={{ opacity: 0, y: 20, filter: 'blur(12px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              <motion.div
                layout
                initial={{
                  boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
                }}
                animate={{
                  boxShadow:
                    message.role === 'user'
                      ? '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                      : '0 2px 8px -2px rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.04)',
                }}
                transition={{
                  delay: 0.2,
                  duration: 0.3,
                }}
                style={{
                  maxWidth: '75%',
                  padding: 'var(--op-space-small)',
                  borderRadius: 'var(--op-radius-medium)',
                  backgroundColor:
                    message.role === 'user'
                      ? 'var(--op-color-primary-base)'
                      : 'var(--op-color-neutral-plus-six)',
                  color:
                    message.role === 'user'
                      ? 'var(--op-color-primary-on-base)'
                      : 'var(--op-color-on-background)',
                  fontSize: 'var(--op-font-small)',
                  lineHeight: 1.5,
                  textAlign: 'left',
                  whiteSpace: 'pre-line',
                }}
              >
                {renderMessageWithCitations(message)}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            layout
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
              layout
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

        {/* Summary Plan in conversation */}
        {showPlan && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: '100%',
              border: '1px solid var(--op-color-border)',
              borderRadius: 'var(--op-radius-large)',
              padding: 'var(--op-space-x-large)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--op-font-large)',
                fontWeight: 600,
                textAlign: 'left',
              }}
            >
              Conversation Summary
            </h3>
            <p
              style={{
                fontSize: 'var(--op-font-small)',
                color: 'var(--op-color-neutral-on-plus-max)',
                marginBottom: 'var(--op-space-x-large)',
                textAlign: 'left',
                lineHeight: 1.6,
              }}
            >
              Based on our discussion, here&apos;s what we covered and the recommended
              next steps.
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--op-space-large)',
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: 'var(--op-font-medium)',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  Your Challenge
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
                  unmanageable as you scale. Off-the-shelf CRM platforms don&apos;t fit
                  your specific workflow needs.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: 'var(--op-font-medium)',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  Timeline
                </h4>
                <p
                  style={{
                    fontSize: 'var(--op-font-small)',
                    margin: 0,
                    textAlign: 'left',
                    lineHeight: 1.6,
                  }}
                >
                  Looking to have a solution in place within the next 6 months.
                </p>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: 'var(--op-font-medium)',
                    fontWeight: 600,
                    textAlign: 'left',
                  }}
                >
                  Next Steps
                </h4>
                <ul
                  style={{
                    fontSize: 'var(--op-font-small)',
                    margin: 0,
                    paddingLeft: 'var(--op-space-x-large)',
                    textAlign: 'left',
                    lineHeight: 2,
                  }}
                >
                  <li>Schedule a discovery call with you and your CTO</li>
                  <li>Review your current workflow and data requirements</li>
                  <li>Prepare a custom solution proposal tailored to your needs</li>
                </ul>
              </div>
            </div>

            <div
              style={{
                marginTop: 'var(--op-space-x-large)',
                paddingTop: 'var(--op-space-x-large)',
                borderTop: '1px solid var(--op-color-border)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--op-space-small)',
                }}
              >
                <Button variant="primary" style={{ flex: 1, cursor: 'default' }}>
                  <HugeiconsIcon icon={Mail01Icon} size={18} />
                  <span>Email me this summary</span>
                </Button>
                <Button variant="secondary" style={{ flex: 1, cursor: 'default' }}>
                  <HugeiconsIcon icon={Calendar03Icon} size={18} />
                  <span>Schedule a conversation</span>
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

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
            <PromptInputBody>
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
                    placeholder="Ask me anything..."
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
                <PromptInputButton>
                  <HugeiconsIcon icon={Globe02Icon} size={20} />
                  <span>Search</span>
                </PromptInputButton>
              </PromptInputTools>
              <PromptInputSubmit disabled={true} />
            </PromptInputFooter>
          </PromptInput>
        </PromptInputProvider>
      </div>

      {/* Start Your Own Conversation Button */}
      {showButton && (
        <motion.button
          initial={{
            opacity: 0,
            y: 20,
            scale: 0.9,
            filter: 'blur(4px)',
          }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            filter: 'blur(0px)',
          }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1],
            delay: showPlan ? 0.5 : 0.2,
          }}
          onClick={handleInterrupt}
          style={{
            padding: 'var(--op-space-medium) var(--op-space-large)',
            backgroundColor: 'var(--op-color-primary-base)',
            color: 'var(--op-color-primary-on-base)',
            border: 'none',
            borderRadius: 'var(--op-radius-medium)',
            fontSize: 'var(--op-font-medium)',
            fontWeight: 600,
            cursor: 'pointer',
            alignSelf: 'left',
            justifySelf: 'flex-end',
            boxShadow:
              '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
          whileTap={{
            scale: 0.98,
            boxShadow: '0 2px 6px -1px rgba(0, 0, 0, 0.08)',
            transition: { duration: 0.1 },
          }}
        >
          Start your own conversation
        </motion.button>
      )}
    </div>
  )
}
