'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface WidgetConfig {
  displayName: string
  initialMessage: string
  theme: 'light' | 'dark'
  primaryColor: string
  buttonColor: string
  alignment: 'left' | 'right'
  profilePicture: string
}

interface WidgetConfigContextType {
  config: WidgetConfig
  updateConfig: (updates: Partial<WidgetConfig>) => void
}

const WidgetConfigContext = createContext<WidgetConfigContextType | undefined>(undefined)

export function WidgetConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WidgetConfig>({
    displayName: 'RoleModel Software',
    initialMessage: 'Hi! Let&apos;s talk about your project!',
    theme: 'light',
    primaryColor: '#007BFF',
    buttonColor: '#000000',
    alignment: 'right',
    profilePicture: 'R',
  })

  const updateConfig = (updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <WidgetConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </WidgetConfigContext.Provider>
  )
}

export function useWidgetConfig() {
  const context = useContext(WidgetConfigContext)
  if (!context) {
    throw new Error('useWidgetConfig must be used within WidgetConfigProvider')
  }
  return context
}
