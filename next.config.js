/** @type {import('next').NextConfig} */

// CSP is assembled as an array so individual directives stay readable and
// are easy to extend.  Note: 'unsafe-inline' in script-src is required by the
// inline Google Ads / Reddit pixel init blocks in app/layout.tsx.  If those
// are ever migrated to external scripts the inline directive can be removed
// and replaced with hashes or a nonce approach.
const ContentSecurityPolicy = [
  "default-src 'self'",
  // Own JS + Next.js chunks + third-party pixel loaders
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://www.redditstatic.com https://vercel.live",
  // Inline Tailwind / component styles
  "style-src 'self' 'unsafe-inline'",
  // Images from Supabase storage + data URIs for PDFs
  "img-src 'self' data: blob: https://*.supabase.co",
  // Self-hosted fonts (Inter via next/font)
  "font-src 'self'",
  // API / fetch targets: Supabase, Stripe, Reddit CAPI, Google Analytics, Vercel telemetry
  [
    "connect-src 'self'",
    'https://*.supabase.co',
    'https://api.stripe.com',
    'https://ads-api.reddit.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://vitals.vercel-insights.com',
    'https://va.vercel-scripts.com',
  ].join(' '),
  // Stripe hosted checkout uses iframes for the payment sheet
  "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  // Prevent this app from being embedded in foreign frames (clickjacking)
  "frame-ancestors 'none'",
  // Forms must submit to this origin or Stripe checkout only
  "form-action 'self' https://checkout.stripe.com",
  // Prevent base-tag injection
  "base-uri 'self'",
  // Block Flash / Java plugins entirely
  "object-src 'none'",
].join('; ')

const securityHeaders = [
  // Prevent MIME-type sniffing attacks
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // Defence-in-depth clickjacking protection alongside CSP frame-ancestors
  { key: 'X-Frame-Options',           value: 'DENY' },
  // Stop leaking full referrer to third parties
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  // Force HTTPS for 2 years, include subdomains, submit to preload list
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Disable browser features the app doesn't use
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Content-Security-Policy',   value: ContentSecurityPolicy },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply to every route, including API endpoints
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
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer'],
  },
}

module.exports = nextConfig
