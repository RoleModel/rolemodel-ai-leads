'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'
const STORAGE_KEY = 'intro-a-visitor'

function ChatPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  useEffect(() => {
    // Check if user has completed the intro form
    const storedVisitor = sessionStorage.getItem(STORAGE_KEY)

    if (!storedVisitor) {
      // Redirect to intro page if no session found
      router.push('/')
      return
    }

    setIsAuthorized(true)
  }, [router])

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <LeadsPageWithProvider
      chatbotId={chatbotId}
      showSidebar={true}
      loadFromApi={true}
    />
  )
}

export default function ChatPage() {
  return (
    <div
      className="app-body"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
      }}
      data-theme="leads"
      data-theme-mode="light"
    >
      <Suspense fallback={<div>Loading...</div>}>
        <ChatPageContent />
      </Suspense>
    </div>
  )
}
