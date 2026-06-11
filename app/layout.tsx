import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import Script from 'next/script'
import './globals.css'

// next/font self-hosts Inter from Vercel's CDN — no external network request,
// no render-blocking stylesheet, no flash of unstyled text.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'TenantIQ — AI-Powered Tenant Screening',
  description: 'Screen tenants faster and smarter with AI income verification and smart scoring.',
  verification: {
    google: 'HmzMtboNghZP9fLmef8bTi27Pf8Y6NzsP3K295JefmQ',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} style={{ colorScheme: 'dark' }}>
      <body className="antialiased" style={{ background: '#0A0F1E', color: '#F1F5F9' }}>
        {children}
        <Analytics />
        <SpeedInsights />

        {/* Google Ads — afterInteractive keeps these off the critical path */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=AW-18214503686"
        />
        <Script strategy="afterInteractive" id="google-tag">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-18214503686');
          `}
        </Script>

        {/* Reddit Pixel */}
        <Script
          id="reddit-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(w,d){if(!w.rdt){var p=w.rdt=function(){p.sendEvent?p.sendEvent.apply(p,arguments):p.callQueue.push(arguments)};p.callQueue=[];var t=d.createElement("script");t.src="https://www.redditstatic.com/ads/pixel.js?pixel_id=a2_j49bo24fm64b",t.async=!0;var s=d.getElementsByTagName("script")[0];s.parentNode.insertBefore(t,s)}}(window,document);rdt('init','a2_j49bo24fm64b');rdt('track', 'PageVisit');`,
          }}
        />
      </body>
    </html>
  )
}
