'use client'

import { useGSAP } from '@gsap/react'
import {
  AlarmClockIcon,
  ArrowDownRight01Icon,
  ArrowRight02Icon,
} from '@hugeicons-pro/core-stroke-standard'
import {
  ArtificialIntelligence04Icon,
  Calendar03Icon,
  DocumentAttachmentIcon,
  Message02Icon,
} from '@hugeicons-pro/core-twotone-rounded'
import { HugeiconsIcon } from '@hugeicons/react'
import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { motion } from 'motion/react'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { HalftoneSwirl } from '@/components/effects/HalftoneSwirl'
import AnimatedPath from '@/components/intro/AnimatedPath'
import Logo from '@/components/intro/Logo'
import SectionBand from '@/components/intro/SectionBand'
import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import ButtonPill from '@/components/ui/button-animated'
import { Card } from '@/components/ui/card'

import { trackConversion, trackEngagement, trackView } from '@/lib/ab-testing/tracking'

import styles from './landing-page-a.module.css'

gsap.registerPlugin(useGSAP, SplitText)

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'
const STORAGE_KEY = 'intro-a-visitor'
const AB_TEST_PATH = '/intro/a'

interface VisitorData {
  name: string
  email: string
  conversationId: string
}

const steps = [
  {
    icon: Message02Icon,
    title: "Share what you're trying to accomplish",
    description:
      "In a few quick prompts, you'll outline the problem you're facing and what a win would look like for your business. No jargon, no prep required.",
    borderBottom: 'var(--brand-Bright-Blue)',
  },
  {
    icon: ArtificialIntelligence04Icon,
    title: 'See your situation from a new angle',
    description:
      'The tool helps you think through key considerations—like workflow gaps, integration needs, and potential pitfalls—while pointing you to resources that match your context.',
    borderBottom: 'var(--brand-Bright-Yellow)',
  },
  {
    icon: DocumentAttachmentIcon,
    title: 'Get a clear, structured overview',
    description:
      "You'll receive a simple, easy-to-read summary that highlights your goals, constraints, and what factors matter most as you evaluate custom software.",
    borderBottom: 'var(--brand-Medium-Green)',
  },
  {
    icon: Calendar03Icon,
    title: 'Choose what happens next',
    description:
      "If the timing and fit look right, you can book a consultation. If not, we'll provide helpful guidance and content so you can keep exploring at your own pace.",
    borderBottom: 'var(--blue-300)',
  },
]

