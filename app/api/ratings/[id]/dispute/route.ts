import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { globalApiRateLimit } from '@/lib/api-rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// POST /api/ratings/[id]/dispute — flag a community rating as potentially inaccurate.
// Any authenticated landlord can flag a rating once. Ratings with 3+ flags are
// automatically hidden from community history results.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = globalApiRateLimit(request)
  if (limited) return limited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  if (!UUID_RE.test(id ?? '')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const serviceSupabase = createServiceClient()

  const { data: rating, error } = await serviceSupabase
    .from('tenant_ratings')
    .select('id, dispute_flags, reported_by_landlord_id')
    .eq('id', id)
    .single()

  if (error || !rating) {
    return NextResponse.json({ error: 'Rating not found' }, { status: 404 })
  }

  // A landlord cannot dispute their own rating
  if (rating.reported_by_landlord_id === user.id) {
    return NextResponse.json({ error: 'You cannot dispute your own rating.' }, { status: 403 })
  }

  const newFlags = (rating.dispute_flags ?? 0) + 1
  const autoHide = newFlags >= 3

  const { error: updateError } = await serviceSupabase
    .from('tenant_ratings')
    .update({
      dispute_flags:        newFlags,
      is_disputed:          true,
      dispute_submitted_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    console.error('[ratings/dispute] update failed:', updateError.message)
    return NextResponse.json({ error: 'Failed to submit dispute' }, { status: 500 })
  }

  return NextResponse.json({
    success:   true,
    auto_hidden: autoHide,
    flags:     newFlags,
  })
}
