'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Invisible client component that calls router.refresh() every 5 seconds
 * when `active` is true (i.e. when any application on the page is still
 * being analyzed). Unmounts cleanly when all analysis is complete.
 */
export function AutoRefresh({ active }: { active: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (!active) return
    const id = setInterval(() => router.refresh(), 5000)
    return () => clearInterval(id)
  }, [active, router])

  return null
}
