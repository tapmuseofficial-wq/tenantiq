'use client'

import { useState } from 'react'
import { ShieldCheck, Clock, AlertTriangle, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import type { CertnReport } from '@/lib/certn'

interface CertnSectionProps {
  applicationId: string
  certnStatus:   'pending' | 'complete' | 'failed' | null
  certnReport:   CertnReport | null
}

export function CertnSection({ applicationId, certnStatus, certnReport }: CertnSectionProps) {
  const [requesting, setRequesting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)
  const [requested,  setRequested]  = useState(false)

  async function handleRequest() {
    setRequesting(true)
    setError(null)

    const res = await fetch('/api/certn/request', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ application_id: applicationId }),
    })

    setRequesting(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Something went wrong. Please try again.')
      return
    }

    setRequested(true)
  }

  const effectiveStatus = requested ? 'pending' : certnStatus

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-slate-200 flex items-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-violet-400" />
          Full Background Check
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified credit, criminal, and eviction check via Certn — tenant pays directly
        </p>
      </CardHeader>
      <CardContent>
        {effectiveStatus === null && (
          <NotOrdered
            requesting={requesting}
            error={error}
            onRequest={handleRequest}
          />
        )}

        {effectiveStatus === 'pending' && <PendingState />}

        {effectiveStatus === 'failed' && (
          <FailedState onRetry={handleRequest} requesting={requesting} error={error} />
        )}

        {effectiveStatus === 'complete' && certnReport && (
          <ReportDisplay report={certnReport} />
        )}
      </CardContent>
    </Card>
  )
}

function NotOrdered({
  requesting,
  error,
  onRequest,
}: {
  requesting: boolean
  error: string | null
  onRequest: () => void
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400 leading-relaxed">
        Send the tenant an invitation to complete a verified credit, criminal, and eviction check
        through our secure partner. <span className="text-slate-300 font-medium">Tenant pays directly — no charge to you.</span>
      </p>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { label: 'Credit Check',      icon: '📊' },
          { label: 'Criminal Record',   icon: '🔍' },
          { label: 'Eviction History',  icon: '🏠' },
        ].map(item => (
          <div
            key={item.label}
            className="rounded-xl py-3 px-2"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
          >
            <div className="text-lg mb-1">{item.icon}</div>
            <p className="text-xs text-slate-400 font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      <div
        className="flex items-start gap-2 rounded-xl p-3 text-xs text-slate-400"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <ExternalLink className="w-3.5 h-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
        Powered by Certn — the tenant will receive an email invitation, pay $35, and consent
        before any check runs. Results appear here automatically when complete.
      </div>

      {error && (
        <div
          className="flex items-start gap-2 rounded-xl p-3"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      <button
        onClick={onRequest}
        disabled={requesting}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        style={{
          background: requesting
            ? 'rgba(139,92,246,0.4)'
            : 'linear-gradient(135deg, #7C3AED, #6D28D9)',
          border: '1px solid rgba(139,92,246,0.4)',
        }}
      >
        <ShieldCheck className="w-4 h-4" />
        {requesting ? 'Sending Invitation…' : 'Request Full Background Check'}
      </button>
    </div>
  )
}

function PendingState() {
  return (
    <div
      className="flex items-start gap-4 rounded-xl p-5"
      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
    >
      <Clock className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
      <div>
        <p className="text-sm font-semibold text-amber-300">Background Check In Progress</p>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          The tenant has been sent an email invitation from Certn. Once they complete the check and
          pay the $35 fee, results will appear here automatically.
        </p>
      </div>
    </div>
  )
}

function FailedState({
  onRetry,
  requesting,
  error,
}: {
  onRetry: () => void
  requesting: boolean
  error: string | null
}) {
  return (
    <div className="space-y-4">
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-400">Background Check Failed</p>
          <p className="text-xs text-slate-400 mt-1">
            The check could not be completed. You can try requesting a new one.
          </p>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
      <button
        onClick={onRetry}
        disabled={requesting}
        className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
        style={{ background: 'linear-gradient(135deg, #7C3AED, #6D28D9)' }}
      >
        {requesting ? 'Sending…' : 'Retry Background Check'}
      </button>
    </div>
  )
}

function ReportDisplay({ report }: { report: CertnReport }) {
  const items = [
    {
      label:  'Credit Score',
      value:  report.credit_score != null ? String(report.credit_score) : 'Not available',
      status: report.credit_score != null
        ? (report.credit_score >= 650 ? 'good' : report.credit_score >= 580 ? 'warn' : 'bad')
        : 'neutral',
    },
    {
      label:  'Eviction History',
      value:  report.eviction_history === 'clear'   ? 'Clear'
            : report.eviction_history === 'flagged' ? 'Flagged'
            : 'Not available',
      status: report.eviction_history === 'clear'   ? 'good'
            : report.eviction_history === 'flagged' ? 'bad'
            : 'neutral',
    },
    {
      label:  'Criminal Record',
      value:  report.criminal_record === 'clear'   ? 'Clear'
            : report.criminal_record === 'flagged' ? 'Flagged'
            : 'Not available',
      status: report.criminal_record === 'clear'   ? 'good'
            : report.criminal_record === 'flagged' ? 'bad'
            : 'neutral',
    },
    {
      label:  'Identity Verification',
      value:  report.identity_verification === 'verified' ? 'Verified'
            : report.identity_verification === 'failed'   ? 'Failed'
            : report.identity_verification === 'pending'  ? 'Pending'
            : 'Not available',
      status: report.identity_verification === 'verified' ? 'good'
            : report.identity_verification === 'failed'   ? 'bad'
            : 'neutral',
    },
  ]

  const statusStyle = {
    good:    { color: '#34D399', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)',  Icon: CheckCircle  },
    warn:    { color: '#FCD34D', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)',  Icon: AlertTriangle },
    bad:     { color: '#F87171', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.2)',   Icon: AlertTriangle },
    neutral: { color: '#94A3B8', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', Icon: null },
  }

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        {items.map(item => {
          const s = statusStyle[item.status as keyof typeof statusStyle]
          return (
            <div
              key={item.label}
              className="rounded-xl p-4"
              style={{ background: s.bg, border: `1px solid ${s.border}` }}
            >
              <p className="text-xs text-slate-500 mb-1.5">{item.label}</p>
              <div className="flex items-center gap-2">
                {s.Icon && <s.Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />}
                <p className="text-sm font-semibold" style={{ color: s.color }}>{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {report.overall_recommendation && (
        <div
          className="rounded-xl p-4"
          style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
        >
          <p className="text-xs text-slate-500 mb-1">Certn Overall Recommendation</p>
          <p className="text-sm font-semibold text-violet-300">{report.overall_recommendation}</p>
        </div>
      )}

      <p className="text-xs text-slate-600 leading-relaxed border-t pt-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        This report was generated by Certn and reflects data at the time the check was completed.
        Certn is a licensed consumer reporting agency. Use this information in compliance with
        applicable fair housing and credit reporting laws.
      </p>
    </div>
  )
}
