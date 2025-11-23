'use client'

import { useSearchParams } from 'next/navigation'
import { LeadsPageView } from '@/components/leads-page/LeadsPageView'

// Default chatbot ID for RoleModel
const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

export default function EmbedLeadsPage() {
  const searchParams = useSearchParams()
  const chatbotId = searchParams.get('chatbotId') || DEFAULT_CHATBOT_ID

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: 'var(--op-color-background)' }}>
      <LeadsPageView chatbotId={chatbotId} showSidebar={true} />
    </div>
  )
}
