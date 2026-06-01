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
    icon: 'bg-blue-500/20 text-blue-400',
    value: 'text-blue-100',
  },
  green: {
    card: 'stat-card-green',
    icon: 'bg-emerald-500/20 text-emerald-400',
    value: 'text-emerald-100',
  },
  yellow: {
    card: 'stat-card-yellow',
    icon: 'bg-amber-500/20 text-amber-400',
    value: 'text-amber-100',
  },
  purple: {
    card: 'stat-card-purple',
    icon: 'bg-violet-500/20 text-violet-400',
    value: 'text-violet-100',
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
    <div className={cn('rounded-2xl p-5 backdrop-blur-sm', v.card)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className={cn('mt-2 text-3xl font-bold tracking-tight', v.value)}>{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
        </div>
        <div className={cn('p-2.5 rounded-xl flex-shrink-0 ml-3', v.icon)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}
