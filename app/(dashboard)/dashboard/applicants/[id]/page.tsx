import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { ScoreRing } from '@/components/dashboard/score-ring'
import { ArrowLeft, FileDown, AlertTriangle, CheckCircle, User, Briefcase, Home, Phone, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate, getRecommendationStyle, getVerificationStyle, calcIncomeRatio } from '@/lib/utils'

export default async function ApplicantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: app, error } = await supabase
    .from('applications')
    .select(`*, properties (name, monthly_rent, landlord_id, id)`)
    .eq('id', id)
    .single()

  if (error || !app) notFound()

  const property = app.properties as { name: string; monthly_rent: number; landlord_id: string; id: string }
  if (property.landlord_id !== user!.id) notFound()

  const recStyle = getRecommendationStyle(app.recommendation)
  const verStyle = getVerificationStyle(app.income_verification_status)
  const effectiveIncome = app.income_verified ?? app.monthly_income_reported
  const ratio = calcIncomeRatio(effectiveIncome, property.monthly_rent)
  const breakdown = app.score_breakdown as Record<string, { score: number; max: number; explanation: string }> | null

  const recColors = {
    approve: { bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', text: '#34D399', label: 'Approve' },
    review: { bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', text: '#FCD34D', label: 'Review' },
    decline: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', text: '#F87171', label: 'Decline' },
  }
  const rec = recColors[app.recommendation as keyof typeof recColors] ?? recColors.review

  const verColors: Record<string, { bg: string; border: string; text: string }> = {
    verified: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', text: '#34D399' },
    discrepancy: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#FCD34D' },
    unverified: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.1)', text: '#94A3B8' },
  }
  const ver = verColors[app.income_verification_status as string] ?? verColors.unverified

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/dashboard/properties/${property.id}`}
            className="w-9 h-9 rounded-xl flex items-center justify-center back-btn"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{app.full_name}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Applied to <span className="text-slate-400 font-medium">{property.name}</span> · {formatDate(app.created_at)}
            </p>
          </div>
        </div>
        {app.status === 'complete' && (
          <a
            href={`/api/report/${app.id}`}
            className="inline-flex items-center gap-2 font-medium px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#CBD5E1',
            }}
          >
            <FileDown className="w-4 h-4" />
            Download PDF
          </a>
        )}
      </div>

      {/* Status banners */}
      {app.status === 'analyzing' && (
        <div
          className="flex items-center gap-3 rounded-xl p-4"
          style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm font-medium text-blue-300">
            AI analysis in progress — this usually takes 30–60 seconds. Refresh to see results.
          </p>
        </div>
      )}

      {app.status === 'error' && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <p className="text-sm text-red-400">Analysis failed: {app.error_message || 'Unknown error'}</p>
        </div>
      )}

      {/* Score + Recommendation + Income */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Score */}
        <div
          className="rounded-2xl p-6 flex flex-col items-center text-center"
          style={{
            background: 'rgba(15,22,41,0.75)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Overall Score</p>
          <ScoreRing score={app.score} size="lg" />
          <p className="text-xs text-slate-600 mt-3">out of 100</p>
        </div>

        {/* Recommendation */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: rec.bg,
            border: `1px solid ${rec.border}`,
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: rec.text, opacity: 0.7 }}>
            Recommendation
          </p>
          <p className="text-3xl font-extrabold mb-3" style={{ color: rec.text }}>{rec.label}</p>
          <p className="text-xs text-slate-400 leading-relaxed">{app.recommendation_reason}</p>
        </div>

        {/* Verification */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'rgba(15,22,41,0.75)',
            border: '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Income Verification</p>
          <span
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold mb-3"
            style={{ background: ver.bg, border: `1px solid ${ver.border}`, color: ver.text }}
          >
            {verStyle.label}
          </span>
          {app.income_verified && (
            <p className="text-xs text-slate-400 mt-1">
              Verified: <span className="font-semibold text-slate-300">{formatCurrency(app.income_verified)}/mo</span>
            </p>
          )}
          {app.income_verification_notes && (
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">{app.income_verification_notes}</p>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {app.ai_summary && (
        <div
          className="rounded-2xl p-5"
          style={{
            background: 'rgba(59,130,246,0.05)',
            border: '1px solid rgba(59,130,246,0.12)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">AI Summary</p>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">{app.ai_summary}</p>
        </div>
      )}

      {/* Red Flags & Positives — prominent placement */}
      {(app.red_flags?.length || app.positive_factors?.length) && (
        <div className="grid sm:grid-cols-2 gap-4">
          {app.red_flags && app.red_flags.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.18)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <h3 className="text-sm font-bold text-red-400">Red Flags</h3>
              </div>
              <ul className="space-y-2">
                {(app.red_flags as string[]).map((flag, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-red-300/80">
                    <span className="text-red-500 mt-0.5 flex-shrink-0">•</span>
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {app.positive_factors && app.positive_factors.length > 0 && (
            <div
              className="rounded-2xl p-5"
              style={{
                background: 'rgba(16,185,129,0.07)',
                border: '1px solid rgba(16,185,129,0.18)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-emerald-400">Positive Factors</h3>
              </div>
              <ul className="space-y-2">
                {(app.positive_factors as string[]).map((factor, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-emerald-300/80">
                    <span className="text-emerald-500 mt-0.5 flex-shrink-0">•</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Info Grid */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Personal Info */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-blue-400" /> Personal Info
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Full Name', value: app.full_name },
              { label: 'Email', value: app.email },
              { label: 'Phone', value: app.phone },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-slate-200">{item.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Income & Employment */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-blue-400" /> Income & Employment
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'Reported Income', value: `${formatCurrency(app.monthly_income_reported)}/mo` },
              { label: 'Verified Income', value: app.income_verified ? `${formatCurrency(app.income_verified)}/mo` : '—' },
              { label: 'Income-to-Rent Ratio', value: ratio ? `${ratio}x` : '—' },
              { label: 'Employer', value: app.employer_name },
              { label: 'Time at Job', value: app.time_at_job },
            ].map(item => (
              <div key={item.label}>
                <p className="text-xs text-slate-500 mb-0.5">{item.label}</p>
                <p className="text-sm font-medium text-slate-200">{item.value}</p>
              </div>
            ))}
            <div>
              <p className="text-xs text-slate-500 mb-0.5">Reason for Moving</p>
              <p className="text-sm text-slate-300 leading-relaxed">{app.reason_for_moving}</p>
            </div>
          </CardContent>
        </Card>

        {/* Rental History */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Home className="w-4 h-4 text-blue-400" /> Rental History
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                {app.has_evictions
                  ? <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                <p className="text-sm font-semibold text-slate-200">
                  Evictions: <span className={app.has_evictions ? 'text-red-400' : 'text-emerald-400'}>
                    {app.has_evictions ? 'Yes' : 'None'}
                  </span>
                </p>
              </div>
              {app.has_evictions && app.eviction_explanation && (
                <p className="text-xs text-slate-400 ml-6 leading-relaxed">{app.eviction_explanation}</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                {app.has_late_payments
                  ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                <p className="text-sm font-semibold text-slate-200">
                  Late Payments: <span className={app.has_late_payments ? 'text-amber-400' : 'text-emerald-400'}>
                    {app.has_late_payments ? 'Yes' : 'None'}
                  </span>
                </p>
              </div>
              {app.has_late_payments && app.late_payment_explanation && (
                <p className="text-xs text-slate-400 ml-6 leading-relaxed">{app.late_payment_explanation}</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                {app.has_pets
                  ? <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
                <p className="text-sm font-semibold text-slate-200">
                  Pets: <span className={app.has_pets ? 'text-amber-400' : 'text-emerald-400'}>
                    {app.has_pets ? 'Yes' : 'None'}
                  </span>
                </p>
              </div>
              {app.has_pets && app.pet_details && (
                <p className="text-xs text-slate-400 ml-6 leading-relaxed">{app.pet_details}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* References */}
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-blue-400" /> References
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            {app.reference_1_name ? (
              <div>
                <p className="text-xs text-slate-500 mb-1">Reference 1</p>
                <p className="text-sm font-semibold text-slate-200">{app.reference_1_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{app.reference_1_relationship} · {app.reference_1_phone}</p>
              </div>
            ) : <p className="text-sm text-slate-500">No references provided</p>}
            {app.reference_2_name && (
              <div>
                <p className="text-xs text-slate-500 mb-1">Reference 2</p>
                <p className="text-sm font-semibold text-slate-200">{app.reference_2_name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{app.reference_2_relationship} · {app.reference_2_phone}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Score Breakdown */}
      {breakdown && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200">Score Breakdown</h2>
          </CardHeader>
          <CardContent className="space-y-5">
            {Object.entries(breakdown).map(([key, item]) => {
              const pct = item.max > 0 ? (item.score / item.max) * 100 : 0
              const barColor = pct >= 75 ? '#10B981' : pct >= 50 ? '#F59E0B' : '#EF4444'
              const bgColor = pct >= 75 ? 'rgba(16,185,129,0.15)' : pct >= 50 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300">{label}</span>
                    <span className="text-sm font-bold" style={{ color: barColor }}>
                      {item.score}/{item.max}
                    </span>
                  </div>
                  <div className="w-full rounded-full h-2 mb-2 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <div
                      className="h-2 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: barColor, boxShadow: `0 0 8px ${barColor}60` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.explanation}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Interview Questions */}
      {app.interview_questions && (app.interview_questions as string[]).length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Suggested Interview Questions
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Tailored by AI to this specific applicant</p>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3.5">
              {(app.interview_questions as string[]).map((q, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA', border: '1px solid rgba(59,130,246,0.25)' }}
                  >
                    {i + 1}
                  </span>
                  <p className="text-sm text-slate-300 leading-relaxed">{q}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
