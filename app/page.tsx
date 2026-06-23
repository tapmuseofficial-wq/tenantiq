'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  FileSearch,
  BarChart3,
  Users,
  CheckCircle,
  Sparkles,
  Star,
  Lock,
  X,
  Database,
  ThumbsUp,
  ChevronDown,
} from 'lucide-react'
import { LiveStatBar } from '@/components/landing/stat-counter'
import { CheckoutButton } from '@/components/ui/checkout-button'

const FAQ_ITEMS = [
  {
    q: 'How does income verification work?',
    a: 'The tenant uploads their pay stub or bank statement. Our AI reads the document and compares the income to what they self-reported. If there is a discrepancy we flag it immediately.',
  },
  {
    q: 'What is the community database?',
    a: 'Landlords who use TenantIQ can rate tenants after their tenancy ends. Every new application is automatically checked against these reviews — matched by email, phone number, and name plus city. It gets more powerful as more landlords join.',
  },
  {
    q: 'Do tenants need to create an account?',
    a: 'No. You send them a link, they fill out a form. That is it. No app download, no account creation.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted at rest and in transit. We do not sell or share your data with third parties.',
  },
  {
    q: 'What if I only have one rental unit?',
    a: 'Perfect. TenantIQ is built for landlords with 1 to 100 units. Start free with 3 screenings and only pay when you need more.',
  },
]

