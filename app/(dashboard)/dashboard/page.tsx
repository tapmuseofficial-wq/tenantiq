import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { trackRedditPurchase } from '@/lib/reddit-capi'
import { StatsCard } from '@/components/dashboard/stats-card'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScoreRing } from '@/components/dashboard/score-ring'
import { Users, CheckCircle, BarChart3, Building2, Plus, ArrowRight, TrendingUp } from 'lucide-react'
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
  const supabase = createClient()
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

  return (
    <div className="space-y-8">
      {/* Fires the Google Ads conversion event when ?upgraded=true is present */}
      <Suspense fallback={null}>
        <ConversionTracker conversionId={conversionId} />
      </Suspense>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Overview of your tenant screening activity</p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)',
          }}
        >
          <Plus className="w-4 h-4" />
          New Screening Link
        </Link>
      </div>

      {/* Stats */}
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

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent applicants */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-100">Recent Applicants</h2>
                <Link
                  href="/dashboard/properties"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                >
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {allApps.length === 0 ? (
                <div className="py-14 text-center">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}
                  >
                    <Users className="w-7 h-7 text-blue-400/40" />
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
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                  {allApps.map((app) => {
                    const recStyle = getRecommendationStyle(app.recommendation)
                    return (
                      <Link
                        key={app.id}
                        href={`/dashboard/applicants/${app.id}`}
                        className="flex items-center gap-4 px-6 py-4 group row-hover"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <ScoreRing score={app.score} size="sm" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-200 text-sm">{app.full_name}</p>
                          <p className="text-xs text-slate-500 truncate mt-0.5">
                            {app.property_name} · {formatDate(app.created_at)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {app.status === 'analyzing' ? (
                            <Badge variant="blue">Analyzing…</Badge>
                          ) : app.recommendation ? (
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                              style={{
                                background: recStyle.bg.includes('green') ? 'rgba(16,185,129,0.15)' :
                                            recStyle.bg.includes('red') ? 'rgba(239,68,68,0.15)' :
                                            'rgba(245,158,11,0.15)',
                                color: recStyle.bg.includes('green') ? '#34D399' :
                                       recStyle.bg.includes('red') ? '#F87171' : '#FCD34D',
                                border: `1px solid ${recStyle.bg.includes('green') ? 'rgba(16,185,129,0.25)' :
                                                      recStyle.bg.includes('red') ? 'rgba(239,68,68,0.25)' :
                                                      'rgba(245,158,11,0.25)'}`,
                              }}
                            >
                              {recStyle.label}
                            </span>
                          ) : (
                            <Badge variant="gray">Pending</Badge>
                          )}
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Properties */}
        <div>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-slate-100">Properties</h2>
                <Link
                  href="/dashboard/properties/new"
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {(properties || []).length === 0 ? (
                <div className="py-10 text-center px-6">
                  <Building2 className="w-7 h-7 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm text-slate-500">No properties yet</p>
                </div>
              ) : (
                <div>
                  {(properties || []).map((prop) => (
                    <Link
                      key={prop.id}
                      href={`/dashboard/properties/${prop.id}`}
                      className="flex items-center justify-between px-6 py-3.5 group row-hover"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{prop.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{formatCurrency(prop.monthly_rent)}/mo</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
