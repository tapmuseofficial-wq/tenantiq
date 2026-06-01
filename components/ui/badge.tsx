import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
        {
          'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25': variant === 'green',
          'bg-amber-500/15 text-amber-400 border border-amber-500/25': variant === 'yellow',
          'bg-red-500/15 text-red-400 border border-red-500/25': variant === 'red',
          'bg-blue-500/15 text-blue-400 border border-blue-500/25': variant === 'blue',
          'bg-white/[0.06] text-slate-400 border border-white/[0.08]': variant === 'gray',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
