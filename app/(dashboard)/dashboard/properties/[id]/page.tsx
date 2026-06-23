import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ScoreRing } from '@/components/dashboard/score-ring'
import { AutoRefresh } from '@/components/dashboard/auto-refresh'
import { ArrowLeft, FileDown, Users, Link2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getRecommendationStyle, getVerificationStyle, calcIncomeRatio } from '@/lib/utils'
import { CompareButton } from './compare-button'
import { CopyLinkButton } from '@/components/dashboard/copy-link-button'

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .eq('landlord_id', user!.id)
    .single()

  if (error || !property) notFound()

  const { data: applications } = await supabase
    .from('applications')
    .select('*')
    .eq('property_id', id)
    .order('score', { ascending: false, nullsFirst: false })

  const apps = applications || []

  const verColors: Record<string, { bg: string; text: string }> = {
    verified: { bg: 'rgba(16,185,129,0.12)', text: '#34D399' },
    discrepancy: { bg: 'rgba(245,158,11,0.12)', text: '#FCD34D' },
    unverified: { bg: 'rgba(255,255,255,0.06)', text: '#94A3B8' },
  }

  const recColors: Record<string, { bg: string; text: string }> = {
    approve: { bg: 'rgba(16,185,129,0.12)', text: '#34D399' },
    review: { bg: 'rgba(245,158,11,0.12)', text: '#FCD34D' },
    decline: { bg: 'rgba(239,68,68,0.12)', text: '#F87171' },
  }

  const hasAnalyzing = apps.some(a => a.status === 'analyzing')

  return (
    <div className="space-y-6">
      {/* Auto-refresh every 5 s while any application is being analyzed */}
      <AutoRefresh active={hasAnalyzing} />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Link
            href="/dashboard/properties"
            className="mt-1 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{property.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-blue-400 font-semibold text-sm">{formatCurrency(property.monthly_rent)}/mo</span>
              {property.address && (
                <>
                  <span className="text-slate-700">·</span>
                  <span className="text-slate-500 text-sm">{property.address}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {apps.length >= 2 && <CompareButton applications={apps} />}
        </div>
      </div>

      {/* Screening Link */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.14)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(59,130,246,0.15)' }}>
            <Link2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-400 mb-1">Screening Link — share with applicants</p>
            <p className="text-sm font-mono text-slate-300 truncate">
              {process.env.NEXT_PUBLIC_APP_URL}/apply/{property.screening_token}
            </p>
          </div>
          <CopyLinkButton token={property.screening_token} />
        </div>
      </div>

      {/* Applicants Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-blue-400" />
              Applicants ({apps.length})
            </h2>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {apps.length === 0 ? (
            <div className="py-16 text-center px-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.12)' }}
              >
                <Users className="w-7 h-7 text-blue-400/30" />
              </div>
              <p className="font-semibold text-slate-300 text-sm mb-1.5">No applications yet</p>
              <p className="text-xs text-slate-500 mb-5 max-w-xs mx-auto">
                Share your screening link with tenants — they fill out a 5-minute form and you get an AI report automatically.
              </p>
              <div
                className="inline-block rounded-xl px-4 py-2.5 font-mono text-xs text-slate-400 truncate max-w-xs"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {process.env.NEXT_PUBLIC_APP_URL}/apply/{property.screening_token}
              </div>
              <div className="mt-3">
                <CopyLinkButton token={property.screening_token} />
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <th className="text-left px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Applicant</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Score</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Income</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Ratio</th>
                    <th className="text-center px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Evictions</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Verification</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Decision</th>
                    <th className="px-4 py-3.5" />
                  </tr>
                </thead>
                <tbody>
                  {apps.map((app) => {
                    const recStyle = getRecommendationStyle(app.recommendation)
                    const verStyle = getVerificationStyle(app.income_verification_status)
                    const income = app.income_verified ?? app.monthly_income_reported
                    const ratio = calcIncomeRatio(income, property.monthly_rent)
                    const vc = verColors[app.income_verification_status as string] ?? verColors.unverified
                    const rc = recColors[app.recommendation as string] ?? recColors.review

                    return (
                      <tr
                        key={app.id}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        {/* Name + date */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold text-slate-200">{app.full_name}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{formatDate(app.created_at)}</p>
                          </div>
                        </td>

                        {/* Score — spinner while analyzing */}
                        <td className="px-4 py-4 text-center">
                          {app.status === 'analyzing' ? (
                            <div className="flex justify-center">
                              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <ScoreRing score={app.score} size="sm" />
                            </div>
                          )}
                        </td>

                        {/* Verified income */}
                        <td className="px-4 py-4">
                          <span className="font-semibold text-slate-300">
                            {app.income_verified ? formatCurrency(app.income_verified) : '—'}
                          </span>
                        </td>

                        {/* Income ratio */}
                        <td className="px-4 py-4">
                          {ratio ? (
                            <span className="font-bold" style={{ color: ratio >= 3 ? '#34D399' : ratio >= 2 ? '#FCD34D' : '#F87171' }}>
                              {ratio}x
                            </span>
                          ) : <span className="text-slate-600">—</span>}
                        </td>

                        {/* Evictions */}
                        <td className="px-4 py-4 text-center">
                          {app.has_evictions ? (
                            <span className="text-red-400 font-bold">✗</span>
                          ) : (
                            <span className="text-emerald-400 font-bold">✓</span>
                          )}
                        </td>

                        {/* Verification */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: vc.bg, color: vc.text }}>
                            {verStyle.label}
                          </span>
                        </td>

                        {/* Decision */}
                        <td className="px-4 py-4">
                          {app.recommendation ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ background: rc.bg, color: rc.text }}>
                              {recStyle.label}
                            </span>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>

                        {/* Action — prominent when complete */}
                        <td className="px-4 py-4">
                          {app.status === 'analyzing' ? (
                            <div className="min-w-[140px]">
                              <p className="text-xs text-blue-400 font-medium mb-1.5">AI analyzing…</p>
                              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div
                                  className="h-1 rounded-full animate-pulse"
                                  style={{ width: '60%', background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)' }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-600 mt-1">Auto-refreshing…</p>
                            </div>
                          ) : app.status === 'complete' ? (
                            <div className="flex items-center gap-2">
                              <Link
                                href={`/dashboard/applicants/${app.id}`}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white whitespace-nowrap transition-all hover:opacity-90"
                                style={{
                                  background: 'linear-gradient(135deg, #10B981, #059669)',
                                  boxShadow: '0 0 12px rgba(16,185,129,0.3)',
                                }}
                              >
                                View Report
                                <ArrowRight className="w-3 h-3" />
                              </Link>
                              <a href={`/api/report/${app.id}`} className="text-slate-600 hover:text-slate-400 transition-colors" title="Download PDF">
                                <FileDown className="w-4 h-4" />
                              </a>
                            </div>
                          ) : (
                            <Link
                              href={`/dashboard/applicants/${app.id}`}
                              className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors whitespace-nowrap"
                            >
                              View →
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
