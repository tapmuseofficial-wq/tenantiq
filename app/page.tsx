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
  MapPin,
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
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-400 hover:text-slate-200 px-4 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl transition-all duration-200 hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 14px rgba(59,130,246,0.3)',
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Static gradient orbs — no animation, no repaints */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-10 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 pt-14 sm:pt-24 pb-14 sm:pb-20 text-center">

          {/* Trust badge — social proof before the headline */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6"
            style={{
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#34D399',
            }}
          >
            <MapPin className="w-3.5 h-3.5" />
            Trusted by landlords in Canada &amp; USA
          </div>

          {/* Headline — matches what landlords search for */}
          <h1 className="text-[40px] sm:text-6xl lg:text-7xl font-extrabold text-slate-100 leading-[1.08] text-balance mb-5">
            AI Tenant Screening —
            <br />
            <span className="gradient-text">Know Before They Move In</span>
          </h1>

          {/* Sub — concrete outcome, no fluff */}
          <p className="text-base sm:text-xl text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed">
            Share a link, your applicant fills a quick form, and TenantIQ instantly
            gives you AI-verified income, a 0–100 score, and a clear recommendation.
          </p>

          {/* "Free to try" — prominent above the CTA */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold mb-5"
            style={{
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.25)',
              color: '#93C5FD',
            }}
          >
            <CheckCircle className="w-4 h-4 text-blue-400" />
            Free to try — no credit card required
          </div>

          {/* Primary CTA — full-width on mobile, large on all screens */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 text-white font-bold px-10 py-5 rounded-2xl text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 36px rgba(59,130,246,0.45), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              Start Screening Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="flex items-center gap-1.5 text-sm text-slate-500">
              <Lock className="w-3.5 h-3.5" />
              3 free screenings · No subscription needed
            </p>
          </div>

          {/* Stats */}
          <div
            className="flex flex-wrap items-center justify-center gap-8 sm:gap-14 mt-12 pt-12"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            {[
              { value: '1,200+', label: 'Landlords', color: '#60A5FA' },
              { value: '8,500+', label: 'Screenings done', color: '#A78BFA' },
              { value: '< 2 min', label: 'Per applicant', color: '#34D399' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-extrabold mb-0.5" style={{ color: stat.color }}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Steps — ultra-scannable strip ──────────────────── */}
      <section className="py-14 sm:py-16">
        <div className="max-w-3xl mx-auto px-5 sm:px-8">

          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-8">
            How it works
          </p>

          {/* Steps: horizontal on desktop, stacked on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-4 sm:gap-0">
            {[
              {
                num: '1',
                title: 'Share a link',
                desc: 'Create a free screening link for your rental in 30 seconds.',
                color: '#3B82F6',
                bg: 'rgba(59,130,246,0.1)',
              },
              {
                num: '2',
                title: 'Tenant fills form',
                desc: 'They complete a 5-minute form on any phone or computer.',
                color: '#8B5CF6',
                bg: 'rgba(139,92,246,0.1)',
              },
              {
                num: '3',
                title: 'Get your AI score',
                desc: 'See verified income, a 0–100 score, and approve/decline instantly.',
                color: '#10B981',
                bg: 'rgba(16,185,129,0.1)',
              },
            ].map((step, i) => (
              <div key={step.num} className="flex sm:flex-col items-start sm:items-center flex-1 relative">

                {/* Arrow between steps — desktop */}
                {i < 2 && (
                  <div className="hidden sm:flex absolute top-6 left-full -translate-x-1/2 z-10">
                    <ArrowRight className="w-5 h-5 text-slate-700" />
                  </div>
                )}

                {/* Arrow between steps — mobile */}
                {i < 2 && (
                  <div className="sm:hidden absolute -bottom-2.5 left-6">
                    <div className="w-px h-5 bg-slate-700" />
                  </div>
                )}

                <div className="sm:text-center px-4 sm:px-6 pb-6 sm:pb-0 flex sm:flex-col items-start sm:items-center gap-4 sm:gap-0 w-full">
                  {/* Number circle */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold flex-shrink-0 sm:mb-4"
                    style={{ background: step.bg, color: step.color, border: `1px solid ${step.color}30` }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <p className="font-bold text-slate-100 text-base sm:text-center mb-1">{step.title}</p>
                    <p className="text-sm text-slate-400 sm:text-center leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.04) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Features</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mb-2">
              Everything you need to screen smarter
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-sm sm:text-base">
              Stop relying on gut feelings. Get AI-backed data on every applicant.
            </p>
          </div>

          {/* No backdrop-filter on below-fold cards — improves mobile perf */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: FileSearch,
                title: 'AI Income Verification',
                desc: 'Reads pay stubs and bank statements. Flags discrepancies automatically.',
                gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
              },
              {
                icon: BarChart3,
                title: 'Smart 0–100 Score',
                desc: 'Income ratio, employment, rental history, and more — all in one number.',
                gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
              },
              {
                icon: Users,
                title: 'Compare Applicants',
                desc: 'Side-by-side table for up to 4 applicants so you can pick the best one.',
                gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',
              },
              {
                icon: ShieldCheck,
                title: 'Instant PDF Reports',
                desc: 'Download a professional report to keep on file.',
                gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-5"
                style={{
                  background: 'rgba(15,22,41,0.8)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: f.gradient }}
                >
                  <f.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-1.5 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────── */}
      <section className="py-14 sm:py-20 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.05) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-3">Pricing</p>
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-100 mb-2">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-sm sm:text-base">Start free. Upgrade only when you need unlimited screenings.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Free */}
            <div
              className="rounded-2xl p-6 sm:p-7"
              style={{
                background: 'rgba(15,22,41,0.8)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="mb-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Free</p>
                <div>
                  <span className="text-5xl font-extrabold text-slate-100">$0</span>
                  <span className="text-slate-500 ml-2 text-sm">/month</span>
                </div>
                <p className="text-sm text-emerald-400 mt-1.5 font-medium">No credit card required</p>
              </div>
              <ul className="space-y-2.5 mb-6">
                {['3 tenant screenings', 'AI income verification', 'Smart scoring', 'PDF reports'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center font-semibold px-6 py-3.5 rounded-xl text-sm transition-all duration-200"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#CBD5E1',
                }}
              >
                Start for free — no card needed
              </Link>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-6 sm:p-7 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                boxShadow: '0 0 50px rgba(59,130,246,0.1)',
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
              <ul className="space-y-2.5 mb-6">
                {[
                  'Unlimited screenings',
                  'AI income verification',
                  'Smart scoring (0–100)',
                  'Side-by-side comparison',
                  'PDF reports',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
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
                  boxShadow: '0 0 20px rgba(59,130,246,0.4)',
                }}
              >
                Start with Pro
              </CheckoutButton>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <p className="text-center text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-8">
            What landlords say
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
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
                  background: 'rgba(15,22,41,0.7)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex gap-0.5 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
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
      <section className="py-14 sm:py-20 px-5">
        <div
          className="max-w-xl mx-auto py-12 sm:py-16 px-6 rounded-3xl text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.1) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
            Ready to find your perfect tenant?
          </h2>
          <p className="text-slate-400 mb-8 text-sm sm:text-base">
            Join 1,200+ landlords across Canada &amp; USA screening smarter.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 font-bold px-10 py-5 rounded-2xl text-white text-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 36px rgba(59,130,246,0.4)',
              }}
            >
              Start Screening Free
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
