'use client'

import { useState } from 'react'
import { X, ThumbsUp, ThumbsDown, CheckCircle, AlertCircle } from 'lucide-react'

interface RatingModalProps {
  applicationId: string
  tenantName: string
}

type Step = 'prompt' | 'positive-form' | 'negative-form' | 'done' | 'skipped'
type Rating = 'positive' | 'negative'

export function RatingPrompt({ applicationId, tenantName }: RatingModalProps) {
  const [step,        setStep]        = useState<Step>('prompt')
  const [description, setDescription] = useState('')
  const [submitting,  setSubmitting]  = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [newCredits,  setNewCredits]  = useState<number | null>(null)

  async function submit(rating: Rating) {
    setSubmitting(true)
    setError(null)

    const res = await fetch('/api/ratings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ application_id: applicationId, rating, description: description || undefined }),
    })

    const data = await res.json()
    setSubmitting(false)

    if (!res.ok) {
      setError(data.error ?? 'Failed to submit. Please try again.')
      return
    }

    setNewCredits(data.new_credits ?? null)
    setStep('done')
  }

  if (step === 'skipped') return null

  if (step === 'done') {
    return (
      <div
        className="rounded-2xl p-6 flex items-start gap-4"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
      >
        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-emerald-400">Thanks for contributing!</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Your rating helps other landlords in the TenantIQ community.
            {newCredits !== null && (
              <span className="font-semibold text-emerald-300"> +1 free screening credit added to your account (total: {newCredits}).</span>
            )}
          </p>
        </div>
      </div>
    )
  }

  if (step === 'positive-form') {
    return (
      <Modal title={`Rate ${tenantName}`} onClose={() => setStep('prompt')}>
        <p className="text-sm text-slate-400 mb-4">
          Would you like to add anything about this tenant? <span className="text-slate-500">(optional)</span>
        </p>
        <textarea
          className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 90 }}
          placeholder="e.g. Always paid on time, kept the unit clean, great communication…"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={2000}
        />
        {error && <ErrorBox message={error} />}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => submit('positive')}
            disabled={submitting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            {submitting ? 'Submitting…' : '👍 Submit positive rating'}
          </button>
          <button onClick={() => setStep('prompt')} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Back
          </button>
        </div>
      </Modal>
    )
  }

  if (step === 'negative-form') {
    const tooShort = description.trim().length < 50
    return (
      <Modal title={`Rate ${tenantName}`} onClose={() => setStep('prompt')}>
        <p className="text-sm text-slate-400 mb-1">
          What happened? <span className="text-slate-300 font-medium">Be specific and honest.</span>
        </p>
        <p className="text-xs text-slate-500 mb-3">Minimum 50 characters required. Your name is never shown to the tenant.</p>
        <textarea
          className="w-full rounded-xl px-4 py-3 text-sm text-slate-100 resize-none focus:outline-none focus:ring-1 focus:ring-red-500"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', minHeight: 110 }}
          placeholder="e.g. Missed 3 months of rent without notice, left the unit in poor condition…"
          value={description}
          onChange={e => setDescription(e.target.value)}
          maxLength={2000}
        />
        <p className="text-xs text-slate-500 mt-1 text-right">{description.trim().length}/50 min · {description.length}/2000 max</p>
        {error && <ErrorBox message={error} />}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => submit('negative')}
            disabled={submitting || tooShort}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
          >
            {submitting ? 'Submitting…' : '👎 Submit negative rating'}
          </button>
          <button onClick={() => setStep('prompt')} className="px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Back
          </button>
        </div>
      </Modal>
    )
  }

  // Default: prompt
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'rgba(15,22,41,0.75)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <p className="text-sm font-semibold text-slate-200 mb-1">
        How did your tenancy with <span className="text-blue-400">{tenantName}</span> go?
      </p>
      <p className="text-xs text-slate-500 mb-5">
        Your rating helps the TenantIQ community. You&apos;ll earn +1 free screening credit.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => { setDescription(''); setStep('positive-form') }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          <ThumbsUp className="w-4 h-4" /> Good Tenant
        </button>
        <button
          onClick={() => { setDescription(''); setStep('negative-form') }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #EF4444, #DC2626)' }}
        >
          <ThumbsDown className="w-4 h-4" /> Bad Tenant
        </button>
        <button
          onClick={() => setStep('skipped')}
          className="px-5 py-2.5 rounded-xl text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Skip for now
        </button>
      </div>
    </div>
  )
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 relative"
        style={{ background: '#0F1629', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-slate-100">{title}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 rounded-xl p-3 mt-3"
      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
    >
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-400">{message}</p>
    </div>
  )
}
