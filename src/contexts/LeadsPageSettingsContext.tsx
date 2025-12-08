'use client'

import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react'

interface RagConfig {
  // Knowledge Base Retrieval
  sourceLimit: number
  similarityThreshold: number

  // Citation & Case Studies
  enableCitations: boolean
  enableCaseStudies: boolean
  citationStyle: string

  // Conversation Flow
  enableBANT: boolean
  askForName: boolean
  askForEmail: boolean
  maxQuestions: number

  // Response Style
  responseConciseness: 'brief' | 'moderate' | 'detailed'
  enablePersonalization: boolean

  // Custom Instructions
  customInstructions: string
}

interface LeadsPageSettings {
  pageTitle: string
  pageDescription: string
  introText: string
  timeEstimate: string
  aiInstructions: string
  model: string
  calendlyUrl: string
  ragConfig: RagConfig
}

interface LeadsPageSettingsContextType {
  settings: LeadsPageSettings
  updateSettings: (updates: Partial<LeadsPageSettings>) => void
  saveSettings: () => Promise<void>
  isLoading: boolean
}

export const LeadsPageSettingsContext = createContext<LeadsPageSettingsContextType | undefined>(
  undefined
)

interface LeadsPageSettingsProviderProps {
  children: ReactNode
  chatbotId?: string
}

const DEFAULT_CHATBOT_ID = 'a0000000-0000-0000-0000-000000000001'

const DEFAULT_RAG_CONFIG: RagConfig = {
  // Knowledge Base Retrieval
  sourceLimit: 5,
  similarityThreshold: 0.5,

  // Citation & Case Studies
  enableCitations: true,
  enableCaseStudies: true,
  citationStyle: 'numbered',

  // Conversation Flow
  enableBANT: true,
  askForName: true,
  askForEmail: true,
  maxQuestions: 5,

  // Response Style
  responseConciseness: 'moderate',
  enablePersonalization: true,

  // Custom Instructions
  customInstructions: '',
}

export function LeadsPageSettingsProvider({ children, chatbotId }: LeadsPageSettingsProviderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [settings, setSettings] = useState<LeadsPageSettings>({
    pageTitle: 'Leads page',
    pageDescription:
      'Get personalized answers about your project in minutes. Quick, conversational, and built for busy founders.',
    introText: 'This tool helps you see if custom software makes sense for your business.',
    timeEstimate: '3-5 minutes',
    aiInstructions: '',
    model: 'gpt-4o-mini',
    calendlyUrl: '',
    ragConfig: DEFAULT_RAG_CONFIG,
  })

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const id = chatbotId || DEFAULT_CHATBOT_ID
        const response = await fetch(`/api/leads-page-settings?chatbotId=${id}`)
        if (response.ok) {
          const data = await response.json()
          if (data.settings) {
            setSettings({
              pageTitle: data.settings.page_title || 'Leads page',
              pageDescription:
                data.settings.page_description ||
                'Get personalized answers about your project in minutes.',
              introText:
                data.settings.intro_text ||
                'This tool helps you see if custom software makes sense for your business.',
              timeEstimate: data.settings.time_estimate || '3-5 minutes',
              aiInstructions: data.settings.ai_instructions || '',
              model: data.settings.model || 'gpt-4o-mini',
              calendlyUrl: data.settings.calendly_url || '',
              ragConfig: data.settings.rag_config || DEFAULT_RAG_CONFIG,
            })
          }
        }
      } catch (error) {
        console.error('Error loading leads page settings:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSettings()
  }, [chatbotId])

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
