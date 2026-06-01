'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CheckoutButtonProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  // Where to send unauthenticated users (landing page → signup, dashboard → login)
  redirectIfLoggedOut?: string
}

export function CheckoutButton({
  children,
  className,
  style,
  redirectIfLoggedOut = '/signup',
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleClick() {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/stripe/create-checkout', { method: 'POST' })
      const data = await res.json()

      if (res.status === 401) {
        router.push(redirectIfLoggedOut)
        return
      }

      if (!res.ok || !data.url) {
        setError(data.error ?? 'Failed to start checkout. Please try again.')
        return
      }

      // Hard-navigate so the browser sends the user to Stripe's hosted page
      window.location.href = data.url
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className={className}
        style={style}
      >
        {loading ? 'Redirecting…' : children}
      </button>
      {error && (
        <p className="text-xs text-red-400 mt-2 text-center">{error}</p>
      )}
    </div>
  )
}
