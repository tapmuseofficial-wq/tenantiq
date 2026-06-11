'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Mail } from 'lucide-react'

const schema = z.object({
  full_name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

function friendlyError(message: string): { text: string; showSignIn: boolean } {
  const msg = message.toLowerCase()
  if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already exists')) {
    return { text: 'An account with this email already exists.', showSignIn: true }
  }
  if (msg.includes('rate limit') || msg.includes('email rate') || msg.includes('over_email')) {
    return { text: 'Too many attempts. Please wait a few minutes and try again.', showSignIn: false }
  }
  if (msg.includes('password')) {
    return { text: 'Password is too weak. Please choose a stronger password.', showSignIn: false }
  }
  if (msg.includes('invalid email') || msg.includes('unable to validate email')) {
    return { text: 'Please enter a valid email address.', showSignIn: false }
  }
  if (msg.includes('signup') && msg.includes('disabled')) {
    return { text: 'Sign-ups are currently disabled. Please contact support.', showSignIn: false }
  }
  return { text: message || 'Something went wrong. Please try again.', showSignIn: false }
}

export default function SignupPage() {
  const [error, setError] = useState<{ text: string; showSignIn: boolean } | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setError(null)

    let authData, authError
    try {
      const supabase = createClient()
      const result = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { full_name: data.full_name },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      authData = result.data
      authError = result.error
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error('[signup] supabase.auth.signUp threw:', err)
      setError({ text: `Sign-up failed: ${message}`, showSignIn: false })
      return
    }

    if (authError) {
      console.error('[signup] authError:', {
        message: authError.message,
        status: authError.status,
        name: authError.name,
      })
      setError(friendlyError(authError.message))
      return
    }

    // Supabase returns error: null but identities: [] when the email is already
    // registered — this is intentional enumeration protection on their side, but
    // it silently swallows the error. We detect and surface it explicitly.
    if (authData.user && authData.user.identities?.length === 0) {
      setError({ text: 'An account with this email already exists.', showSignIn: true })
      return
    }

    // Unexpected: no user object returned at all — log the full response so we
    // can see exactly what Supabase returned in the browser console / Vercel logs.
    if (!authData.user) {
      console.error('[signup] unexpected response — no user object:', authData)
      setError({ text: `Sign-up failed: unexpected response from Supabase (no user returned). Check the browser console for details.`, showSignIn: false })
      return
    }

    setSubmittedEmail(data.email)
  }

  if (submittedEmail) {
    return (
      <div className="w-full max-w-sm">
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(15,22,41,0.8)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 4px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              background: 'rgba(16,185,129,0.15)',
              border: '1px solid rgba(16,185,129,0.3)',
              boxShadow: '0 0 30px rgba(16,185,129,0.15)',
            }}
          >
            <Mail className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-100 mb-2">Check your email</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We sent a confirmation link to{' '}
            <span className="font-semibold text-slate-300">{submittedEmail}</span>.
            Click the link to confirm your account and start screening tenants.
          </p>
          <p className="text-xs text-slate-600 mt-4">Didn&apos;t get it? Check your spam folder.</p>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already confirmed?{' '}
          <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Create your account</h1>
        <p className="text-slate-400 mt-1.5 text-sm">Start screening tenants for free</p>
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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="Jane Smith"
            autoComplete="name"
            {...register('full_name')}
            error={errors.full_name?.message}
          />
          <Input
            label="Email"
            type="email"
            placeholder="jane@example.com"
            autoComplete="email"
            {...register('email')}
            error={errors.email?.message}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            hint="Must be at least 8 characters"
            {...register('password')}
            error={errors.password?.message}
          />

          {error && (
            <div
              className="rounded-xl p-3.5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">
                  {error.text}
                  {error.showSignIn && (
                    <>
                      {' '}
                      <Link
                        href="/login"
                        className="font-semibold underline underline-offset-2 hover:text-red-300 transition-colors"
                      >
                        Sign in instead.
                      </Link>
                    </>
                  )}
                </p>
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" loading={isSubmitting} size="lg">
            Create account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  )
}
