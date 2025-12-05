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
    const iframeHeaders = [
      {
        key: 'Content-Security-Policy',
        value:
          "frame-ancestors 'self' http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:* *",
      },
      {
        key: 'X-Frame-Options',
        value: 'ALLOWALL',
      },
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
      {
        key: 'Access-Control-Allow-Private-Network',
        value: 'true',
      },
    ]

    return [
      {
        // Allow embedding all pages in iframes
        source: '/:path*',
        headers: iframeHeaders,
      },
    ]
  },
}

export default nextConfig
