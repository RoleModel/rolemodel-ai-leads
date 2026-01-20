'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

function RootPageContent() {
  const searchParams = useSearchParams()
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  return (
    <LeadsPageWithProvider
      chatbotId={chatbotId}
      showSidebar={true}
      loadFromApi={true}
      isEmbed={true}
    />
  )
}

export default function RootPage() {
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
        <RootPageContent />
      </Suspense>
    </div>
  )
}
