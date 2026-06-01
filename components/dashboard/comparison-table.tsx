'use client'

import { Application } from '@/types'
import { formatCurrency, getRecommendationStyle, getVerificationStyle, calcIncomeRatio } from '@/lib/utils'
import { ScoreRing } from './score-ring'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface ComparisonTableProps {
  applications: (Application & { monthly_rent: number })[]
}

export function ComparisonTable({ applications }: ComparisonTableProps) {
  const rows = [
    { label: 'Score', render: (a: Application) => <ScoreRing score={a.score} size="sm" /> },
    {
      label: 'Recommendation',
      render: (a: Application) => {
        const style = getRecommendationStyle(a.recommendation)
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        )
      },
    },
    {
      label: 'Reported Income',
      render: (a: Application) => formatCurrency(a.monthly_income_reported),
    },
    {
      label: 'Verified Income',
      render: (a: Application) => a.income_verified ? formatCurrency(a.income_verified) : '—',
    },
    {
      label: 'Income Ratio',
      render: (a: Application & { monthly_rent: number }) => {
        const income = a.income_verified ?? a.monthly_income_reported
        const ratio = calcIncomeRatio(income, a.monthly_rent)
        if (!ratio) return '—'
        const good = ratio >= 3
        const ok = ratio >= 2
        return (
          <span className={good ? 'text-green-600 font-medium' : ok ? 'text-yellow-600 font-medium' : 'text-red-600 font-medium'}>
            {ratio}x
          </span>
        )
      },
    },
    {
      label: 'Income Verification',
      render: (a: Application) => {
        const style = getVerificationStyle(a.income_verification_status)
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
            {style.label}
          </span>
        )
      },
    },
    {
      label: 'Employer',
      render: (a: Application) => <span className="text-xs">{a.employer_name}</span>,
    },
    {
      label: 'Time at Job',
      render: (a: Application) => <span className="text-xs">{a.time_at_job}</span>,
    },
    {
      label: 'Evictions',
      render: (a: Application) => a.has_evictions
        ? <XCircle className="w-4 h-4 text-red-500 mx-auto" />
        : <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />,
    },
    {
      label: 'Late Payments',
      render: (a: Application) => a.has_late_payments
        ? <AlertCircle className="w-4 h-4 text-yellow-500 mx-auto" />
        : <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />,
    },
  ]

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="text-left py-3 pr-4 w-36 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Criteria
            </th>
            {applications.map((app) => (
              <th key={app.id} className="py-3 px-4 text-center min-w-[140px]">
                <div className="font-semibold text-slate-900 text-sm">{app.full_name}</div>
                <div className="text-xs text-slate-500 font-normal">Applied {new Date(app.created_at).toLocaleDateString()}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.label} className={i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
              <td className="py-3 pr-4 text-xs font-medium text-slate-600">{row.label}</td>
              {applications.map((app) => (
                <td key={app.id} className="py-3 px-4 text-center">
                  {row.render(app as Application & { monthly_rent: number })}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
