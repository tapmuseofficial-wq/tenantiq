'use client'

interface ScoreRingProps {
  score: number | null
  size?: 'sm' | 'md' | 'lg'
}

const CONFIG = {
  sm: { dim: 52, r: 20, sw: 5, fs: 12 },
  md: { dim: 72, r: 28, sw: 6, fs: 16 },
  lg: { dim: 128, r: 50, sw: 9, fs: 30 },
}

export function ScoreRing({ score, size = 'md' }: ScoreRingProps) {
  const { dim, r, sw, fs } = CONFIG[size]
  const center = dim / 2
  const circumference = 2 * Math.PI * r
  const pct = score !== null ? Math.max(0, Math.min(100, score)) / 100 : 0
  const dashOffset = circumference * (1 - pct)

  const color =
    score === null ? '#475569'
    : score >= 75 ? '#10B981'
    : score >= 55 ? '#F59E0B'
    : '#EF4444'

  const glowColor =
    score === null ? 'none'
    : score >= 75 ? 'rgba(16,185,129,0.6)'
    : score >= 55 ? 'rgba(245,158,11,0.6)'
    : 'rgba(239,68,68,0.6)'

  const filterId = `glow-${size}-${score ?? 'null'}`

  return (
    <div style={{ width: dim, height: dim, position: 'relative', flexShrink: 0 }}>
      <svg
        width={dim}
        height={dim}
        viewBox={`0 0 ${dim} ${dim}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        {/* Track */}
        <circle
          cx={center} cy={center} r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={sw}
        />
        {/* Progress arc */}
        {score !== null && (
          <circle
            cx={center} cy={center} r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 ${sw + 2}px ${glowColor})`,
              transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}
      </svg>
      {/* Center label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: fs, fontWeight: 700, color, lineHeight: 1 }}>
          {score === null ? '—' : score}
        </span>
      </div>
    </div>
  )
}
