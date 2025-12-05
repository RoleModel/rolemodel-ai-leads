'use client'

import { useSearchParams } from 'next/navigation'

import { LeadsPageWithProvider } from '@/components/leads-page/LeadsPageWithProvider'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

export const runtime = 'edge'

export default function EmbedLeadsPage() {
  const searchParams = useSearchParams()
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

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
      <LeadsPageWithProvider
        chatbotId={chatbotId}
        showSidebar={true}
        loadFromApi={true}
        isEmbed={true}
      />
    </div>
  )
}
