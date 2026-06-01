'use client'

import { cn } from '@/lib/utils'
import { forwardRef, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0F1E] disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden',
          {
            'bg-blue-500 hover:bg-blue-400 text-white focus:ring-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.35)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)]': variant === 'primary',
            'bg-white/[0.08] hover:bg-white/[0.13] text-slate-200 border border-white/[0.1] focus:ring-white/20': variant === 'secondary',
            'border border-white/[0.12] hover:bg-white/[0.06] text-slate-300 focus:ring-white/20 bg-transparent': variant === 'outline',
            'hover:bg-white/[0.06] text-slate-400 hover:text-slate-200 focus:ring-white/20': variant === 'ghost',
            'bg-red-500/90 hover:bg-red-500 text-white focus:ring-red-500 shadow-[0_0_20px_rgba(239,68,68,0.25)]': variant === 'danger',
          },
          {
            'text-xs px-3 py-1.5 gap-1.5': size === 'sm',
            'text-sm px-4 py-2.5 gap-2': size === 'md',
            'text-base px-7 py-3.5 gap-2.5': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'

export { Button }
