'use client'

import IntroPageC from '@/app/intro/c/page'

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
      <IntroPageC />
    </div>
  )
}
