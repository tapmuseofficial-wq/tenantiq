import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { globalApiRateLimit, getClientIp } from '@/lib/api-rate-limit'
import { normalizePhone } from '@/lib/community-history'

const ratingSchema = z.object({
  application_id: z.string().uuid(),
  rating:         z.enum(['positive', 'negative']),
  description:    z.string().max(2000).trim().optional(),
})

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const limited = globalApiRateLimit(request)
  if (limited) return limited

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: z.infer<typeof ratingSchema>
  try {
    const raw = await request.json()
    const parsed = ratingSchema.safeParse(raw)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 })
    }
    body = parsed.data
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Negative ratings must have a description (min 50 chars)
  if (body.rating === 'negative') {
    if (!body.description || body.description.length < 50) {
      return NextResponse.json(
        { error: 'Negative ratings require a description of at least 50 characters.' },
        { status: 400 }
      )
    }
  }

  const serviceSupabase = createServiceClient()

  // Verify the application exists and belongs to this landlord
  const { data: application, error: appError } = await serviceSupabase
    .from('applications')
    .select(`id, full_name, email, phone, status, is_rated, properties (landlord_id, address, city)`)
    .eq('id', body.application_id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const property = (Array.isArray(application.properties) ? application.properties[0] : application.properties) as { landlord_id: string; address: string | null; city: string | null }
  if (property.landlord_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (application.status !== 'complete') {
    return NextResponse.json(
      { error: 'Ratings can only be submitted for completed screenings.' },
      { status: 409 }
    )
  }

  if (application.is_rated) {
    return NextResponse.json(
      { error: 'You have already submitted a rating for this applicant.' },
      { status: 409 }
    )
  }

  // Abuse prevention: landlord must have at least 1 completed screening
  const { count: completedCount } = await serviceSupabase
    .from('applications')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'complete')
    .filter('properties.landlord_id', 'eq', user.id)

  // Alternative: check via properties join — use profiles.screenings_used as proxy
  const { data: profile } = await serviceSupabase
    .from('profiles')
    .select('screenings_used, screening_credits, subscription_status')
    .eq('id', user.id)
    .single()

  const totalScreenings = (profile?.screenings_used ?? 0) + (profile?.screening_credits ?? 0 > 0 ? 1 : 0)
  // If they're on basic plan or have used screenings, they qualify
  const hasScreened = profile?.subscription_status === 'basic' || (profile?.screenings_used ?? 0) >= 1
  if (!hasScreened) {
    return NextResponse.json(
      { error: 'You must have completed at least one screening before submitting ratings.' },
      { status: 403 }
    )
  }

  // Abuse prevention: max 5 ratings per landlord per calendar month
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { count: monthlyCount } = await serviceSupabase
    .from('tenant_ratings')
    .select('id', { count: 'exact', head: true })
    .eq('reported_by_landlord_id', user.id)
    .gte('created_at', monthStart.toISOString())

  if ((monthlyCount ?? 0) >= 5) {
    return NextResponse.json(
      { error: 'You have reached the maximum of 5 ratings per month. Try again next month.' },
      { status: 429 }
    )
  }

  // Abuse prevention: cannot rate the same tenant email twice from the same account
  if (application.email) {
    const { count: dupCount } = await serviceSupabase
      .from('tenant_ratings')
      .select('id', { count: 'exact', head: true })
      .eq('reported_by_landlord_id', user.id)
      .eq('tenant_email', application.email.toLowerCase().trim())

    if ((dupCount ?? 0) > 0) {
      return NextResponse.json(
        { error: 'You have already submitted a rating for this email address.' },
        { status: 409 }
      )
    }
  }

  const ip = getClientIp(request)
  const propertyAddress = [property.address, property.city].filter(Boolean).join(', ') || null

  // Insert the rating
  const { error: insertError } = await serviceSupabase
    .from('tenant_ratings')
    .insert({
      reported_by_landlord_id: user.id,
      application_id:          body.application_id,
      tenant_full_name:        application.full_name,
      tenant_email:            application.email?.toLowerCase().trim() ?? null,
      tenant_phone:            application.phone ?? null,
      tenant_phone_normalized: application.phone ? normalizePhone(application.phone) : null,
      rating:                  body.rating,
      description:             body.description ?? null,
      property_address:        propertyAddress,
      ip_address:              ip,
    })

  if (insertError) {
    console.error('[ratings] insert failed:', insertError.message)
    return NextResponse.json({ error: 'Failed to submit rating' }, { status: 500 })
  }

  // Mark the application as rated
  await serviceSupabase
    .from('applications')
    .update({ is_rated: true })
    .eq('id', body.application_id)

  // Award 1 bonus screening credit to the landlord.
  // Also upgrade free users to 'basic' so they can use the credit.
  const newCredits = (profile?.screening_credits ?? 0) + 1
  await serviceSupabase
    .from('profiles')
    .update({
      screening_credits:   newCredits,
      subscription_status: 'basic',
    })
    .eq('id', user.id)

  return NextResponse.json({
    success:     true,
    new_credits: newCredits,
  })
}
