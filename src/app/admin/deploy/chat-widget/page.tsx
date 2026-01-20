'use client'

import { Suspense } from 'react'

import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { WidgetEditorSidebar } from '@/components/widget/WidgetEditorSidebar'
import { WidgetPreviewArea } from '@/components/widget/WidgetPreviewArea'

import { WidgetConfigProvider } from '@/contexts/WidgetConfigContext'

export default function ChatWidgetDesignerPage() {
  return (
    <WidgetConfigProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Suspense fallback={<div>Loading...</div>}>
            <NavigationSidebar />
          </Suspense>
          <WidgetEditorSidebar />
          <WidgetPreviewArea />
        </div>
      </div>
    </WidgetConfigProvider>
  )
}
