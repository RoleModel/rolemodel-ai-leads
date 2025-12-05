'use client'

import { useState, useSyncExternalStore, useEffect } from 'react'
import { Hero } from '@/components/intro/Hero'
import { HowItWorks } from '@/components/intro/HowItWorks'
import { CTA } from '@/components/intro/CTA'
import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'
import SectionBand from '@/components/intro/SectionBand'
import { trackView, trackEngagement, trackConversion } from '@/lib/ab-testing/tracking'
import './page.css'

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'
const STORAGE_KEY = 'intro-a-visitor'
const AB_TEST_PATH = '/intro/a'

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

export default function IntroPage() {
  const [showChat, setShowChat] = useState(false)
  const storedVisitor = useSessionStorage<VisitorData>(STORAGE_KEY)
  const [visitorData, setVisitorData] = useState<VisitorData | null>(null)

  // Use stored visitor if available and no local state set yet
  const activeVisitor = visitorData ?? storedVisitor
  const hasExistingSession = storedVisitor !== null

  // Track page view on mount
  useEffect(() => {
    trackView(AB_TEST_PATH)

    // Track engagement when user scrolls past 50% of page
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      if (scrollPercentage > 50) {
        trackEngagement(AB_TEST_PATH, { scrollDepth: scrollPercentage })
        window.removeEventListener('scroll', handleScroll)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleFormSubmit = async (data: { name: string; email: string }) => {
    // Submit to API to create conversation and capture lead
    const response = await fetch('/api/intro-lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        chatbotId: DEFAULT_CHATBOT_ID,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to submit form')
    }

    const result = await response.json()

    // Track conversion
    trackConversion(AB_TEST_PATH, { email: data.email })

    // Store visitor data and trigger transition
    const visitor: VisitorData = {
      name: data.name,
      email: data.email,
      conversationId: result.conversationId,
    }
    setVisitorData(visitor)

    // Persist to sessionStorage for page refresh
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(visitor))

    // Transition to chat
    setShowChat(true)
  }

  return (
    <div className="intro-page">
      <div className={`intro-page__content${showChat ? ' intro-page__content--exiting' : ''}`}>
        <Hero />
        <HowItWorks />
        <SectionBand autoAnimate={true} reverse={true} minHeight={12} maxHeight={14} color={['#364E5D', '#324B59', '#475658', '#646A60', '#8D887D', '#9D95A4', '#9C97BD', '#BDBBFF']} />
        <CTA
          onSubmit={handleFormSubmit}
          hasExistingSession={hasExistingSession}
          onContinue={() => setShowChat(true)}
        />
      </div>

      <div className={`intro-page__chat${showChat ? ' intro-page__chat--entering' : ''}`}>
        {activeVisitor && (
          <div className="intro-page__chat-inner" data-theme-mode="light">
            <LeadsPageWithProvider
              chatbotId={DEFAULT_CHATBOT_ID}
              showSidebar={true}
              loadFromApi={true}
              isEmbed={false}
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
