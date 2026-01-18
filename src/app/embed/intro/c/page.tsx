'use client'

import { LandingPageC } from '@/components/intro/LandingPageC'

export default function EmbedIntroC() {
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
      <LandingPageC isEmbed />
    </div>
  )
}
