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
  visitorName?: string
  visitorEmail?: string
  conversationId?: string
}

function LeadsPageLoader({
  chatbotId,
  showSidebar,
  editMode,
  loadFromApi,
  isEmbed,
  visitorName,
  visitorEmail,
  conversationId,
}: LeadsPageWithProviderProps) {
  const { updateSettings, isLoading } = useLeadsPageSettings()
  // Track whether user has manually overridden the theme
  const [manualTheme, setManualTheme] = useState<'light' | 'dark' | null>(null)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')
  const [apiLoading, setApiLoading] = useState(loadFromApi)

  // Detect system color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    // Set initial value
    handleChange(mediaQuery)

    // Listen for changes
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Effective theme: manual override takes precedence, otherwise use system
  const theme = manualTheme ?? systemTheme

  // Handle theme toggle - sets manual override
  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setManualTheme(newTheme)
  }

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
      onThemeChange={handleThemeChange}
      isEmbed={isEmbed}
      visitorName={visitorName}
      visitorEmail={visitorEmail}
      initialConversationId={conversationId}
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
