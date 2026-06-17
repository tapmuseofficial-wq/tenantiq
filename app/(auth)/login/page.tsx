'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import { checkEmailExists } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'

// No zod — we validate manually in onSubmit so we control every error message
interface FormData {
  email: string
  password: string
}

type ErrorType = 'empty' | 'invalid_email' | 'wrong_password' | 'no_account' | 'unknown'

interface LoginError {
  type: ErrorType
  message: string
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LoginForm() {
  const [error, setError] = useState<LoginError | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  // Guard against open-redirect attacks: only allow same-origin relative paths.
  // A value like "https://evil.com" starts with a protocol, "//evil.com" starts
  // with a double-slash — both are rejected in favour of the safe default.
  const rawRedirect = searchParams.get('redirect') || '/dashboard'
  const redirect = rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
    ? rawRedirect
    : '/dashboard'

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>()

  async function onSubmit(data: FormData) {
    setError(null)

    // 1. Empty fields
    if (!data.email.trim() || !data.password) {
      setError({ type: 'empty', message: 'Please enter your email and password.' })
      return
    }

    // 2. Invalid email format
    if (!EMAIL_RE.test(data.email.trim())) {
      setError({ type: 'invalid_email', message: 'Please enter a valid email address.' })
      return
    }

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: data.email.trim(),
      password: data.password,
    })

    if (!authError) {
      router.push(redirect)
      router.refresh()
      return
    }

    // 3 & 4. Auth failed — use the admin API to distinguish the two cases
    const exists = await checkEmailExists(data.email.trim())
    if (!exists) {
      setError({ type: 'no_account', message: 'No account found with this email.' })
    } else {
      setError({ type: 'wrong_password', message: 'Incorrect password. Please try again.' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        {...register('password')}
      />

      {error && (
        <div
          className="rounded-xl p-3.5"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-400">
              {error.message}
              {error.type === 'no_account' && (
                <>
                  {' '}
                  <Link
                    href="/signup"
                    className="font-semibold underline underline-offset-2 hover:text-red-300 transition-colors"
                  >
                    Sign up free instead.
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
        Sign in
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Welcome back</h1>
        <p className="text-slate-400 mt-1.5 text-sm">Sign in to your TenantIQ account</p>
      </div>

      <div
        className="rounded-2xl p-8"
        style={{
          background: 'rgba(15,22,41,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        <Suspense fallback={<div className="h-40 animate-pulse rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />}>
          <LoginForm />
        </Suspense>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Sign up free
        </Link>
      </p>
    </div>
  )
}