function FAQSection() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="space-y-3">
      {FAQ_ITEMS.map((item, i) => (
        <div
          key={i}
          className="rounded-2xl"
          style={{
            background: 'rgba(15,22,41,0.8)',
            border: `1px solid ${open === i ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
          }}
        >
          <button
            type="button"
            className="w-full flex items-center justify-between px-6 py-5 text-left gap-4 cursor-pointer"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="font-semibold text-slate-100 text-sm sm:text-base">{item.q}</span>
            <ChevronDown
              className="w-5 h-5 text-slate-400 flex-shrink-0"
              style={{ transform: open === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm text-slate-400 leading-relaxed">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: '#0A0F1E' }}>

      {/* ── Navbar ── */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 14px rgba(59,130,246,0.4)',
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-100 tracking-tight">TenantIQ</span>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div
          className="absolute -top-60 -left-60 w-[800px] h-[800px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.09) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-0 -right-60 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left: Text */}
            <div className="text-center lg:text-left">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6"
                style={{
                  background: 'rgba(16,185,129,0.1)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#34D399',
                }}
              >
                <Sparkles className="w-3.5 h-3.5 flex-shrink-0" />
                AI-Powered Tenant Screening
              </div>

              <h1 className="text-[38px] leading-[1.05] sm:text-[56px] lg:text-[62px] font-extrabold text-slate-100 mb-5 text-balance">
                Know Exactly{' '}
                <span className="gradient-text">Who&rsquo;s Moving In</span>{' '}
                Before They Sign
              </h1>

              <p className="text-[17px] leading-relaxed sm:text-lg text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
                AI-powered tenant screening that scores applicants out of 100, verifies their income automatically,
                and cross-checks our growing database of landlord reviews — in under 2 minutes.
              </p>

              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
                <Link
                  href="/signup"
                  className="flex w-full sm:w-auto items-center justify-center gap-2.5 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                    boxShadow: '0 0 36px rgba(59,130,246,0.45), 0 4px 20px rgba(0,0,0,0.3)',
                    minHeight: '56px',
                  }}
                >
                  Start Screening Free →
                </Link>
              </div>
              <p className="flex items-center justify-center lg:justify-start gap-1.5 text-sm text-slate-500 mt-3">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                3 free screenings · No credit card needed · Setup in 2 minutes
              </p>
            </div>

            {/* Right: Product Mockup */}
            <div className="relative">
              <div
                className="absolute inset-0 rounded-3xl blur-3xl opacity-25 pointer-events-none"
                style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.6), rgba(139,92,246,0.5))' }}
              />
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  background: 'rgba(8,14,30,0.97)',
                  border: '1px solid rgba(59,130,246,0.2)',
                  boxShadow: '0 0 100px rgba(59,130,246,0.1), 0 40px 80px rgba(0,0,0,0.6)',
                }}
              >
                <div
                  className="px-5 py-3 flex items-center gap-2"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15,22,41,0.6)' }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#EF4444' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#F59E0B' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#10B981' }} />
                  <span className="text-[11px] text-slate-600 ml-2 font-medium">TenantIQ — Applicant Report</span>
                </div>

                <div className="p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Applicant</p>
                      <p className="font-bold text-slate-100 text-base">Michael Chen</p>
                      <p className="text-xs text-slate-500 mt-0.5">2BR · 123 Maple St, Toronto</p>
                    </div>
                    <div className="relative w-[68px] h-[68px] flex-shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                        <circle cx="34" cy="34" r="27" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle
                          cx="34" cy="34" r="27" fill="none"
                          stroke="url(#sg1)" strokeWidth="6"
                          strokeDasharray={`${(82 / 100) * 169.6} 169.6`}
                          strokeLinecap="round"
                        />
                        <defs>
                          <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#8B5CF6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-[18px] font-extrabold text-slate-100 leading-none">82</span>
                        <span className="text-[9px] text-slate-500 leading-none mt-0.5">/100</span>
                      </div>
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4"
                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-emerald-400">Recommended: Approve</span>
                  </div>

                  <div className="space-y-0">
                    <div
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-center gap-2">
                        <FileSearch className="w-3.5 h-3.5 text-blue-400" />
                        <span className="text-xs text-slate-400">Monthly Income</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200">$6,200</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                          style={{ background: 'rgba(16,185,129,0.15)', color: '#34D399' }}
                        >
                          ✓ Verified
                        </span>
                      </div>
                    </div>
                    <div
                      className="flex items-center justify-between py-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                    >
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                        <span className="text-xs text-slate-400">Rent-to-Income</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">28% — Excellent</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-3.5 h-3.5 text-purple-400" />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Community History</span>
                      <span
                        className="ml-auto text-[10px] px-2 py-0.5 rounded-full font-semibold"
                        style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA' }}
                      >
                        1 Match
                      </span>
                    </div>
                    <div
                      className="p-3 rounded-xl"
                      style={{ background: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.15)' }}
                    >
                      <div className="flex items-center gap-0.5 mb-1.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                        <span className="text-[10px] text-slate-600 ml-1.5">Vancouver, BC</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        &ldquo;Great tenant. Always paid on time, left unit spotless.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="absolute -top-3 -right-2 sm:-right-4 px-3 py-1.5 rounded-xl text-xs font-bold text-white whitespace-nowrap"
                style={{
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  boxShadow: '0 4px 20px rgba(16,185,129,0.45)',
                }}
              >
                ✓ Income Verified
              </div>
              <div
                className="absolute -bottom-3 -left-2 sm:-left-4 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap"
                style={{
                  background: 'rgba(8,14,30,0.95)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  color: '#93C5FD',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                ⚡ Report ready in 90 sec
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Bar ── */}
      <section className="py-6 sm:py-10">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <p className="text-center text-xs font-bold text-slate-600 uppercase tracking-[0.2em] mb-6">
            Trusted by landlords across Canada &amp; USA
          </p>
          <LiveStatBar />
        </div>
      </section>

      {/* ── Problem / Solution ── */}
      <section className="py-16 sm:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.03) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Why TenantIQ</p>
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100">
              There&rsquo;s a better way to screen tenants
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            <div
              className="rounded-2xl p-7 sm:p-9"
              style={{
                background: 'rgba(239,68,68,0.04)',
                border: '1px solid rgba(239,68,68,0.14)',
              }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="font-bold text-slate-200 text-lg">The Old Way</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Chase pay stubs manually',
                  'Google tenants yourself',
                  'Ask friends in Facebook groups',
                  'Gut feeling decisions',
                  'Get burned by bad tenants',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-400">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.12)' }}
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="rounded-2xl p-7 sm:p-9"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.06) 100%)',
                border: '1px solid rgba(59,130,246,0.2)',
              }}
            >
              <div className="flex items-center gap-3 mb-7">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-slate-100 text-lg">The TenantIQ Way</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Income verified automatically from documents',
                  'AI scores every applicant out of 100',
                  'Database of landlord reviews checked instantly',
                  'Clear Approve / Review / Decline recommendation',
                  'Protected by the community',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(16,185,129,0.15)' }}
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-16 sm:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Features</p>
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100 mb-3">
              Everything you need to screen smarter
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
              Stop relying on gut feelings. Get AI-backed data on every applicant.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5 sm:gap-6">
            {[
              {
                icon: BarChart3,
                title: 'AI Score Out of 100',
                desc: 'Every applicant gets a detailed score based on income ratio, employment stability, rental history and references. Approve with confidence.',
                gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                featured: false,
              },
              {
                icon: FileSearch,
                title: 'Automatic Income Verification',
                desc: "Tenant uploads their pay stub — our AI reads it and flags instantly if the numbers don't match what they claimed. Catches fakes automatically.",
                gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                featured: false,
              },
              {
                icon: Database,
                title: 'Community Landlord Database',
                desc: 'Every application is cross-checked against our database of landlord reviews across Canada and the USA. Matched by email, phone, and name — not just names alone. The more landlords who join, the more powerful it gets.',
                gradient: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                featured: true,
              },
              {
                icon: ThumbsUp,
                title: 'Clear Recommendation',
                desc: 'Stop guessing. Get a clear Approve, Review Further, or Decline recommendation with the reasons why — so you can make a fast, confident decision.',
                gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
                featured: false,
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-7 sm:p-8 relative"
                style={{
                  background: f.featured
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.08) 100%)'
                    : 'rgba(15,22,41,0.8)',
                  border: f.featured
                    ? '1px solid rgba(99,102,241,0.3)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: f.featured ? '0 0 40px rgba(99,102,241,0.08)' : 'none',
                }}
              >
                {f.featured && (
                  <div
                    className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
                  >
                    Key Differentiator
                  </div>
                )}
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: f.gradient }}
                >
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-slate-100 text-lg mb-3">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-16 sm:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.04) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">How It Works</p>
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100 mb-3">
              Three steps. Under two minutes.
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 sm:gap-10 relative">
            <div
              className="hidden sm:block absolute top-10 left-[calc(33%+20px)] right-[calc(33%+20px)] h-px pointer-events-none"
              style={{ background: 'linear-gradient(90deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))' }}
            />
            {[
              {
                num: '1',
                title: 'Create a screening link',
                desc: 'Takes 30 seconds. Add your property details and get a unique link.',
                color: '#3B82F6',
                bg: 'rgba(59,130,246,0.1)',
                border: 'rgba(59,130,246,0.25)',
              },
              {
                num: '2',
                title: 'Send it to your applicant',
                desc: 'They fill out a 5-minute form on any device. No account needed.',
                color: '#8B5CF6',
                bg: 'rgba(139,92,246,0.1)',
                border: 'rgba(139,92,246,0.25)',
              },
              {
                num: '3',
                title: 'Get your AI report',
                desc: 'Full score, income verification, community check and recommendation in under 2 minutes.',
                color: '#10B981',
                bg: 'rgba(16,185,129,0.1)',
                border: 'rgba(16,185,129,0.25)',
              },
            ].map((step) => (
              <div key={step.num} className="flex flex-col items-center text-center">
                <div
                  className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center text-2xl font-extrabold mb-5 flex-shrink-0"
                  style={{ background: step.bg, color: step.color, border: `1px solid ${step.border}` }}
                >
                  {step.num}
                </div>
                <h3 className="font-bold text-slate-100 text-base sm:text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">What Landlords Say</p>
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100">
              Real landlords. Real results.
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                quote: "Caught a tenant who claimed $5,500/mo but their pay stub showed way less. Would never have found that manually.",
                author: "David K.",
                role: "Landlord, Toronto",
              },
              {
                quote: "I used to spend hours Googling applicants and posting in Facebook groups. Now I just send a link and get a full report in 2 minutes.",
                author: "Sarah M.",
                role: "Property Manager, Vancouver",
              },
              {
                quote: "The community database flagged an applicant who had been reported by another landlord for property damage. Saved me a huge headache.",
                author: "James R.",
                role: "Landlord, Calgary",
              },
            ].map((t) => (
              <div
                key={t.author}
                className="rounded-2xl p-6 sm:p-7"
                style={{
                  background: 'rgba(15,22,41,0.7)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-slate-300 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-slate-200 text-sm">{t.author}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-16 sm:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.05) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Pricing</p>
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100 mb-3">
              Simple, transparent pricing
            </h2>
            <p className="text-slate-400 text-sm sm:text-base">Start free. Scale as you grow. No subscriptions.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            <div
              className="rounded-2xl p-7 sm:p-8"
              style={{ background: 'rgba(15,22,41,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Free</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-slate-100">$0</span>
              </div>
              <p className="text-sm text-emerald-400 mb-7 font-medium">No credit card required</p>
              <ul className="space-y-3.5 mb-8">
                {[
                  '3 free screenings',
                  'AI score out of 100',
                  'Income verification',
                  'Community database check',
                  'PDF report',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="flex items-center justify-center font-semibold px-6 rounded-xl text-sm transition-all duration-200 hover:bg-white/10"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                  minHeight: '52px',
                }}
              >
                Start Free →
              </Link>
            </div>

            <div
              className="rounded-2xl p-7 sm:p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 0 60px rgba(59,130,246,0.1)',
              }}
            >
              <div
                className="absolute top-5 right-5 px-2.5 py-1 rounded-full text-xs font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)' }}
              >
                Most Popular
              </div>
              <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-4">Plus</p>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-5xl font-extrabold text-slate-100">$9</span>
                <span className="text-slate-400 text-sm">one-time</span>
              </div>
              <p className="text-sm text-slate-400 mb-7">10 credits · never expire</p>
              <ul className="space-y-3.5 mb-8">
                {[
                  '10 screening credits',
                  'Everything in Free',
                  'Priority AI analysis',
                  'Credits never expire',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                redirectIfLoggedOut="/signup"
                className="w-full flex items-center justify-center font-bold px-6 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                  minHeight: '52px',
                }}
              >
                Get 10 Credits →
              </CheckoutButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">FAQ</p>
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100">
              Questions? We&rsquo;ve got answers.
            </h2>
          </div>
          <FAQSection />
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-16 sm:py-24 px-5">
        <div
          className="max-w-2xl mx-auto py-14 sm:py-20 px-8 sm:px-14 rounded-3xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            boxShadow: '0 0 80px rgba(59,130,246,0.08)',
          }}
        >
          <div
            className="absolute -top-24 -right-24 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
          />
          <div
            className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)' }}
          />
          <div className="relative">
            <h2 className="text-[28px] leading-tight sm:text-4xl font-bold text-slate-100 mb-4">
              Stop Guessing. Start Screening Smarter.
            </h2>
            <p className="text-slate-400 mb-8 text-sm sm:text-base max-w-md mx-auto">
              Join landlords across Canada and the USA who use TenantIQ to protect their properties.
            </p>
            <div className="flex flex-col items-center gap-3">
              <Link
                href="/signup"
                className="flex w-full sm:w-auto items-center justify-center gap-2.5 font-bold px-10 rounded-2xl text-white text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 36px rgba(59,130,246,0.4)',
                  minHeight: '56px',
                }}
              >
                Start Screening Free →
              </Link>
              <p className="flex items-center gap-1.5 text-sm text-slate-500">
                <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                No credit card required
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-300 text-sm">TenantIQ</span>
            </div>
            <span className="hidden sm:block text-slate-700">·</span>
            <span className="text-xs text-slate-600">AI-powered tenant screening for landlords</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <span className="text-slate-700">·</span>
            <span>© 2025 TenantIQ. All rights reserved.</span>
          </div>
        </div>
      </footer>

    </div>
  )
}
