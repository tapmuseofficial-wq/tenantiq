import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import { headers } from 'next/headers'
import './globals.css'

// next/font self-hosts Inter from Vercel's CDN — no external network request,
// no render-blocking stylesheet, no flash of unstyled text.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://tenantiq.ca'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: 'TenantIQ — AI Tenant Screening for Landlords',
  description: 'Score rental applicants out of 100, verify income documents automatically, and catch fake pay stubs. Free to try.',
  openGraph: {
    type: 'website',
    url: APP_URL,
    siteName: 'TenantIQ',
    title: 'TenantIQ — AI Tenant Screening for Landlords',
    description: 'Score rental applicants out of 100, verify income documents automatically, and catch fake pay stubs. Free to try.',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'TenantIQ — AI Tenant Screening for Landlords' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TenantIQ — AI Tenant Screening for Landlords',
    description: 'Score rental applicants out of 100, verify income documents automatically, and catch fake pay stubs. Free to try.',
    images: ['/opengraph-image'],
  },
  verification: {
    google: 'HmzMtboNghZP9fLmef8bTi27Pf8Y6NzsP3K295JefmQ',
  },
}

// Async so we can call headers() to read the per-request nonce that
// middleware injects via the x-nonce request header.
export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // middleware.ts generates a fresh nonce on every request and forwards it
  // as a request header so Server Components can stamp it onto <Script> tags.
  // Without this, browsers enforcing the nonce-based CSP would block all
  // inline scripts, including the Google and Reddit tracking pixels.
  const nonce = (await headers()).get('x-nonce') ?? undefined

  return (
    <html lang="en" className={inter.variable} style={{ colorScheme: 'dark' }}>
      <body className="antialiased" style={{ background: '#0A0F1E', color: '#F1F5F9' }}>
        {children}
        <Analytics />
        <SpeedInsights />

        {/* Google Ads loader — nonce satisfies the CSP script-src nonce check */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-18214503686"
          nonce={nonce}
        />
        {/* Inline gtag init — must carry the same nonce as the loader above */}
        <Script strategy="afterInteractive" id="google-tag" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18214503686');
          `}
        </Script>

        {/* Reddit Pixel — dangerouslySetInnerHTML is safe here because the
            content is a static hardcoded string with no user data.
            The nonce allows it under the strict CSP. */}
        <Script
          id="reddit-pixel"
          strategy="afterInteractive"
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html: `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_j49bo24fm64b",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_j49bo24fm64b');rdt('track', 'PageVisit');`,
          }}
        />
      </body>
    </html>
  )
}
