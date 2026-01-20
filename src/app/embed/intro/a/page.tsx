'use client'

import { LandingPageA } from '@/components/intro/LandingPageA'

export default function EmbedIntroA() {
  return (
    <div
      className="app-body"
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'auto',
      }}
      data-theme="leads"
      data-theme-mode="light"
    >
      <LandingPageA />
    </div>
  )
}
