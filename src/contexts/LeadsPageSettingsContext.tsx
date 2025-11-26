'use client'

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'

interface LeadsPageSettings {
  pageTitle: string
  pageDescription: string
  favicon: string
  logo: string
  aiInstructions: string
  model: string
}

interface LeadsPageSettingsContextType {
  settings: LeadsPageSettings
  updateSettings: (updates: Partial<LeadsPageSettings>) => void
  saveSettings: () => Promise<void>
  isLoading: boolean
}

const LeadsPageSettingsContext = createContext<LeadsPageSettingsContextType | undefined>(
  undefined
)

export function LeadsPageSettingsProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<LeadsPageSettings>({
    pageTitle: 'Leads page',
    pageDescription:
      'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.',
    favicon: '',
    logo: '',
    aiInstructions: '',
    model: 'gpt-4o-mini',
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/leads-page-settings')
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings(data.settings)
          }
        }
      } catch (error) {
        console.error('Error loading leads page settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [])

  const updateSettings = useCallback((updates: Partial<LeadsPageSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  const saveSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/leads-page-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        console.error('Failed to save leads page settings')
      }
    } catch (error) {
      console.error('Error saving leads page settings:', error)
    }
  }, [settings])

  return (
    <LeadsPageSettingsContext.Provider
      value={{ settings, updateSettings, saveSettings, isLoading }}
    >
      {children}
    </LeadsPageSettingsContext.Provider>
  )
}

export function useLeadsPageSettings() {
  const context = useContext(LeadsPageSettingsContext)
  if (!context) {
    throw new Error('useLeadsPageSettings must be used within LeadsPageSettingsProvider')
  }
  return context
}
