'use client'

import { useEffect } from 'react'

declare const gtag: (...args: unknown[]) => void

export function ConversionTracker({ conversionId }: { conversionId?: string }) {
  useEffect(() => {
    if (!window.location.search.includes('upgraded=true')) return
    if (typeof gtag !== 'undefined') {
      gtag('event', 'conversion', {
        send_to: 'AW-18214503686/xONcCLOxg7ocEIaKre1D',
        transaction_id: Date.now().toString(),
      })
    }
  }, [])

  useEffect(() => {
    if (!conversionId) return
    if (typeof (window as any).rdt === 'function') {
      ;(window as any).rdt('track', 'Purchase', { conversionId })
    }
  }, [conversionId])

  return null
}
