'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Check, X, MessageCircle, Mail, ArrowRight } from 'lucide-react'

interface LinkShareModalProps {
  propertyId: string
  propertyName: string
  screeningToken: string
  appUrl: string
}

export function LinkShareModal({ propertyId, propertyName, screeningToken, appUrl }: LinkShareModalProps) {
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const link = `${appUrl}/apply/${screeningToken}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback: select the text in the input
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Hi! Please fill out this rental application: ${link}`)}`
  const emailUrl   = `mailto:?subject=${encodeURIComponent(`Rental Application — ${propertyName}`)}&body=${encodeURIComponent(`Hi,\n\nPlease complete your rental application using this secure link:\n${link}\n\nIt only takes 5 minutes on any phone or computer.\n\nThanks`)}`

  function goToProperty() {
    router.push(`/dashboard/properties/${propertyId}`)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-7 relative"
        style={{
          background: '#0F1629',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-1">
          <h2 className="font-bold text-slate-100">Your screening link is ready! 🎉</h2>
          <button onClick={goToProperty} className="text-slate-600 hover:text-slate-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-slate-500 mb-6">
          Send this link to your tenant — they fill out the form and you get an AI report automatically.
        </p>

        {/* Link display */}
        <div
          className="rounded-xl px-4 py-3.5 mb-3 font-mono text-sm text-slate-300 break-all leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)' }}
        >
          {link}
        </div>

        {/* Copy button */}
        <button
          onClick={copyLink}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl font-bold text-sm text-white mb-4 transition-all"
          style={{
            background: copied
              ? 'linear-gradient(135deg, #10B981, #059669)'
              : 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
            boxShadow: '0 0 20px rgba(59,130,246,0.3)',
          }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>

        {/* Share buttons */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'rgba(37,211,102,0.15)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </a>
          <a
            href={emailUrl}
            className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90"
            style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}
          >
            <Mail className="w-4 h-4" />
            Email
          </a>
        </div>

        {/* Go to property */}
        <button
          onClick={goToProperty}
          className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          Go to property page
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
