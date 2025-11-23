"use client"

import { TopBar } from "@/components/layout/TopBar"
import { NavigationSidebar } from "@/components/layout/NavigationSidebar"
import { EditorSidebar } from "@/components/layout/EditorSidebar"
import { PreviewArea } from "@/components/layout/PreviewArea"

export default function HelpPageDesignerPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopBar />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <NavigationSidebar />
        <EditorSidebar />
        <PreviewArea />
      </div>
    </div>
  )
}
