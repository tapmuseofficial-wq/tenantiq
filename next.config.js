/** @type {import('next').NextConfig} */

// Content-Security-Policy is intentionally absent from this file.
//
// The CSP is built dynamically in middleware.ts using a per-request
// cryptographic nonce, replacing the old 'unsafe-inline' approach.
// next.config.js headers are applied *after* middleware and for the same
// header name they win — keeping a static CSP here would silently overwrite
// the nonce-based one on every response.
//
// All other security headers are static and can live here safely.
const securityHeaders = [
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Defence-in-depth clickjacking protection (CSP frame-ancestors is the primary guard)
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Stop leaking full referrer to third parties
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 2 years, include subdomains, submit to preload list
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Disable browser features the app doesn't use
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
]

const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Suppress the X-Powered-By: Next.js response header.
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // @react-pdf/renderer is removed from serverExternalPackages so webpack
  // bundles it directly into the function. Vercel's serverless runtime has
  // trouble resolving ESM packages via dynamic import() at runtime; bundling
  // eliminates that dependency entirely.
  webpack(config, { isServer }) {
    if (isServer) {
      // The package has a "browser" field that redirects react-pdf.js →
      // react-pdf.browser.js. Alias it explicitly to the Node.js build so
      // webpack never picks up the browser variant for server bundles.
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        '@react-pdf/renderer': path.resolve(
          __dirname,
          'node_modules/@react-pdf/renderer/lib/react-pdf.js'
        ),
      }
    }
    return config
  },
}

module.exports = nextConfig
