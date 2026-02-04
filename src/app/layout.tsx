import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { DM_Sans, Geist_Mono } from 'next/font/google'
import Script from 'next/script'

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
  title: 'A.I. Custom Software Analysis | RoleModel Software',
  description:
    'A tool that helps you analyze your need for custom software. Get personalized insights in minutes through an AI-powered conversation.',
  metadataBase: new URL('https://rolemodel-ai-leads.vercel.app'),
  openGraph: {
    title: 'A.I. Custom Software Analysis',
    description:
      'Get personalized insights about custom software for your business in minutes through an AI-powered conversation.',
    url: 'https://rolemodel-ai-leads.vercel.app',
    siteName: 'RoleModel Software',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RoleModel A.I. Custom Software Analysis',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'A.I. Custom Software Analysis',
    description:
      'Get personalized insights about custom software for your business in minutes.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#021b20',
  viewportFit: 'cover',
}

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
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DRMKS1L114"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DRMKS1L114');
          `}
        </Script>
      </head>
      <body className={`${dmSans.variable} ${geistMono.variable} antialiased app-body`}>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
