import type { Metadata } from 'next'
import type { Viewport } from 'next';
import { DM_Sans, Geist_Mono } from 'next/font/google'
import { SpeedInsights } from "@vercel/speed-insights/next"

import './globals.css'

const dmSans = DM_Sans({
  variable: '--dm-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'A.I. Custom Software Analysis',
  description:
    'A tool that helps you analyze your need for custom software.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#021b20',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-theme="leads">
      <head>
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
      </head>
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased app-body`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  )
}
