'use client'

import IntroPage from '@/app/intro/a/page'

export const runtime = 'edge'

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
      <IntroPage />
    </div>
  )
}
