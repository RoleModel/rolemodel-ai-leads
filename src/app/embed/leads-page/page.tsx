'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

export const runtime = 'edge'

export default function EmbedLeadsPage() {
  const searchParams = useSearchParams()
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  // Ensure Optics CSS is loaded for embed contexts
  useEffect(() => {
    // Check if Optics CSS is already loaded
    const existingLink = document.querySelector('link[href*="optics"]')
    if (!existingLink) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://cdn.jsdelivr.net/npm/@rolemodel/optics@2.2.0/dist/css/optics.min.css'
      document.head.appendChild(link)
    }
  }, [])

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: '#ffffff', // Fallback color instead of CSS variable
        overflow: 'hidden',
      }}
      data-theme-mode="light"
    >
      <LeadsPageWithProvider
        chatbotId={chatbotId}
        showSidebar={true}
        loadFromApi={true}
        isEmbed={true}
      />
    </div>
  )
}
