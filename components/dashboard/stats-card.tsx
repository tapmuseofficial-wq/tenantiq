import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: 'blue' | 'green' | 'yellow' | 'purple'
}

const variants = {
  blue: {
    card: 'stat-card-blue',
    icon: 'bg-blue-500/15 text-blue-400',
    value: 'text-slate-100',
    accent: 'bg-blue-400',
  },
  green: {
    card: 'stat-card-green',
    icon: 'bg-emerald-500/15 text-emerald-400',
    value: 'text-slate-100',
    accent: 'bg-emerald-400',
  },
  yellow: {
    card: 'stat-card-yellow',
    icon: 'bg-amber-500/15 text-amber-400',
    value: 'text-slate-100',
    accent: 'bg-amber-400',
  },
  purple: {
    card: 'stat-card-purple',
    icon: 'bg-violet-500/15 text-violet-400',
    value: 'text-slate-100',
    accent: 'bg-violet-400',
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
}: StatsCardProps) {
  const v = variants[variant]
  return (
    <div className={cn('rounded-2xl p-5 backdrop-blur-sm stat-card-interactive', v.card)}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn('h-0.5 w-8 rounded-full opacity-70', v.accent)} />
        <div className={cn('p-2.5 rounded-xl flex-shrink-0', v.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</p>
        <p className={cn('mt-1.5 text-3xl font-bold tracking-tight', v.value)}>{value}</p>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}
