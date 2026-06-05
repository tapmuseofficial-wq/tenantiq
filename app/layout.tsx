import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
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
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-18214503686" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'AW-18214503686');
            `,
          }}
        />
      </head>
      <body className="antialiased" style={{ background: '#0A0F1E', color: '#F1F5F9' }}>
        {children}
      </body>
    </html>
  )
}
