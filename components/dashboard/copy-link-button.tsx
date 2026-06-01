'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyLinkButton({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/apply/${token}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 flex-shrink-0"
      style={copied ? {
        background: 'rgba(16,185,129,0.15)',
        border: '1px solid rgba(16,185,129,0.25)',
        color: '#34D399',
      } : {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#94A3B8',
      }}
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}
