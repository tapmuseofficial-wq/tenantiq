'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signupAction } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle } from 'lucide-react'

// Client-side schema mirrors the server-side one — used only for instant UX
// feedback. The server action re-validates independently and is the authority.
const schema = z.object({
  full_name: z.string().min(2, 'Please enter your name'),
  email:     z.string().email('Please enter a valid email'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const [errorState, setErrorState] = useState<{ text: string; showSignIn: boolean } | null>(null)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setErrorState(null)

    // All rate-limiting, deduplication, and auth happen server-side.
    const result = await signupAction(data.full_name, data.email, data.password)

    if ('success' in result) {
      router.push('/dashboard')
      return
    }

    setErrorState({
      text:       result.error,
      showSignIn: result.type === 'already_exists',
    })
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

          {errorState && (
            <div
              className="rounded-xl p-3.5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">
                  {errorState.text}
                  {errorState.showSignIn && (
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
