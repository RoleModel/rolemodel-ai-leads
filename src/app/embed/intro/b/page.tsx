'use client'

import IntroBPage from '@/app/intro/b/page'

export const runtime = 'edge'

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
      <IntroBPage />
    </div>
  )
}
