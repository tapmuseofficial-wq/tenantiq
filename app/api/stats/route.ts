import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Public aggregate stats endpoint — used by the landing page counter.
// No authentication required; only aggregate counts are returned.
export async function GET() {
  try {
    const supabase = createServiceClient()

    const [screeningsRes, reviewsRes, landlordsRes] = await Promise.all([
      supabase.from('applications').select('*', { count: 'exact', head: true }),
      supabase.from('tenant_ratings').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ])

    return NextResponse.json(
      {
        screenings: screeningsRes.count ?? 0,
        reviews:    reviewsRes.count    ?? 0,
        landlords:  landlordsRes.count  ?? 0,
      },
      {
        headers: {
          // Cache for 5 minutes at the CDN — numbers don't need to be real-time
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch {
    // Return zeroes rather than a 500 — counter gracefully stays at 0
    return NextResponse.json({ screenings: 0, reviews: 0, landlords: 0 })
  }
}
