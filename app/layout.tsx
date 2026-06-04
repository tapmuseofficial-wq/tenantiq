import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TenantIQ — AI-Powered Tenant Screening',
  description: 'Screen tenants faster and smarter with AI income verification and smart scoring.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: 'dark' }}>
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
