'use client'
import { Suspense } from 'react'

import { NavigationSidebar } from '@/components/layout/NavigationSidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PlaygroundConfig } from '@/components/playground/PlaygroundConfig'
import { PlaygroundPreview } from '@/components/playground/PlaygroundPreview'

export default function PlaygroundPage() {
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
          <PlaygroundConfig />

          {/* Chat Preview */}
          <PlaygroundPreview />
        </main>
      </div>
    </div>
  )
}
