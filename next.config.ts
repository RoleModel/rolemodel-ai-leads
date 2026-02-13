import { withSentryConfig } from '@sentry/nextjs'
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
    // Headers to allow embedding in iframes from any origin
    // Using CSP frame-ancestors (modern standard) - do NOT set X-Frame-Options
    // as there's no valid "allow all" value for X-Frame-Options
    const frameableHeaders = [
      {
        // frame-ancestors * allows embedding from any origin
        key: 'Content-Security-Policy',
        value: 'frame-ancestors *',
      },
      {
        key: 'Access-Control-Allow-Origin',
        value: '*',
      },
    ]

    // Headers to protect from clickjacking
    const protectedHeaders = [
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'self'",
      },
    ]

    return [
      // Frameable routes - allow embedding in any iframe
      {
        source: '/embed/:path*',
        headers: frameableHeaders,
      },
      {
        source: '/widget/:path*',
        headers: frameableHeaders,
      },
      {
        source: '/intro/:path*',
        headers: frameableHeaders,
      },
      // All other routes - protect from clickjacking
      // Uses negative lookahead to exclude frameable routes
      {
        source: '/((?!embed|widget|intro).*)',
        headers: protectedHeaders,
      },
      // Ensure root path is protected
      {
        source: '/',
        headers: protectedHeaders,
      },
    ]
  },
}

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://www.npmjs.com/package/@sentry/webpack-plugin#options

  org: 'rolemodel-software',

  project: 'rolemodel-ai-leads',

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  tunnelRoute: '/monitoring',
})
