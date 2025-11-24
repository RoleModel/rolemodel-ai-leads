'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface LeadsPageSettings {
  pageTitle: string
  pageDescription: string
  favicon: string
  logo: string
  aiInstructions: string
}

interface LeadsPageSettingsContextType {
  settings: LeadsPageSettings
  updateSettings: (updates: Partial<LeadsPageSettings>) => void
}

const LeadsPageSettingsContext = createContext<LeadsPageSettingsContextType | undefined>(undefined)

export function LeadsPageSettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<LeadsPageSettings>({
    pageTitle: 'Leads page',
    pageDescription: 'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.',
    favicon: '',
    logo: '',
    aiInstructions: '',
  })

  const updateSettings = useCallback((updates: Partial<LeadsPageSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <LeadsPageSettingsContext.Provider value={{ settings, updateSettings }}>
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
