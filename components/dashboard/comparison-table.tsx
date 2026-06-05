'use client'

import { Application } from '@/types'
import { formatCurrency, getRecommendationStyle, getVerificationStyle, calcIncomeRatio } from '@/lib/utils'
import { ScoreRing } from './score-ring'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ComparisonTableProps {
  applications: (Application & { monthly_rent: number })[]
}

// Dark-mode badge styles for recommendation and verification
const REC_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  approve:  { bg: 'rgba(16,185,129,0.15)',  color: '#34D399', label: 'Approve' },
  review:   { bg: 'rgba(245,158,11,0.15)',  color: '#FCD34D', label: 'Review' },
  decline:  { bg: 'rgba(239,68,68,0.15)',   color: '#F87171', label: 'Decline' },
}
const VER_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  verified:    { bg: 'rgba(16,185,129,0.15)',  color: '#34D399', label: 'Verified' },
  discrepancy: { bg: 'rgba(239,68,68,0.15)',   color: '#F87171', label: 'Discrepancy' },
  unverified:  { bg: 'rgba(255,255,255,0.07)', color: '#94A3B8', label: 'Unverified' },
  no_document: { bg: 'rgba(255,255,255,0.07)', color: '#64748B', label: 'Not Provided' },
}

export function ComparisonTable({ applications }: ComparisonTableProps) {
  const rows = [
    {
      label: 'Score',
      render: (a: Application) => (
        <div className="flex justify-center">
          <ScoreRing score={a.score} size="sm" />
        </div>
      ),
    },
    {
      label: 'Recommendation',
      render: (a: Application) => {
        const s = REC_STYLES[a.recommendation ?? ''] ?? { bg: 'rgba(255,255,255,0.06)', color: '#64748B', label: 'Pending' }
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: s.bg, color: s.color }}
          >
            {s.label}
          </span>
        )
      },
    },
    {
      label: 'Reported Income',
      render: (a: Application) => (
        <span className="text-sm text-slate-300">{formatCurrency(a.monthly_income_reported)}</span>
      ),
    },
    {
      label: 'Verified Income',
      render: (a: Application) => (
        <span className="text-sm text-slate-300">{a.income_verified ? formatCurrency(a.income_verified) : '—'}</span>
      ),
    },
    {
      label: 'Income Ratio',
      render: (a: Application & { monthly_rent: number }) => {
        const income = a.income_verified ?? a.monthly_income_reported
        const ratio = calcIncomeRatio(income, a.monthly_rent)
        if (!ratio) return <span className="text-slate-500">—</span>
        const color = ratio >= 3 ? '#34D399' : ratio >= 2 ? '#FCD34D' : '#F87171'
        return <span className="text-sm font-bold" style={{ color }}>{ratio}x</span>
      },
    },
    {
      label: 'Verification',
      render: (a: Application) => {
        const s = VER_STYLES[a.income_verification_status ?? ''] ?? VER_STYLES.unverified
        return (
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={{ background: s.bg, color: s.color }}
          >
            {s.label}
          </span>
        )
      },
    },
    {
      label: 'Employer',
      render: (a: Application) => (
        <span className="text-xs text-slate-300">{a.employer_name}</span>
      ),
    },
    {
      label: 'Time at Job',
      render: (a: Application) => (
        <span className="text-xs text-slate-300">{a.time_at_job}</span>
      ),
    },
    {
      label: 'Evictions',
      render: (a: Application) => a.has_evictions
        ? <XCircle className="w-4 h-4 text-red-400 mx-auto" />
        : <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />,
    },
    {
      label: 'Late Payments',
      render: (a: Application) => a.has_late_payments
        ? <AlertCircle className="w-4 h-4 text-amber-400 mx-auto" />
        : <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" />,
    },
  ]

  return (
    <table className="w-full text-sm min-w-[500px]">
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <th className="text-left py-3 px-6 w-36 text-xs font-bold text-slate-500 uppercase tracking-wider">
            Criteria
          </th>
          {applications.map((app) => (
            <th key={app.id} className="py-3 px-4 text-center min-w-[140px]">
              <div className="font-semibold text-slate-200 text-sm">{app.full_name}</div>
              <div className="text-xs text-slate-500 font-normal mt-0.5">
                {new Date(app.created_at).toLocaleDateString()}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={row.label}
            style={{
              background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}
          >
            <td className="py-3 px-6 text-xs font-semibold text-slate-500 whitespace-nowrap">
              {row.label}
            </td>
            {applications.map((app) => (
              <td key={app.id} className="py-3 px-4 text-center">
                {row.render(app as Application & { monthly_rent: number })}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
