'use client'

import { Suspense, useState } from 'react'

import {
  DEFAULT_SIDEBAR_WIDTH,
  EditorSidebar,
  SIDEBAR_COLLAPSE_THRESHOLD,
} from '@/components/layout/EditorSidebar'
import { PreviewArea } from '@/components/layout/PreviewArea'
import { NavigationSidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'

import { LeadsPageSettingsProvider } from '@/contexts/LeadsPageSettingsContext'

export default function HelpPageDesignerPage() {
  const [sidebarWidth, setSidebarWidth] = useState(DEFAULT_SIDEBAR_WIDTH)

  // Collapse the preview sidebar when editor sidebar is wide
  const shouldCollapsePreviewSidebar = sidebarWidth >= SIDEBAR_COLLAPSE_THRESHOLD

  return (
    <LeadsPageSettingsProvider>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
        <TopBar />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          <Suspense fallback={<div>Loading...</div>}>
            <NavigationSidebar />
          </Suspense>
          <EditorSidebar width={sidebarWidth} onWidthChange={setSidebarWidth} />
          <PreviewArea forceCollapseSidebar={shouldCollapsePreviewSidebar} />
        </div>
      </div>
    </LeadsPageSettingsProvider>
  )
}
