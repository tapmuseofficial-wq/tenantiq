import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy — TenantIQ',
  description: 'How TenantIQ collects, uses, and protects your data.',
}

const EFFECTIVE_DATE = 'June 17, 2026'

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
        <p className="text-sm text-slate-500 mb-10">Effective date: {EFFECTIVE_DATE}</p>

        {/* Prominent commitment box */}
        <div
          className="rounded-2xl p-6 mb-12"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(139,92,246,0.08) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}
            >
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-bold text-slate-100 mb-2">Our commitment to you</p>
              <p className="text-slate-300 text-sm leading-relaxed">
                We do not sell, share, or use your personal information for any purpose other than providing the screening report to your landlord. We do not use your data to train AI models. Your information is never shared with third parties for marketing or advertising purposes.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-12 text-slate-300 text-sm leading-relaxed">

          <Section title="1. Who We Are">
            <p>
              TenantIQ is a tenant screening platform that helps landlords make informed rental decisions. This Privacy Policy explains what personal information we collect, how it is used, and the rights you have over your data. By using TenantIQ — whether as a landlord or as a tenant completing an application — you agree to the practices described here.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p className="mb-4 text-slate-400">We collect only the information needed to provide our service.</p>

            <p className="font-semibold text-slate-200 mb-3">From landlords (registered users):</p>
            <ul className="space-y-2 text-slate-400 mb-6">
              <Item>Name and email address provided at sign-up</Item>
              <Item>Payment information, processed securely — we do not store card numbers</Item>
              <Item>Property details you create on the platform</Item>
            </ul>

            <p className="font-semibold text-slate-200 mb-3">From tenants (applicants):</p>
            <ul className="space-y-2 text-slate-400">
              <Item>Full name, email address, and phone number</Item>
              <Item>Employment and income information</Item>
              <Item>Income documents uploaded voluntarily (such as pay stubs or bank statements)</Item>
              <Item>Rental history disclosures, including evictions or late payments</Item>
              <Item>Pet ownership information</Item>
              <Item>Personal references provided in the application</Item>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p className="mb-4">
              We use the information we collect solely to operate and improve our tenant screening service:
            </p>
            <ul className="space-y-2 text-slate-400 mb-4">
              <Item>To generate tenant screening reports for the landlord you applied with</Item>
              <Item>To analyse income documents as part of the screening process</Item>
              <Item>To process payments securely</Item>
              <Item>To send relevant notifications, such as alerting a landlord when a new application is received</Item>
              <Item>To maintain the security and reliability of our platform</Item>
              <Item>To comply with applicable laws</Item>
            </ul>
            <p className="text-slate-400">
              We do not use your information to build advertising profiles, sell data to brokers, or contact you for marketing purposes.
            </p>
          </Section>

          <Section title="4. AI Analysis">
            <p className="mb-3">
              TenantIQ uses AI to analyse application information and generate screening reports. This analysis is performed solely to produce the report delivered to your landlord.
            </p>
            <p className="text-slate-400">
              Your personal data and documents are never used to train AI models — by us or by any AI provider we work with. The analysis is performed on your data, not from it.
            </p>
          </Section>

          <Section title="5. Data Storage and Security">
            <p className="mb-3">
              Your data is stored on secure, encrypted servers with encryption at rest and in transit. Uploaded documents are accessible only to the landlord who received the application — not to other landlords, other tenants, or the general public.
            </p>
            <p className="text-slate-400">
              We implement industry-standard technical and organisational measures to protect your data, including access controls, encrypted storage, and secure communications. While no system is completely immune to risk, we take your security seriously and review our safeguards regularly.
            </p>
          </Section>

          <Section title="6. Data Retention and Deletion">
            <p className="mb-3">
              We do not permanently store tenant application data beyond what is needed to generate your screening report. Landlord accounts and their associated data are retained for the duration of the account.
            </p>
            <p className="text-slate-400">
              You may request deletion of your data at any time by contacting us at{' '}
              <a href="mailto:support@tenants-iq.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@tenants-iq.com
              </a>
              . We will process your request promptly and confirm once your data has been removed.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p className="mb-3">
              You have the right to know what personal information we hold about you, to correct inaccuracies, and to request that we delete your data. You also have the right to withdraw any consent you have given at any time.
            </p>
            <p className="text-slate-400">
              To exercise any of these rights, contact us at{' '}
              <a href="mailto:support@tenants-iq.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@tenants-iq.com
              </a>
              . We will respond within a reasonable timeframe and at no cost to you.
            </p>
          </Section>

          <Section title="8. Children">
            <p>
              TenantIQ is not directed at anyone under the age of 18. We do not knowingly collect personal information from minors. If you believe a minor has submitted information through our platform, please contact us and we will remove it promptly.
            </p>
          </Section>

          <Section title="9. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. When we do, we will update the effective date at the top of this page and, for material changes, notify registered users by email. Continued use of TenantIQ after changes constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="10. Governing Law">
            <p>
              This Privacy Policy is governed by the laws of the Province of Quebec, Canada. Any disputes arising under this policy are subject to the exclusive jurisdiction of the courts of Quebec.
            </p>
          </Section>

          <Section title="11. Contact Us">
            <p className="mb-3">
              If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, we would like to hear from you.
            </p>
            <div
              className="rounded-xl p-4 mt-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-slate-200 font-medium mb-1">TenantIQ Support</p>
              <a href="mailto:support@tenants-iq.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                support@tenants-iq.com
              </a>
            </div>
          </Section>

        </div>
      </main>

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
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2
        className="text-base font-bold text-slate-100 mb-4 pb-3"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {title}
      </h2>
      {children}
    </section>
  )
}

function Item({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(59,130,246,0.5)' }} />
      <span>{children}</span>
    </li>
  )
}
