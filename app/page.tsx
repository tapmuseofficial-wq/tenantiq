import Link from 'next/link'
import {
  FileSearch,
  ShieldCheck,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Zap,
  Sparkles,
  Star,
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#0A0F1E' }}>
      {/* Navbar */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 20px rgba(59,130,246,0.4)',
              }}
            >
              <Sparkles className="w-5 h-5 text-white" />
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
                boxShadow: '0 0 20px rgba(59,130,246,0.3)',
              }}
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background orbs */}
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-20 -right-40 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(59,130,246,0.06) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 pt-24 pb-20 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-10"
            style={{
              background: 'rgba(59,130,246,0.1)',
              border: '1px solid rgba(59,130,246,0.2)',
              color: '#60A5FA',
            }}
          >
            <Zap className="w-4 h-4" />
            AI-powered screening for Canadian & US landlords
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-100 leading-[1.05] text-balance mb-7">
            Screen tenants with
            <br />
            <span className="gradient-text">AI confidence</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 text-balance leading-relaxed">
            Share a link, collect applications, and get AI-verified income reports and smart scores
            — so you can find the right tenant, faster.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 text-white font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 30px rgba(59,130,246,0.4), 0 4px 20px rgba(0,0,0,0.3)',
              }}
            >
              Start for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 font-semibold px-8 py-4 rounded-2xl text-base transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#CBD5E1',
              }}
            >
              See how it works
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-10 mt-16 pt-16" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { value: '1,200+', label: 'Landlords', color: '#60A5FA' },
              { value: '8,500+', label: 'Screenings done', color: '#A78BFA' },
              { value: '< 2 min', label: 'Avg. analysis time', color: '#34D399' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-extrabold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.05) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
              Everything you need to screen smarter
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-lg">
              Stop relying on gut feelings. Get AI-backed data on every applicant in minutes.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: FileSearch,
                title: 'AI Income Verification',
                desc: 'Claude reads pay stubs and bank statements to verify income — flags discrepancies automatically.',
                gradient: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                glow: 'rgba(59,130,246,0.15)',
              },
              {
                icon: BarChart3,
                title: 'Smart Scoring',
                desc: 'Each applicant gets a score out of 100 based on income ratio, employment, rental history, and more.',
                gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
                glow: 'rgba(139,92,246,0.15)',
              },
              {
                icon: Users,
                title: 'Side-by-Side Compare',
                desc: 'Compare multiple applicants in a single table to make the right choice quickly.',
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
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110"
                  style={{ background: feature.gradient, boxShadow: `0 0 24px ${feature.glow}` }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-slate-100 mb-2.5 text-base">{feature.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">How It Works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">Three steps to better tenants</h2>
            <p className="text-slate-400 text-lg">From link to decision in under 2 minutes</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Create a screening link',
                desc: 'Add your rental property and set the monthly rent. We generate a unique link in seconds.',
                color: '#3B82F6',
                glow: 'rgba(59,130,246,0.3)',
              },
              {
                step: '02',
                title: 'Share with applicants',
                desc: 'Send the link via text or email. Tenants fill out the application on their phone or computer.',
                color: '#8B5CF6',
                glow: 'rgba(139,92,246,0.3)',
              },
              {
                step: '03',
                title: 'Review AI-scored results',
                desc: 'See every applicant ranked by score, with verified income, red flags, and a recommendation.',
                color: '#10B981',
                glow: 'rgba(16,185,129,0.3)',
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center relative">
                {i < 2 && (
                  <div
                    className="hidden sm:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px"
                    style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' }}
                  />
                )}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-extrabold mx-auto mb-5"
                  style={{
                    background: 'rgba(15,22,41,0.8)',
                    border: `1px solid ${item.color}40`,
                    color: item.color,
                    boxShadow: `0 0 24px ${item.glow}`,
                  }}
                >
                  {item.step}
                </div>
                <h3 className="font-semibold text-slate-100 text-lg mb-2.5">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 relative">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 100%, rgba(139,92,246,0.06) 0%, transparent 60%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-blue-400 uppercase tracking-[0.2em] mb-4">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-400 text-lg">Start free, upgrade when you need more</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div
              className="rounded-2xl p-8"
              style={{
                background: 'rgba(15,22,41,0.7)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="mb-7">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Free</p>
                <div>
                  <span className="text-5xl font-extrabold text-slate-100">$0</span>
                  <span className="text-slate-500 ml-2 text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">Perfect for occasional landlords</p>
              </div>
              <ul className="space-y-3 mb-8">
                {['3 tenant screenings', 'AI income verification', 'Smart scoring', 'PDF reports'].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-slate-400" />
                    </div>
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
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div
              className="rounded-2xl p-8 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.12) 100%)',
                border: '1px solid rgba(59,130,246,0.3)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 60px rgba(59,130,246,0.1), inset 0 1px 0 rgba(255,255,255,0.08)',
              }}
            >
              {/* Popular badge */}
              <div
                className="absolute top-5 right-5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', color: 'white' }}
              >
                POPULAR
              </div>
              <div className="mb-7">
                <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3">Pro</p>
                <div>
                  <span className="text-5xl font-extrabold text-slate-100">$19</span>
                  <span className="text-slate-400 ml-2 text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-400 mt-2">For active landlords</p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Unlimited screenings',
                  'AI income verification',
                  'Smart scoring (out of 100)',
                  'Side-by-side comparison',
                  'PDF reports',
                  'Priority support',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(59,130,246,0.25)', border: '1px solid rgba(59,130,246,0.4)' }}
                    >
                      <CheckCircle className="w-3 h-3 text-blue-400" />
                    </div>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center font-semibold px-6 py-3.5 rounded-xl text-white text-sm transition-all duration-200 hover:opacity-90"
                style={{
                  background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.4)',
                }}
              >
                Start with Pro
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="grid sm:grid-cols-3 gap-5">
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
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
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

      {/* CTA */}
      <section className="py-24 text-center">
        <div
          className="max-w-2xl mx-auto px-5 py-16 rounded-3xl relative overflow-hidden"
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
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4 relative">
            Ready to find your perfect tenant?
          </h2>
          <p className="text-slate-400 mb-8 relative text-lg">
            Join 1,200+ landlords who screen smarter with TenantIQ.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-2xl text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 relative"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              boxShadow: '0 0 40px rgba(59,130,246,0.4)',
            }}
          >
            Create your free account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }} className="py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
            >
              <Sparkles className="w-4 h-4 text-white" />
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
