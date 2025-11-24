'use client'

import { useEffect, useState } from 'react'

import {
  LeadsPageSettingsProvider,
  useLeadsPageSettings,
} from '@/contexts/LeadsPageSettingsContext'

import { LeadsPageView } from './LeadsPageView'

interface LeadsPageWithProviderProps {
  chatbotId: string
  showSidebar?: boolean
  editMode?: boolean
  loadFromApi?: boolean
  isEmbed?: boolean
}

function LeadsPageLoader({
  chatbotId,
  showSidebar,
  editMode,
  loadFromApi,
  isEmbed,
}: LeadsPageWithProviderProps) {
  const { updateSettings, isLoading } = useLeadsPageSettings()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [apiLoading, setApiLoading] = useState(loadFromApi)

  useEffect(() => {
    if (!loadFromApi) return

    async function loadSettings() {
      try {
        const response = await fetch(`/api/leads-page-settings?chatbotId=${chatbotId}`)
        const data = await response.json()

        if (data.settings) {
          updateSettings({
            pageTitle: data.settings.page_title || 'Leads page',
            pageDescription:
              data.settings.page_description ||
              'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.',
            favicon: data.settings.favicon || '',
            logo: data.settings.logo || '',
            aiInstructions: data.settings.ai_instructions || '',
          })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      } finally {
        setApiLoading(false)
      }
    }

    loadSettings()
  }, [chatbotId, loadFromApi, updateSettings])

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme-mode', theme)
  }, [theme])

  // Don't render until settings are loaded to prevent flash
  if (isLoading || apiLoading) {
    return null
  }

  return (
    <LeadsPageView
      chatbotId={chatbotId}
      showSidebar={showSidebar}
      editMode={editMode}
      theme={theme}
      onThemeChange={setTheme}
      isEmbed={isEmbed}
    />
  )
}

export function LeadsPageWithProvider(props: LeadsPageWithProviderProps) {
  return (
    <LeadsPageSettingsProvider>
      <LeadsPageLoader {...props} />
    </LeadsPageSettingsProvider>
  )
}
