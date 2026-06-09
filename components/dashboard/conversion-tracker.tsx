'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function ConversionTracker() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get('upgraded') !== 'true') return

    // Fire once per page load — gtag is defined globally by the Google tag in layout.tsx
    if (typeof gtag === 'function') {
      gtag('event', 'conversion', {
        send_to: 'AW-18214503686/xONcCLOxg7ocEIaKre1D',
        transaction_id: '',
      })
    }

    // Reddit Purchase conversion — rdt is defined globally by the Reddit pixel in layout.tsx
    if (typeof (window as any).rdt === 'function') {
      ;(window as any).rdt('track', 'Purchase')
    }
  }, [searchParams])

  return null
}
