'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Link2, BarChart3, X } from 'lucide-react'

const STEPS = [
  {
    icon: Link2,
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.12)',
    title: 'Create a Property',
    desc: 'Add your rental listing once. TenantIQ gives you a unique screening link you can re-use for every applicant.',
  },
  {
    icon: Sparkles,
    color: '#8B5CF6',
    bg: 'rgba(139,92,246,0.12)',
    title: 'Share the Screening Link',
    desc: 'Copy the link and send it by text, WhatsApp, or email. Tenants fill out a 5-minute form on any phone or laptop.',
  },
  {
    icon: BarChart3,
    color: '#10B981',
    bg: 'rgba(16,185,129,0.12)',
    title: 'Get your AI Report',
    desc: 'TenantIQ scores the applicant 0–100, verifies income from their documents, and gives you an approve / review / decline recommendation — automatically.',
  },
]

export function OnboardingModal({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const key = `tenantiq_onboarded_${userId}`
    if (!localStorage.getItem(key)) setOpen(true)
  }, [userId])

  function dismiss() {
    localStorage.setItem(`tenantiq_onboarded_${userId}`, '1')
    setOpen(false)
    // Send them straight to create their first property
    router.push('/dashboard/properties/new')
  }

  function close() {
    localStorage.setItem(`tenantiq_onboarded_${userId}`, '1')
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-lg rounded-2xl p-8 relative"
        style={{
          background: '#0F1629',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 text-slate-600 hover:text-slate-400 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', boxShadow: '0 0 24px rgba(59,130,246,0.4)' }}
          >
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-100">Welcome to TenantIQ</h2>
          <p className="text-sm text-slate-500 mt-1">Screen better tenants in 3 steps</p>
        </div>

        {/* Steps */}
        <div className="space-y-4 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.bg, border: `1px solid ${s.color}33` }}
              >
                <s.icon className="w-5 h-5" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">
                  <span className="text-slate-600 mr-2">{i + 1}.</span>
                  {s.title}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={dismiss}
          className="w-full py-3.5 rounded-xl text-white font-bold text-sm transition-all hover:opacity-90"
          style={{
            background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            boxShadow: '0 0 24px rgba(59,130,246,0.35)',
          }}
        >
          Got it — let&apos;s create my first screening link →
        </button>
      </div>
    </div>
  )
}
