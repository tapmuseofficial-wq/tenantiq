import { createServiceClient } from '@/lib/supabase/server'

export interface CommunityRating {
  id: string
  rating: 'positive' | 'negative'
  description: string | null
  property_address: string | null
  tenancy_start_date: string | null
  tenancy_end_date: string | null
  created_at: string
  is_disputed: boolean
  dispute_flags: number
  match_reason: 'email' | 'phone' | 'name'
}

export interface CommunityHistory {
  matches: CommunityRating[]
  positive_count: number
  negative_count: number
  checked_at: string
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\.\+]/g, '')
}

/**
 * Look up the tenant_ratings table for any previous ratings of this applicant.
 * Uses the service role so it can read across all landlords' ratings — RLS would
 * otherwise restrict queries to the requesting user's own records.
 *
 * Matching criteria (any one is sufficient):
 *   1. Exact email match (lowercased)
 *   2. Exact normalised phone match
 *   3. Case-insensitive full name match
 *
 * Hidden ratings (dispute_flags >= 3) are excluded from results.
 */
export async function lookupCommunityHistory(params: {
  email: string
  phone: string
  full_name: string
}): Promise<CommunityHistory> {
  const supabase = createServiceClient()
  const now = new Date().toISOString()

  const emailNorm      = params.email.toLowerCase().trim()
  const phoneNorm      = normalizePhone(params.phone)
  const fullNameLower  = params.full_name.toLowerCase().trim()

  // Three independent queries — OR across different columns requires raw SQL in
  // PostgREST, which is verbose and brittle. Three targeted queries are cleaner
  // and let us tag each match with its match_reason.
  const [emailResult, phoneResult, nameResult] = await Promise.all([
    supabase
      .from('tenant_ratings')
      .select('id, rating, description, property_address, tenancy_start_date, tenancy_end_date, created_at, is_disputed, dispute_flags')
      .eq('tenant_email', emailNorm)
      .lt('dispute_flags', 3),

    supabase
      .from('tenant_ratings')
      .select('id, rating, description, property_address, tenancy_start_date, tenancy_end_date, created_at, is_disputed, dispute_flags')
      .eq('tenant_phone_normalized', phoneNorm)
      .lt('dispute_flags', 3),

    supabase
      .from('tenant_ratings')
      .select('id, rating, description, property_address, tenancy_start_date, tenancy_end_date, created_at, is_disputed, dispute_flags')
      .ilike('tenant_full_name', fullNameLower)
      .lt('dispute_flags', 3),
  ])

  // Merge and deduplicate by id, preferring the strongest match_reason.
  const seen = new Map<string, CommunityRating>()
  const PRIORITY: Record<CommunityRating['match_reason'], number> = { email: 3, phone: 2, name: 1 }

  function add(rows: typeof emailResult['data'], reason: CommunityRating['match_reason']) {
    for (const r of rows ?? []) {
      const existing = seen.get(r.id)
      if (!existing || PRIORITY[reason] > PRIORITY[existing.match_reason]) {
        seen.set(r.id, { ...r, match_reason: reason } as CommunityRating)
      }
    }
  }

  add(emailResult.data, 'email')
  add(phoneResult.data, 'phone')
  add(nameResult.data,  'name')

  const matches = [...seen.values()].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return {
    matches,
    positive_count: matches.filter(m => m.rating === 'positive').length,
    negative_count: matches.filter(m => m.rating === 'negative').length,
    checked_at:     now,
  }
}

/**
 * Apply a deterministic score adjustment based on community ratings.
 * Doing this in code (not inside the AI prompt) gives predictable results.
 *
 *   Each negative rating: -15 pts  (capped at -30 total)
 *   Each positive rating: +7  pts  (capped at +14 total)
 *   Final score always clamped to [0, 100].
 */
export function adjustScoreForCommunity(
  baseScore: number,
  history: CommunityHistory,
): number {
  const negativeDeduction = Math.min(history.negative_count * 15, 30)
  const positiveAddition  = Math.min(history.positive_count  * 7,  14)
  return Math.max(0, Math.min(100, baseScore - negativeDeduction + positiveAddition))
}
