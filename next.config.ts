import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        // Allow embedding in iframes and localhost connections
        source: '/embed/leads-page',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' http://localhost:* https://localhost:* http://127.0.0.1:* https://127.0.0.1:* *",
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
        ],
      },
    ];
  },
};

export default nextConfig;
