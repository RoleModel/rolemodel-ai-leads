'use client'

import { LandingPageB } from '@/components/intro/LandingPageB'

export default function EmbedIntroB() {
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
      <LandingPageB />
    </div>
  )
}
