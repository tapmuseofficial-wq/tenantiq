import type { Metadata } from 'next'
import Link from 'next/link'
import { Sparkles, ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service — TenantIQ',
  description: 'Terms and conditions for using the TenantIQ tenant screening platform.',
}

const EFFECTIVE_DATE = 'June 16, 2025'

export default function TermsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-500 mb-8">Effective date: {EFFECTIVE_DATE}</p>

        {/* Prominent disclaimer banner */}
        <div
          className="rounded-2xl p-5 mb-12"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <p className="text-sm font-semibold text-amber-300 mb-1">Important Disclaimer</p>
          <p className="text-sm text-amber-200/70 leading-relaxed">
            TenantIQ provides AI-assisted screening reports for informational purposes only. Our analysis is not a substitute for professional background checks, credit reporting agency services, or legal advice. Landlords are solely responsible for all tenant selection decisions.
          </p>
        </div>

        <div className="space-y-10 text-slate-300 text-sm leading-relaxed">

          <Section title="1. Acceptance of Terms">
            <p>
              By accessing or using TenantIQ ("Service", "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Service. These Terms apply to all users, including landlords and property managers who register accounts, and tenants who submit applications through landlord-provided links.
            </p>
          </Section>

          <Section title="2. Informational Purpose Only">
            <p className="mb-3">
              <strong className="text-slate-100">TenantIQ screening reports are provided for informational purposes only.</strong> Our AI-generated scores, income verification results, red flags, and recommendations are based solely on the information provided by the applicant and the outputs of our automated AI analysis system. We make no representations or warranties — express or implied — as to the accuracy, completeness, reliability, or fitness for a particular purpose of any screening result.
            </p>
            <p>
              Specifically, and without limitation:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>We do not guarantee the accuracy of income verification results</li>
              <li>We do not verify the identity of applicants</li>
              <li>We do not conduct criminal background checks</li>
              <li>We do not access official credit bureau data</li>
              <li>AI analysis may contain errors, omissions, or misinterpretations</li>
              <li>Screening results may not reflect an applicant's current financial situation</li>
            </ul>
          </Section>

          <Section title="3. Landlord Responsibility">
            <p className="mb-3">
              <strong className="text-slate-100">Landlords are solely and exclusively responsible for all tenant selection decisions.</strong> You agree that:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400">
              <li>You will use TenantIQ reports only as one of many inputs in your tenant evaluation process</li>
              <li>You will comply with all applicable fair housing, human rights, and anti-discrimination laws in your jurisdiction</li>
              <li>You will not use TenantIQ output as the sole basis for refusing an applicant</li>
              <li>You are responsible for conducting any additional due diligence you deem appropriate, including independent reference checks, in-person viewings, and professional credit or background checks</li>
              <li>You will obtain any consents required by applicable law before submitting applicant data to third-party AI systems</li>
            </ul>
          </Section>

          <Section title="4. No Liability for Tenancy Outcomes">
            <p>
              <strong className="text-slate-100">TenantIQ is not liable for outcomes arising from your tenancy decisions.</strong> Without limiting the foregoing, TenantIQ and its owners, officers, employees, and agents expressly disclaim all liability for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Unpaid rent, rental arrears, or rent default by any tenant</li>
              <li>Property damage caused by any tenant or their guests</li>
              <li>Costs or losses associated with eviction proceedings</li>
              <li>Legal fees, court costs, or tribunal costs</li>
              <li>Loss of rental income or loss of use of your property</li>
              <li>Any harm arising from a tenant you selected, regardless of their TenantIQ screening score</li>
              <li>Any harm arising from a tenant you rejected on the basis of a TenantIQ report</li>
            </ul>
            <p className="mt-4">
              A high screening score does not guarantee a good tenant. A low screening score does not mean an applicant will be a bad tenant. Use your own judgment.
            </p>
          </Section>

          <Section title="5. AI Analysis Is Not Professional Advice">
            <p>
              Our AI-generated reports are not a substitute for, and should not be relied upon as:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Professional background check services from a licensed consumer reporting agency</li>
              <li>Legal advice from a qualified solicitor, barrister, or notary</li>
              <li>Financial advice regarding creditworthiness</li>
              <li>Any form of insurance or guarantee of tenancy performance</li>
            </ul>
            <p className="mt-4">
              We strongly recommend that landlords consult qualified professionals and use certified background check services where required by law or where significant financial risk is involved.
            </p>
          </Section>

          <Section title="6. Limitation of Liability">
            <p>
              To the maximum extent permitted by applicable law, TenantIQ's total liability to you for any claim arising out of or relating to these Terms or the Service — whether in contract, tort, negligence, or otherwise — shall not exceed the <strong className="text-slate-200">total amount you paid to TenantIQ in the twelve (12) months immediately preceding the claim</strong>. If you are on the free plan and have made no payments, TenantIQ's liability is limited to CAD $0.
            </p>
            <p className="mt-3">
              In no event shall TenantIQ be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or other intangible losses.
            </p>
          </Section>

          <Section title="7. Acceptable Use">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 mt-3">
              <li>Use the Service to discriminate against applicants in violation of applicable human rights or fair housing legislation</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Attempt to reverse-engineer, scrape, or abuse the platform or its AI systems</li>
              <li>Share or resell screening reports to third parties without applicant consent</li>
              <li>Use the Service for any purpose other than residential tenant screening</li>
            </ul>
          </Section>

          <Section title="8. Payments and Refunds">
            <p>
              The Basic plan is a one-time payment of $9 CAD for 10 screening credits. Credits are non-refundable once used. Unused credits do not expire. We reserve the right to change pricing with 30 days' notice to registered users.
            </p>
          </Section>

          <Section title="9. Termination">
            <p>
              We may suspend or terminate your account at any time for breach of these Terms, misuse of the platform, or at our sole discretion with reasonable notice. You may close your account at any time by contacting us.
            </p>
          </Section>

          <Section title="10. Governing Law and Dispute Resolution">
            <p>
              These Terms are governed by and construed in accordance with the laws of the <strong className="text-slate-200">Province of Quebec, Canada</strong>, without regard to conflict-of-law principles. Any dispute arising out of or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Quebec, Canada. If you are a consumer, nothing in this clause limits your rights under applicable consumer protection legislation.
            </p>
          </Section>

          <Section title="11. Changes to These Terms">
            <p>
              We may update these Terms at any time. Material changes will be communicated via email to registered users at least 14 days before taking effect. Continued use of the Service after the effective date constitutes acceptance of the updated Terms.
            </p>
          </Section>

          <Section title="12. Contact">
            <p>
              Questions about these Terms should be directed to:{' '}
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
