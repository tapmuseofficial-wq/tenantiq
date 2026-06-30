import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { trackRedditPurchase } from '@/lib/reddit-capi'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreRing } from '@/components/dashboard/score-ring'
import { OnboardingModal } from '@/components/dashboard/onboarding-modal'
import { Users, CheckCircle, BarChart3, Building2, Plus, ArrowRight, TrendingUp, Sparkles, Link2 } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getRecommendationStyle } from '@/lib/utils'
import { Suspense } from 'react'
import { ConversionTracker } from '@/components/dashboard/conversion-tracker'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isPurchase = params.upgraded === 'true'
  const conversionId = isPurchase ? crypto.randomUUID() : undefined

  if (isPurchase && conversionId) {
    const reqHeaders = await headers()
    const ip = reqHeaders.get('x-forwarded-for')?.split(',')[0].trim()
      ?? reqHeaders.get('x-real-ip')
      ?? undefined
    const userAgent = reqHeaders.get('user-agent') ?? undefined
    await trackRedditPurchase({
      conversionId,
      ip,
      userAgent,
      email: user?.email,
    })
  }

  const [{ data: properties }, { data: recentApps }] = await Promise.all([
    supabase
      .from('properties')
      .select('id, name, monthly_rent, is_active')
      .eq('landlord_id', user!.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('application_summaries')
      .select('*')
      .eq('landlord_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const allApps = recentApps || []
  const approved = allApps.filter(a => a.recommendation === 'approve').length
  const scoredApps = allApps.filter(a => a.score)
  const avgScore = scoredApps.length
    ? Math.round(scoredApps.reduce((sum, a) => sum + (a.score || 0), 0) / scoredApps.length)
    : null

  const hasProperties = (properties || []).length > 0

  return (
    <div className="space-y-7">
      {/* First-login onboarding modal */}
      <OnboardingModal userId={user!.id} />

      {/* Fires the Google Ads conversion event when ?upgraded=true is present */}
      <Suspense fallback={null}>
        <ConversionTracker conversionId={conversionId} />
      </Suspense>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="w-1 h-7 rounded-full flex-shrink-0"
              style={{ background: 'linear-gradient(to bottom, #3B82F6, #8B5CF6)' }}
            />
            <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          </div>
          <p className="text-slate-500 mt-0.5 text-sm pl-[14px]">Overview of your tenant screening activity</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-90 hover:-translate-y-px"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              boxShadow: '0 0 20px rgba(59,130,246,0.3)',
            }}
          >
            <Plus className="w-4 h-4" />
            New Screening Link
          </Link>
          {!hasProperties && (
            <p className="text-[10px] text-slate-600">← Start here</p>
          )}
        </div>
      </div>

      {/* Empty state — no properties yet */}
      {!hasProperties && (
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: 'rgba(15,22,41,0.7)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(139,92,246,0.1))', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">Get Started</h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
            Create your first screening link in 30 seconds. Share it with any tenant and get an AI-powered screening report automatically.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 text-white font-bold px-8 py-4 rounded-xl text-sm transition-all hover:opacity-90"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 30px rgba(59,130,246,0.4)',
              }}
            >
              <Link2 className="w-4 h-4" />
              Create my first screening link
            </Link>
          </div>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-8 text-xs text-slate-600">
            <span className="flex items-center gap-2">✓ Free to start</span>
            <span className="flex items-center gap-2">✓ AI scoring in 60 seconds</span>
            <span className="flex items-center gap-2">✓ No credit card required</span>
          </div>
        </div>
      )}

      {/* Stats — only show when there is data */}
      {hasProperties && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Applicants"
            value={allApps.length}
            icon={Users}
            variant="blue"
          />
          <StatsCard
            title="Approved"
            value={approved}
            subtitle={allApps.length ? `${Math.round((approved / allApps.length) * 100)}% approval rate` : undefined}
            icon={CheckCircle}
            variant="green"
          />
          <StatsCard
            title="Avg. Score"
            value={avgScore ?? '—'}
            subtitle={avgScore ? (avgScore >= 75 ? 'Strong pool' : avgScore >= 55 ? 'Mixed pool' : 'Review carefully') : undefined}
            icon={TrendingUp}
            variant="yellow"
          />
          <StatsCard
            title="Properties"
            value={(properties || []).length}
            icon={Building2}
            variant="purple"
          />
        </div>
      )}

      {hasProperties && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent applicants */}
          <div className="lg:col-span-2">
            <div
              className="rounded-2xl overflow-hidden card-hover"
              style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
            >
              {/* Section header */}
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-400" />
                  <h2 className="font-semibold text-slate-100 text-sm">Recent Applicants</h2>
                  {allApps.length > 0 && (
                    <span
                      className="inline-flex items-center justify-center text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}
                    >
                      {allApps.length}
                    </span>
                  )}
                </div>
                <Link
                  href="/dashboard/properties"
                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {allApps.length === 0 ? (
                <div className="py-14 text-center">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}
                  >
                    <Users className="w-6 h-6 text-blue-400/40" />
                  </div>
                  <p className="text-sm text-slate-500">No applicants yet.</p>
                  <Link
                    href="/dashboard/properties/new"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-400 hover:text-blue-300 mt-3 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create screening link
                  </Link>
                </div>
              ) : (
                <div>
                  {allApps.map((app) => {
                    const recStyle = getRecommendationStyle(app.recommendation)
                    const isApprove = recStyle.bg.includes('green')
                    const isDecline = recStyle.bg.includes('red')
                    return (
                      <Link
                        key={app.id}
                        href={`/dashboard/applicants/${app.id}`}
                        className="flex items-center gap-4 px-6 py-4 group row-hover"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <ScoreRing score={app.score} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 text-sm group-hover:text-slate-100 transition-colors">
                            {app.full_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {app.property_name} · {formatDate(app.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          {app.status === 'analyzing' ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{ background: 'rgba(59,130,246,0.12)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.2)' }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                              Analyzing
                            </span>
                          ) : app.recommendation ? (
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{
                                background: isApprove ? 'rgba(16,185,129,0.12)' : isDecline ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                                color: isApprove ? '#34D399' : isDecline ? '#F87171' : '#FCD34D',
                                border: `1px solid ${isApprove ? 'rgba(16,185,129,0.22)' : isDecline ? 'rgba(239,68,68,0.22)' : 'rgba(245,158,11,0.22)'}`,
                              }}
                            >
                              {recStyle.label}
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                              style={{ background: 'rgba(100,116,139,0.12)', color: '#64748B', border: '1px solid rgba(100,116,139,0.18)' }}
                            >
                              Pending
                            </span>
                          )}
                          <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Properties sidebar */}
          <div>
            <div
              className="rounded-2xl overflow-hidden card-hover"
              style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 32px rgba(0,0,0,0.35)' }}
            >
              <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-violet-400" />
                  <h2 className="font-semibold text-slate-100 text-sm">Properties</h2>
                </div>
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </Link>
              </div>

              {(properties || []).length === 0 ? (
                <div className="py-10 text-center px-6">
                  <Building2 className="w-7 h-7 mx-auto mb-2 text-slate-700" />
                  <p className="text-sm text-slate-500">No properties yet</p>
                </div>
              ) : (
                <div>
                  {(properties || []).map((prop) => (
                    <Link
                      key={prop.id}
                      href={`/dashboard/properties/${prop.id}`}
                      className="flex items-center justify-between px-6 py-4 group row-hover"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ background: prop.is_active ? '#34D399' : '#475569' }}
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-slate-100 transition-colors">
                            {prop.name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(prop.monthly_rent)}/mo</p>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
