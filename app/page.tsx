import Link from 'next/link'
import {
  FileSearch,
  ShieldCheck,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Star,
  Lock,
  Link2,
  ClipboardList,
  Brain,
} from 'lucide-react'
import { CheckoutButton } from '@/components/ui/checkout-button'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 16px rgba(59,130,246,0.4)',
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-slate-100 tracking-tight">TenantIQ</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white px-4 py-2 rounded-xl transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 16px rgba(59,130,246,0.3)',
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.13) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center">

          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-8"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#60A5FA',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-powered screening for Canadian &amp; US landlords
          </div>

          {/* Headline — clear value prop in under 3 seconds */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-100 leading-[1.05] text-balance mb-6">
            Screen tenants in minutes,
            <br />
            <span className="gradient-text">not days.</span>
          </h1>

          {/* Sub — what, how, and outcome in one sentence */}
          <p className="text-lg sm:text-xl text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Share a link → your applicant fills a 5-minute form → TenantIQ gives you
            AI-verified income, a 0–100 score, and a clear approve/decline recommendation.
          </p>

          {/* Primary CTA — large, full-width on mobile */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 animate-pulse-glow"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 40px rgba(59,130,246,0.45), 0 4px 24px rgba(0,0,0,0.35)',
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            {/* Trust line */}
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              No credit card required · Free forever for 3 screenings
            </p>
          </div>

          {/* Social proof stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 mt-14 pt-14"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { value: '1,200+', label: 'Landlords', color: '#60A5FA' },
              { value: '8,500+', label: 'Screenings done', color: '#A78BFA' },
              { value: '< 2 min', label: 'Per applicant', color: '#34D399' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold mb-1" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Simple Steps ───────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-4xl mx-auto px-5 sm:px-8">

          {/* Section label */}
          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-10">
            How it works
          </p>

          {/* Steps flow */}
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Link2,
                step: '1',
                title: 'Share your link',
                desc: 'Create a property in 30 seconds. We generate a unique screening link — send it by text or email.',
                color: '#3B82F6',
                glow: 'rgba(59,130,246,0.25)',
                bg: 'rgba(59,130,246,0.1)',
              },
              {
                icon: ClipboardList,
                step: '2',
                title: 'Tenant fills the form',
                desc: 'Applicants complete a 5-minute form on any device and optionally upload a pay stub or bank statement.',
                color: '#8B5CF6',
                glow: 'rgba(139,92,246,0.25)',
                bg: 'rgba(139,92,246,0.1)',
              },
              {
                icon: Brain,
                step: '3',
                title: 'Get your AI report',
                desc: 'TenantIQ returns a 0–100 score, verified income, red flags, and an approve/decline recommendation.',
                color: '#10B981',
                glow: 'rgba(16,185,129,0.25)',
                bg: 'rgba(16,185,129,0.1)',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {/* Connector arrow — desktop only */}
                {i < 2 && (
                  <div className="hidden sm:flex absolute top-8 right-0 translate-x-1/2 z-10 items-center justify-center">
                    <ArrowRight className="w-5 h-5 text-slate-700" />
                  </div>
                )}

                <div
                  className="rounded-2xl p-6 h-full"
                  style={{
                    background: 'rgba(15,22,41,0.8)',
                    border: `1px solid ${item.color}25`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: item.bg, boxShadow: `0 0 20px ${item.glow}` }}
                  >
                    <item.icon className="w-7 h-7" style={{ color: item.color }} />
                  </div>

                  {/* Step number + title */}
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: item.bg, color: item.color }}
                    >
                      Step {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-100 text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mini CTA under steps */}
          <div className="text-center mt-10">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold text-sm transition-colors"
            >
              Try it free — no account needed to explore
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Features</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mb-3">
              Everything you need to screen smarter
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Stop relying on gut feelings. Get AI-backed data on every applicant in minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: FileSearch,
                title: 'AI Income Verification',
                desc: 'Reads pay stubs and bank statements — flags discrepancies automatically.',
                gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                glow: 'rgba(59,130,246,0.15)',
              },
              {
                icon: BarChart3,
                title: 'Smart Scoring',
                desc: 'Every applicant gets a 0–100 score based on income, employment, rental history, and more.',
                gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                glow: 'rgba(139,92,246,0.15)',
              },
              {
                icon: Users,
                title: 'Side-by-Side Compare',
                desc: 'Compare up to 4 applicants in a single table to make the right call, fast.',
                gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
                glow: 'rgba(16,185,129,0.15)',
              },
              {
                icon: ShieldCheck,
                title: 'Instant PDF Reports',
                desc: 'Download a professional screening report for each applicant — perfect for your records.',
                gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
                glow: 'rgba(245,158,11,0.15)',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(15,22,41,0.7)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                  style={{ background: feature.gradient, boxShadow: `0 0 20px ${feature.glow}` }}
                >
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2 text-sm">{feature.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="py-16 sm:py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.06) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mb-3">Simple, transparent pricing</h2>
            <p className="text-slate-400">Start free. Upgrade only if you need more.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Free */}
            <div
              className="rounded-2xl p-7"
              style={{
                background: 'rgba(15,22,41,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Free</p>
                <div>
                  <span className="text-5xl font-extrabold text-slate-100">$0</span>
                  <span className="text-slate-500 ml-2 text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-1.5">No credit card required</p>
              </div>
              <ul className="space-y-2.5 mb-7">
                {['3 tenant screenings', 'AI income verification', 'Smart scoring', 'PDF reports'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center font-semibold px-6 py-3.5 rounded-xl transition-all duration-200 text-sm hover:bg-white/[0.1]"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                }}
              >
                Start for free
              </Link>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-7 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              <div
                className="absolute top-4 right-4 px-2.5 py-1 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white' }}
              >
                MOST POPULAR
              </div>
              <div className="mb-6">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2">Pro</p>
                <div>
                  <span className="text-5xl font-extrabold text-slate-100">$19</span>
                  <span className="text-slate-400 ml-2 text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-400 mt-1.5">For active landlords</p>
              </div>
              <ul className="space-y-2.5 mb-7">
                {[
                  'Unlimited screenings',
                  'AI income verification',
                  'Smart scoring (0–100)',
                  'Side-by-side comparison',
                  'PDF reports',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <CheckCircle className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <CheckoutButton
                redirectIfLoggedOut="/signup"
                className="w-full block text-center font-bold px-6 py-3.5 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90 disabled:opacity-60"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4)',
                }}
              >
                Start with Pro
              </CheckoutButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-10">
            What landlords say
          </p>
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                quote: "TenantIQ cut our screening time from 3 days to 20 minutes. The AI income verification is a game changer.",
                author: "Sarah K.",
                role: "Property Manager, Toronto",
              },
              {
                quote: "I used to just trust my gut. Now I have actual data. Found a great tenant on the first try.",
                author: "Marcus T.",
                role: "Landlord, Vancouver",
              },
              {
                quote: "The side-by-side comparison saved me from a bad decision. The score breakdown told me exactly why.",
                author: "Jennifer L.",
                role: "Investor, New York",
              },
            ].map((t) => (
              <div
                key={t.author}
                className="rounded-2xl p-6"
                style={{
                  background: 'rgba(15,22,41,0.6)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-5">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold text-slate-200">{t.author}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────────── */}
      <section className="py-16 sm:py-24 px-5">
        <div
          className="max-w-2xl mx-auto py-14 sm:py-16 px-6 rounded-3xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
          />
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mb-3 relative">
            Find your perfect tenant today
          </h2>
          <p className="text-slate-400 mb-8 relative">
            Join 1,200+ landlords screening smarter with TenantIQ.
          </p>
          <div className="flex flex-col items-center gap-3 relative">
            <Link
              href="/signup"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 font-bold px-10 py-5 rounded-2xl text-white text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 40px rgba(59,130,246,0.45)',
              }}
            >
              Create your free account
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-400 text-sm">TenantIQ</span>
          </div>
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} TenantIQ. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  )
}
