'use client'

import { useEffect, useRef, useState } from 'react'

// Base numbers added to real DB counts so the counter looks active even
// when the database is small. Real count + base = displayed number.
const BASE = { screenings: 10, reviews: 5, landlords: 8 }

function useCountUp(target: number, duration = 1500): number {
  const [count, setCount] = useState(0)
  const startRef = useRef<number | null>(null)
  const rafRef   = useRef<number>(0)
  const fromRef  = useRef<number>(0)

  useEffect(() => {
    // Always animate, even from 0 to small base numbers.
    fromRef.current  = count        // animate from wherever we currently are
    startRef.current = null

    function step(now: number) {
      if (startRef.current === null) startRef.current = now
      const elapsed  = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased    = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCount(Math.round(fromRef.current + eased * (target - fromRef.current)))
      if (progress < 1) rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return count
}

function AnimatedStat({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const count   = useCountUp(value)
  // Always show "+" suffix to indicate there are more beyond the displayed count
  const display = `${count.toLocaleString()}+`

  return (
    <div className="text-center flex-1 min-w-0">
      <div
        className="text-2xl sm:text-4xl font-extrabold mb-1 tabular-nums"
        style={{ color }}
      >
        {display}
      </div>
      <div className="text-[11px] sm:text-sm text-slate-500 whitespace-nowrap">{label}</div>
    </div>
  )
}

export function LiveStatBar() {
  // Start with base numbers so the animation plays immediately on mount —
  // no blank/dash state while the fetch is in-flight.
  const [stats, setStats] = useState({ screenings: 0, reviews: 0, landlords: 0 })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data: { screenings: number; reviews: number; landlords: number }) => {
        setStats(data)
        setLoaded(true)
      })
      .catch(() => {
        // On failure, keep base numbers — counter is still meaningful
        setLoaded(true)
      })
  }, [])

  const screenings = stats.screenings + BASE.screenings
  const reviews    = stats.reviews    + BASE.reviews
  const landlords  = stats.landlords  + BASE.landlords

  return (
    <section>
      <div
        className="rounded-2xl px-6 sm:px-10 py-8 sm:py-10"
        style={{
          background:     'rgba(15,22,41,0.7)',
          border:         '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Heading */}
        <p className="text-center text-[10px] sm:text-xs font-bold text-slate-600 uppercase tracking-widest mb-3">
          Live network stats
        </p>

        {/* Description */}
        <p className="text-center text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xl mx-auto mb-8">
          Every applicant is automatically cross-checked against our growing database of tenant
          reviews submitted by landlords across Canada and the USA. Matched by email, phone
          number, name and city — not just names alone.
        </p>

        {/* Counters */}
        <div className="flex items-center justify-center gap-6 sm:gap-16">
          <AnimatedStat
            label="Tenants Screened"
            value={screenings}
            color="#60A5FA"
          />
          <div
            className="hidden sm:block w-px h-10 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <AnimatedStat
            label="Community Reviews"
            value={reviews}
            color="#A78BFA"
          />
          <div
            className="hidden sm:block w-px h-10 flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.07)' }}
          />
          <AnimatedStat
            label="Landlords"
            value={landlords}
            color="#34D399"
          />
        </div>

        {/* Subtle loading indicator — disappears once data is confirmed */}
        {!loaded && (
          <p className="text-center text-[10px] text-slate-700 mt-5">Updating…</p>
        )}
      </div>
    </section>
  )
}
