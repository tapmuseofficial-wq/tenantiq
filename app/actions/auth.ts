'use server'

import { z } from 'zod'

const emailSchema = z.string().email().max(254)

/**
 * Checks whether an email has a Supabase auth account by calling the GoTrue
 * admin API directly (the JS SDK for this version lacks getUserByEmail).
 * Called only after a signInWithPassword failure so we can show
 * "wrong password" vs "no account found" instead of one generic message.
 * Returns false on any error so the caller falls back gracefully.
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  // Validate format before calling the admin API — prevents arbitrary strings
  // being forwarded to Supabase and avoids unnecessary admin round-trips.
  if (!emailSchema.safeParse(email).success) return false

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) return false

  try {
    const res = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?email=${encodeURIComponent(email)}&page=1&per_page=1`,
      {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}`,
        },
        cache: 'no-store',
      }
    )
    if (!res.ok) return false
    const data = await res.json()
    return Array.isArray(data.users) && data.users.length > 0
  } catch {
    return false
  }
}
