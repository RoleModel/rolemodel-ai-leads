'use client'

import { useEffect } from 'react'
import { LeadsPageSettingsProvider, useLeadsPageSettings } from "@/contexts/LeadsPageSettingsContext"
import { LeadsPageView } from "./LeadsPageView"

interface LeadsPageWithProviderProps {
  chatbotId: string
  showSidebar?: boolean
  editMode?: boolean
  loadFromApi?: boolean
}

function LeadsPageLoader({ chatbotId, showSidebar, editMode, loadFromApi }: LeadsPageWithProviderProps) {
  const { updateSettings } = useLeadsPageSettings()

  useEffect(() => {
    if (!loadFromApi) return

    async function loadSettings() {
      try {
        const response = await fetch(`/api/leads-page-settings?chatbotId=${chatbotId}`)
        const data = await response.json()

        if (data.settings) {
          updateSettings({
            pageTitle: data.settings.page_title || 'Leads page',
            pageDescription: data.settings.page_description || 'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.',
            favicon: data.settings.favicon || '',
            logo: data.settings.logo || '',
            aiInstructions: data.settings.ai_instructions || '',
          })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    loadSettings()
  }, [chatbotId, loadFromApi, updateSettings])

  return <LeadsPageView chatbotId={chatbotId} showSidebar={showSidebar} editMode={editMode} />
}

export function LeadsPageWithProvider(props: LeadsPageWithProviderProps) {
  return (
    <LeadsPageSettingsProvider>
      <LeadsPageLoader {...props} />
    </LeadsPageSettingsProvider>
  )
}
