import type { Metadata } from 'next'

import '../globals.css'

export const metadata: Metadata = {
  title: 'RoleModel Software - Embed',
  description: 'Embeddable components for RoleModel Software',
  robots: {
    index: false,
    follow: false,
  },
}

export default function EmbedLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Reset styles for clean embed */
              *, *::before, *::after {
                box-sizing: border-box;
              }
              html, body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                overflow: auto;
                -webkit-overflow-scrolling: touch;
              }
              /* Prevent body scroll issues in iframes */
              body {
                overscroll-behavior: contain;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
