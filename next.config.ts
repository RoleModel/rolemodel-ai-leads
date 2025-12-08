import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  reactCompiler: true,
  async headers() {
    const frameableHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'ALLOWALL',
      },
      {
        key: 'Content-Security-Policy',
        value: 'frame-ancestors *',
      },
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
    ]

    return [
      {
        // Allow embedding embed pages in iframes (for Framer, etc.)
        source: '/embed/:path*',
        headers: frameableHeaders,
      },
      {
        // Allow embedding widget pages in iframes
        source: '/widget/:path*',
        headers: frameableHeaders,
      },
      {
        // Allow embedding intro/landing pages in iframes
        source: '/intro/:path*',
        headers: frameableHeaders,
      },
      {
        // Protect other pages from clickjacking
        source: '/((?!embed|widget|intro).*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
    ]
  },
}

export default nextConfig
