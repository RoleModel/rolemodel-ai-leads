import type { Metadata } from 'next'
import { DM_Sans, Geist_Mono } from 'next/font/google'

import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RoleModel AI Leads',
  description:
    'RoleModel AI Leads is a platform that helps you generate leads for your business using AI.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@rolemodel/optics@2.2.0/dist/css/optics.min.css"
        />
      </head>
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased app-body`}>
        {children}
      </body>
    </html>
  )
}
