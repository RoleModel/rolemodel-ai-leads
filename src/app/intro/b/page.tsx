'use client'

import { useEffect } from 'react'
import { LandingB } from '@/components/intro/LandingPage'
import { PrivacyTermsLinks } from '@/components/ui/PrivacyTermsLinks'
import { trackView, trackEngagement, trackConversion } from '@/lib/ab-testing/tracking'
import './page.css'

const AB_TEST_PATH = '/intro/b'

export default function IntroBPage() {
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

    // Track conversion when user sends a message (listen for custom event)
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

  return (
    <div className="intro-b-page">
      <LandingB title="Is custom software" line2="the right" highlight="fit" punctuation="?" />
      <PrivacyTermsLinks variant="dark" className="intro-page__footer-links" />
    </div>
  )
}
