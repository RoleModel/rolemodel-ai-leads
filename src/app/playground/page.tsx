'use client'
import { Suspense, useState, useCallback } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PlaygroundConfig } from '@/components/playground/PlaygroundConfig'
import { PlaygroundPreview } from '@/components/playground/PlaygroundPreview'

export interface PlaygroundSettings {
  model: string
  temperature: number
  instructions: string
}

export default function PlaygroundPage() {
  const [settings, setSettings] = useState<PlaygroundSettings>({
    model: 'claude-sonnet-4.5',
    temperature: 0.7,
    instructions: `### Business Context
RoleModel Software is a custom software development company that specializes in creating tailored solutions to enhance business workflows and integrate with third-party applications. With nearly 30 years of experience, they focus on understanding client needs, iterative development, and building sustainable software that scales with the business. Their key services include web and mobile app development, UI/UX design, and expertise amplification, aiming to optimize performance and reduce inefficiencies through custom software solutions.`,
  })

  const [resetKey, setResetKey] = useState(0)

  const handleSettingsChange = useCallback((newSettings: Partial<PlaygroundSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  const handleReset = useCallback(() => {
    setResetKey((prev) => prev + 1)
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <Suspense fallback={<div>Loading...</div>}>
          <NavigationSidebar />
        </Suspense>

        <main
          style={{
            flex: 1,
            display: 'flex',
            overflow: 'hidden',
            backgroundColor: 'var(--op-color-background)',
          }}
        >
          {/* Configuration Panel */}
          <PlaygroundConfig
            settings={settings}
            onSettingsChange={handleSettingsChange}
          />

          {/* Chat Preview */}
          <PlaygroundPreview
            key={resetKey}
            settings={settings}
            onReset={handleReset}
          />
        </main>
      </div>
    </div>
  )
}