// Use useSyncExternalStore to safely read sessionStorage
function useSessionStorage<T>(key: string): T | null {
  const subscribe = (callback: () => void) => {
    window.addEventListener('storage', callback)
    return () => window.removeEventListener('storage', callback)
  }

  const getSnapshot = () => {
    const stored = sessionStorage.getItem(key)
    return stored
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

export interface LandingPageAProps {
  chatbotId?: string
}

export function LandingPageA({ chatbotId }: LandingPageAProps) {
  const activeChatbotId = chatbotId || DEFAULT_CHATBOT_ID
  const storedVisitor = useSessionStorage<VisitorData>(STORAGE_KEY)
  // Auto-show chat if there's an existing session
  const [showChat, setShowChat] = useState(false)
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const heroContainerRef = useRef<HTMLDivElement>(null)

  // Use stored visitor if available and no local state set yet
  const activeVisitor = visitorData ?? storedVisitor
  const hasExistingSession = storedVisitor !== null

  // Auto-show chat when there's an existing session (on page load/refresh)
  useEffect(() => {
    if (hasExistingSession && !showChat) {
      setShowChat(true)
    }
  }, [hasExistingSession, showChat])

  // Track page view on mount
  useEffect(() => {
    trackView(AB_TEST_PATH)

    // Track engagement when user scrolls past 50% of page
    const handleScroll = () => {
      const scrollPercentage =
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercentage > 50) {
        trackEngagement(AB_TEST_PATH, { scrollDepth: scrollPercentage })
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // GSAP animation for hero title
  useGSAP(
    () => {
      gsap.set('h1', { opacity: 1 })
      const split = SplitText.create('.title', { type: 'words, chars' })
      gsap.from(split.chars, {
        x: -10,
        autoAlpha: 0,
        stagger: 0.04,
      })
    },
    { scope: heroContainerRef }
  )

  const handleScrollToHowItWorks = () => {
    const formSection = document.getElementById('how-it-works')
    formSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleScrollToGetStarted = () => {
    const formSection = document.getElementById('get-started')
    formSection?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFormSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()

    setIsLoading(true)
    try {
      // Submit to API to create conversation and capture lead
      const response = await fetch('/api/intro-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          chatbotId: activeChatbotId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit form')
      }

      const result = await response.json()

      // Track conversion
      trackConversion(AB_TEST_PATH, { email })

      // Store visitor data and trigger transition
      const visitor: VisitorData = {
        name,
        email,
        conversationId: result.conversationId,
      }
      setVisitorData(visitor)

      // Persist to sessionStorage for page refresh
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visitor))

      // Transition to chat
      setShowChat(true)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const titleVariant = {
    hidden: { x: '-100vw' },
    visible: {
      x: 0,
      transition: {
        delay: 2,
        when: 'beforeChildren',
        staggerChildren: 0.5,
      },
    },
  }

  const titleTextVariant = {
    hidden: { filter: 'blur(10px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  }

  const actionsVariant = {
    hidden: { filter: 'blur(10px)', opacity: 0 },
    visible: { filter: 'blur(0px)', opacity: 1 },
  }

  return (
    <div className="intro-page">
      <div
        className={`intro-page__content${showChat ? ' intro-page__content--exiting' : ''}`}
      >
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.logo}>
            <Logo
              variant="white"
              style={{ width: 'calc(var(--op-size-unit) * 24)', height: 'auto' }}
            />
          </div>
          <div className={`container ${styles['hero-container']}`}>
            <div ref={heroContainerRef}>
              <h1 id="heading" className={styles['hero-title']}>
                <span className="title">Is{` `}</span>
                <span className={styles['title-highlight']}>custom software</span>
                <div>
                  <span className="title">right for{` `}</span>
                  <span className={`title ${styles.circle}`}>
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
                  <span className="title">business?</span>
                </div>
              </h1>
              <motion.div variants={titleVariant} initial="hidden" animate="visible">
                <motion.p className={styles['hero-subtitle']} variants={titleTextVariant}>
                  Find out in a just few minutes. This A.I. tool helps you explore whether
                  custom software makes sense for your business.
                </motion.p>

                <motion.div className={styles['hero-actions']} variants={actionsVariant}>
                  <ButtonPill
                    iconRight={
                      <HugeiconsIcon
                        icon={ArrowDownRight01Icon}
                        strokeWidth={2}
                        size={20}
                      />
                    }
                    label="How it works"
                    variant="brightblue"
                    onClick={handleScrollToHowItWorks}
                  ></ButtonPill>
                  <div className={styles['time-estimate']}>
                    <HugeiconsIcon icon={AlarmClockIcon} size={20} />
                    <span>Takes 3-5 minutes</span>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className={styles['how-it-works']}>
          <div
            className={`container container--medium ${styles['how-it-works-container']}`}
          >
            <div className={styles['how-it-works-header']}>
              <h2 className={styles['how-it-works-title']}>How it works</h2>
              <p className={styles['how-it-works-subtitle']}>
                A simple process to help you make an informed decision
              </p>
            </div>

            <div className={styles.steps}>
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <Card
                    key={step.title}
                    className={`card ${styles.step}`}
                    borderBottom={step.borderBottom}
                    variant="dark"
                  >
                    <div className={styles['step-content']}>
                      <div className={styles['icon-wrapper']}>
                        <HugeiconsIcon
                          icon={Icon}
                          size={48}
                          color="var(--op-color-white)"
                          strokeWidth={1}
                        />
                        <div
                          className={styles['step-number']}
                          style={{ backgroundColor: step.borderBottom }}
                        >
                          {index + 1}
                        </div>
                      </div>
                      <h4 className={styles['step-title']}>{step.title}</h4>
                      <p className={styles['step-description']}>{step.description}</p>
                    </div>
                  </Card>
                )
              })}
            </div>

            <div className={styles['how-it-works-cta']}>
              <ButtonPill
                label="Get started"
                iconRight={
                  <HugeiconsIcon strokeWidth={2} icon={ArrowDownRight01Icon} size={20} />
                }
                variant="brightblue"
                onClick={handleScrollToGetStarted}
              />
            </div>
          </div>
        </section>

        {/* Section Band */}
        <SectionBand
          autoAnimate={true}
          reverse={true}
          minHeight={12}
          maxHeight={14}
          color={[
            '#364E5D',
            '#324B59',
            '#475658',
            '#646A60',
            '#8D887D',
            '#9D95A4',
            '#9C97BD',
            '#BDBBFF',
          ]}
        />

        {/* CTA Section */}
        <section id="get-started" className={styles.cta}>
          <div className={`container ${styles['cta-container']}`}>
            <h2 className={styles['cta-title']}>
              {hasExistingSession ? (
                <>Welcome back!</>
              ) : (
                <>
                  Ready to find out if <br />{' '}
                  <span className={styles['cta-title-highlight']}>custom software </span>{' '}
                  is right for you?
                </>
              )}
            </h2>
            <p className={styles['cta-subtitle']}>
              {hasExistingSession
                ? 'You have an active conversation. Pick up where you left off.'
                : 'Start your assessment now.'}
            </p>
            <p className={styles['cta-subtitle']}>
              {hasExistingSession
                ? null
                : "We'll email you a personalized summary with insights and next steps."}
            </p>

            {hasExistingSession ? (
              <div className={styles.form}>
                <div className={styles['form-card']}>
                  <ButtonPill
                    label="Continue Conversation"
                    iconRight={<HugeiconsIcon icon={ArrowRight02Icon} size={20} />}
                    variant="brightblue"
                    onClick={() => setShowChat(true)}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className={styles.form}>
                <div className={styles['form-card']}>
                  <div className={styles['form-fields']}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Your name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className={styles.input}
                    />
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={styles.input}
                    />
                    <ButtonPill
                      className={styles['form-button']}
                      label={isLoading ? 'Starting...' : 'Start'}
                      iconRight={
                        <HugeiconsIcon
                          icon={ArrowRight02Icon}
                          strokeWidth={2}
                          size={20}
                        />
                      }
                      variant="brightblue"
                      onClick={(e) => {
                        void handleFormSubmit(e)
                      }}
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </form>
            )}
            {!hasExistingSession && (
              <div className={styles.footer}>
                <p className={styles['footer-text']}>
                  <span className={styles['footer-text-highlight']}>No pressure.</span>{' '}
                  This tool is designed to help you make the right decision for your
                  business.
                </p>
              </div>
            )}
          </div>
          <div className={styles.halftone}>
            <HalftoneSwirl
              fit="contain"
              alignX="end"
              effectRadius={60}
              effectStrength={0.8}
              smoothing={0.09}
            />
          </div>
          <PrivacyTermsLinks
            style={{
              position: 'absolute',
              bottom: 'var(--op-space-medium)',
              right: 'var(--op-space-medium)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
            variant="light"
            className="intro-page__footer-links"
          />
        </section>
      </div>

      <div className={`intro-page__chat${showChat ? ' intro-page__chat--entering' : ''}`}>
        {activeVisitor && (
          <div className="intro-page__chat-inner" data-theme-mode="light">
            <LeadsPageWithProvider
              chatbotId={activeChatbotId}
              showSidebar={true}
              loadFromApi={true}
              visitorName={activeVisitor.name}
              visitorEmail={activeVisitor.email}
              conversationId={activeVisitor.conversationId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default LandingPageA
