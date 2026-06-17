'use server'

import { z } from 'zod'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { assertAllowlistedUrl } from '@/lib/ssrf'

// ─── Schemas ────────────────────────────────────────────────────────────────

const emailSchema   = z.string().email().max(254).trim()
const passwordSchema = z.string().min(1).max(128)

const loginSchema = z.object({
  email:    emailSchema,
  password: passwordSchema,
})

const signupSchema = z.object({
  full_name: z.string().min(2).max(100).trim(),
  email:     emailSchema,
  password:  z.string().min(8).max(128),
})

// ─── IP helper (never trust client-supplied values) ──────────────────────────

function getIp(): string {
  const h = headers()
  return (
    h.get('x-forwarded-for')?.split(',')[0].trim() ??
    h.get('x-real-ip') ??
    'unknown'
  )
}

// ─── checkEmailExists ────────────────────────────────────────────────────────

/**
 * Checks whether an email has a Supabase auth account via the GoTrue admin API.
 * Called only after a signInWithPassword failure to distinguish
 * "wrong password" from "no account". Returns false on any error.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  if (!emailSchema.safeParse(email).success) return false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) return false

  // SSRF guard: confirm the env var is an HTTPS Supabase host before fetching.
  // This blocks accidental misconfiguration that would send the service-role
  // key to an internal or unintended host.
  const fetchUrl = `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`
  let supabaseHost: string
  try {
    supabaseHost = new URL(supabaseUrl).hostname
    assertAllowlistedUrl(fetchUrl, [supabaseHost])
  } catch (err) {
    console.error('[checkEmailExists] SSRF guard rejected URL:', err instanceof Error ? err.message : err)
    return false
  }

  try {
    const res = await fetch(fetchUrl, {
      headers: {
        apikey:        serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
      cache: 'no-store',
    })
    if (!res.ok) return false
    const data = await res.json()
    return Array.isArray(data.users) && data.users.length > 0
  } catch {
    return false
  }
}

// ─── loginAction ─────────────────────────────────────────────────────────────

export type LoginResult =
  | { success: true }
  | { error: string; type: 'rate_limited' | 'validation' | 'no_account' | 'wrong_password' | 'unknown' }

/**
 * Server-side login gate: rate-limits by IP, validates inputs, signs in via
 * Supabase, and sets the session cookie. The client calls router.refresh()
 * after a successful result to pick up the new auth state.
 */
export async function loginAction(email: string, password: string): Promise<LoginResult> {
  const ip = getIp()

  // 5 attempts per IP per 15 minutes
  const { allowed } = checkRateLimit(`auth:login:${ip}`, 5, 15 * 60 * 1000)
  if (!allowed) {
    return { error: 'Too many login attempts. Please try again in 15 minutes.', type: 'rate_limited' }
  }

  const parsed = loginSchema.safeParse({ email, password })
  if (!parsed.success) {
    return { error: 'Invalid email or password format.', type: 'validation' }
  }

  const supabase = createClient()
  const { error: authError } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  })

  if (!authError) {
    return { success: true }
  }

  // Distinguish "wrong password" from "no account" for UX — both are
  // auth failures but we can offer a helpful hint.
  const exists = await checkEmailExists(parsed.data.email)
  if (!exists) {
    return { error: 'No account found with this email.', type: 'no_account' }
  }
  return { error: 'Incorrect password. Please try again.', type: 'wrong_password' }
}

// ─── signupAction ────────────────────────────────────────────────────────────

export type SignupResult =
  | { success: true }
  | { error: string; type: 'rate_limited' | 'validation' | 'already_exists' | 'unknown' }

/**
 * Server-side signup gate: rate-limits by IP, validates inputs, creates the
 * Supabase user, and sets the session cookie.
 */
export async function signupAction(
  full_name: string,
  email:     string,
  password:  string,
): Promise<SignupResult> {
  const ip = getIp()

  // 3 signups per IP per hour — stricter than login since account creation is
  // more expensive and abuse (e.g. bulk account farming) is harder to reverse.
  const { allowed } = checkRateLimit(`auth:signup:${ip}`, 3, 60 * 60 * 1000)
  if (!allowed) {
    return { error: 'Too many sign-up attempts. Please try again later.', type: 'rate_limited' }
  }

  const parsed = signupSchema.safeParse({ full_name, email, password })
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'Invalid input.'
    return { error: first, type: 'validation' }
  }

  const supabase = createClient()
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options:  { data: { full_name: parsed.data.full_name } },
  })

  if (authError) {
    console.error('[signupAction] authError:', { message: authError.message, status: authError.status })
    const msg = authError.message.toLowerCase()
    if (msg.includes('already registered') || msg.includes('already been registered') || msg.includes('user already exists')) {
      return { error: 'An account with this email already exists.', type: 'already_exists' }
    }
    if (msg.includes('rate limit') || msg.includes('over_email')) {
      return { error: 'Too many attempts. Please wait a few minutes.', type: 'rate_limited' }
    }
    return { error: 'Sign-up failed. Please try again.', type: 'unknown' }
  }

  // Supabase silently returns no error but an empty identities array when the
  // email is already registered (enumeration-protection on their side).
  if (authData.user?.identities?.length === 0) {
    return { error: 'An account with this email already exists.', type: 'already_exists' }
  }

  if (!authData.user) {
    console.error('[signupAction] unexpected response — no user:', authData)
    return { error: 'Sign-up failed. Please try again.', type: 'unknown' }
  }

  return { success: true }
}
