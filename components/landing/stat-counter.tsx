'use client'

import { useEffect, useRef, useState } from 'react'

interface Stat {
  label: string
  value: number
  suffix?: string
  color: string
}

function useCountUp(target: number, duration = 1400): number {
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)

  useEffect(() => {
    if (target === 0) return
    startTime.current = null

    function step(now: number) {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) rafId.current = requestAnimationFrame(step)
    }

    rafId.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId.current)
  }, [target, duration])

  return count
}

function AnimatedStat({ label, value, suffix = '', color }: Stat) {
  const count = useCountUp(value)
  const display = value === 0 ? '—' : `${count.toLocaleString()}${suffix}`

  return (
    <div className="text-center flex-1 min-w-0">
      <div
        className="text-2xl sm:text-4xl font-extrabold mb-1 tabular-nums"
        style={{ color }}
      >
        {display}
      </div>
      <div className="text-xs sm:text-sm text-slate-500 whitespace-nowrap">{label}</div>
    </div>
  )
}

export function LiveStatBar() {
  const [stats, setStats] = useState<{ screenings: number; reviews: number; landlords: number } | null>(null)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const screenings = stats?.screenings ?? 0
  const reviews    = stats?.reviews    ?? 0
  const landlords  = stats?.landlords  ?? 0

  return (
    <section className="relative">
      <div
        className="max-w-5xl mx-auto px-5 sm:px-8 py-8 sm:py-10 rounded-2xl mx-5 sm:mx-8"
        style={{
          background: 'rgba(15,22,41,0.7)',
          border:     '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Section label */}
        <p className="text-center text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-6">
          Live network stats
        </p>

        <div
          className="flex items-center justify-center gap-6 sm:gap-16"
        >
          {/* Dividers only on sm+ */}
          <AnimatedStat
            label="Tenants Screened"
            value={screenings}
            color="#60A5FA"
          />
          <div className="hidden sm:block w-px h-10 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <AnimatedStat
            label="Community Reviews"
            value={reviews}
            color="#A78BFA"
          />
          <div className="hidden sm:block w-px h-10 flex-shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <AnimatedStat
            label="Landlords"
            value={landlords}
            color="#34D399"
          />
        </div>
      </div>
    </section>
  )
}
