'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  LogOut,
  Zap,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { CheckoutButton } from '@/components/ui/checkout-button'
import { Profile } from '@/types'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/properties', label: 'Properties', icon: Building2 },
]

interface SidebarProps {
  profile: Profile | null
}

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isBasic = profile?.subscription_status === 'basic'
  const creditsLeft = isBasic
    ? (profile?.screening_credits ?? 0)
    : Math.max(0, 3 - (profile?.screenings_used ?? 0))
  const totalCredits = isBasic ? 10 : 3
  const usedPct = Math.min(100, ((totalCredits - creditsLeft) / totalCredits) * 100)

  return (
    <aside
      className="w-64 flex-shrink-0 flex flex-col h-screen sticky top-0"
      style={{
        background: 'linear-gradient(180deg, #0D1428 0%, #0A0F1E 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Link href="/dashboard" className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
              boxShadow: '0 0 20px rgba(59,130,246,0.4)',
            }}
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-base font-bold text-slate-100 tracking-tight">TenantIQ</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-blue-300'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.04]'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.1) 100%)',
                border: '1px solid rgba(59,130,246,0.2)',
              } : {}}
            >
              <item.icon className={cn('w-4.5 h-4.5 flex-shrink-0', isActive ? 'text-blue-400' : 'text-slate-600')} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Plan status + Profile */}
      <div className="px-3 py-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {isBasic ? (
          <div
            className="rounded-xl p-3.5"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400">Basic Plan</span>
              <span className="text-xs text-slate-500 ml-auto">{creditsLeft} credits left</span>
            </div>
            <div className="w-full rounded-full h-1 mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{
                  width: `${usedPct}%`,
                  background: 'linear-gradient(90deg, #10B981, #3B82F6)',
                }}
              />
            </div>
            <CheckoutButton
              redirectIfLoggedOut="/login"
              className="w-full text-xs font-semibold text-white rounded-lg py-2 flex items-center justify-center gap-1.5 transition-all duration-200 hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
                boxShadow: '0 0 16px rgba(16,185,129,0.3)',
              }}
            >
              Get 10 more credits — $9
              <ChevronRight className="w-3 h-3" />
            </CheckoutButton>
          </div>
        ) : (
          <div
            className="rounded-xl p-3.5"
            style={{
              background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.15)',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-xs font-semibold text-blue-400">Free Plan</span>
              <span className="text-xs text-slate-500 ml-auto">{creditsLeft}/3 left</span>
            </div>
            <div className="w-full rounded-full h-1 mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{
                  width: `${usedPct}%`,
                  background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
                }}
              />
            </div>
            <CheckoutButton
              redirectIfLoggedOut="/login"
              className="w-full text-xs font-semibold text-white rounded-lg py-2 flex items-center justify-center gap-1.5 transition-all duration-200 hover:opacity-90 disabled:opacity-60"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
                boxShadow: '0 0 16px rgba(59,130,246,0.3)',
              }}
            >
              Get 10 credits — $9
              <ChevronRight className="w-3 h-3" />
            </CheckoutButton>
          </div>
        )}

        {/* Profile row */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)' }}
          >
            <span className="text-xs font-bold text-white">
              {(profile?.full_name || profile?.email || 'U').charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-300 truncate">
              {profile?.full_name || 'Landlord'}
            </p>
            <p className="text-xs text-slate-600 truncate">{profile?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-slate-600 hover:text-slate-400 transition-colors p-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
