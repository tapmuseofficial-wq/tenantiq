import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — TenantIQ',
  description: 'How TenantIQ collects, uses, and protects your data.',
}

const EFFECTIVE_DATE = 'June 16, 2025'

export default function PrivacyPage() {
  return (
    <div style={{ background: '#0A0F1E', minHeight: '100vh', color: '#F1F5F9' }}>
      {/* Nav */}
      <nav
        className="sticky top-0 z-50 px-5 sm:px-8 py-4 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(10,15,30,0.9)', backdropFilter: 'blur(20px)' }}
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-100 text-sm">TenantIQ</span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-12">Effective date: {EFFECTIVE_DATE}</p>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">

          <Section title="1. Overview">
            <p>
              TenantIQ ("we", "us", or "our") operates the tenant screening platform available at this website. This Privacy Policy explains what personal information we collect, how we use it, and your rights regarding that information. By using TenantIQ, you agree to the practices described here.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="mb-3"><strong className="text-slate-200">From landlords (registered users):</strong></p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 mb-5">
              <li>Name, email address, and company name provided at signup</li>
              <li>Payment information processed by Stripe (we do not store card numbers)</li>
              <li>Property details you create on the platform</li>
              <li>Usage data and session logs</li>
            </ul>
            <p className="mb-3"><strong className="text-slate-200">From tenants (applicants):</strong></p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400">
              <li>Full name, email, and phone number</li>
              <li>Employment and income information</li>
              <li>Income documents (pay stubs, bank statements, offer letters) uploaded voluntarily</li>
              <li>Rental history disclosures (evictions, late payments)</li>
              <li>Pet ownership information</li>
              <li>References provided in the application</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>To generate AI-powered tenant screening reports for landlords</li>
              <li>To verify and analyse income documents using our AI system</li>
              <li>To process payments via Stripe</li>
              <li>To send transactional emails (new application notifications)</li>
              <li>To improve platform reliability and performance</li>
              <li>To comply with applicable laws</li>
            </ul>
            <p className="mt-4">
              We do not sell, rent, or share your personal information with third parties for marketing purposes.
            </p>
          </Section>

          <Section title="4. Data Storage and Security">
            <p>
              Data is stored in Supabase (hosted on AWS infrastructure) with encryption at rest and in transit. Income documents are stored in encrypted object storage and are accessible only to the landlord who received the application. We implement reasonable technical and organisational measures to protect your data, but no transmission over the internet is 100% secure.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              Landlord accounts and associated data are retained for the duration of your account and for up to 12 months after account deletion. Tenant application data is retained for up to 24 months after submission to allow landlords to refer back to applications, after which it is deleted. You may request earlier deletion by contacting us.
            </p>
          </Section>

          <Section title="6. Third-Party Services">
            <p>We use the following third-party services, each governed by their own privacy policies:</p>
            <ul className="list-disc list-inside space-y-1.5 text-slate-400 mt-3">
              <li><strong className="text-slate-300">Stripe</strong> — payment processing</li>
              <li><strong className="text-slate-300">Supabase</strong> — database and file storage</li>
              <li><strong className="text-slate-300">Anthropic</strong> — AI analysis of application data</li>
              <li><strong className="text-slate-300">Resend</strong> — transactional email delivery</li>
              <li><strong className="text-slate-300">Vercel</strong> — hosting and analytics</li>
            </ul>
          </Section>

          <Section title="7. Your Rights">
            <p>
              You may request access to, correction of, or deletion of your personal information at any time by emailing us. For tenant applicants, your landlord is the primary data controller for your application data; please contact them directly or contact us to be removed.
            </p>
          </Section>

          <Section title="8. Children">
            <p>
              TenantIQ is not directed at children under 18. We do not knowingly collect personal information from minors.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify registered users of material changes via email. Continued use of TenantIQ after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about this Privacy Policy should be directed to:{' '}
              <a href="mailto:support@tenantiq.ca" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@tenantiq.ca
              </a>
            </p>
          </Section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-base font-bold text-slate-100 mb-3">{title}</h2>
      {children}
    </section>
  )
}

function Footer() {
  return (
    <footer
      className="py-8 mt-10"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-3xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} TenantIQ. All rights reserved.</p>
        <div className="flex items-center gap-5 text-xs text-slate-500">
          <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  )
}
