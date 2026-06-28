import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/server'
import { runAnalysis } from '@/lib/analyze'
import { sendNewApplicationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'
import { globalApiRateLimit, getClientIp } from '@/lib/api-rate-limit'

// All string fields are trimmed and capped. Boolean fields must be the
// literal strings "true" or "false" (that is how the form serialises them).
// Numeric fields are coerced from string.  Any field outside these bounds
// is rejected before touching the database or any external service.
const applicationSchema = z.object({
  screening_token: z.string().min(1).max(200),
  full_name:               z.string().min(1).max(200).trim(),
  email:                   z.string().email().max(254).trim(),
  phone:                   z.string().min(7).max(30).trim(),
  monthly_income_reported: z.coerce.number().min(0).max(10_000_000),
  employer_name:           z.string().min(1).max(200).trim(),
  time_at_job:             z.string().min(1).max(200).trim(),
  reason_for_moving:       z.string().min(1).max(2000).trim(),
  has_evictions:           z.enum(['true', 'false']).transform(v => v === 'true'),
  eviction_explanation:    z.string().max(2000).trim().optional(),
  has_late_payments:       z.enum(['true', 'false']).transform(v => v === 'true'),
  late_payment_explanation: z.string().max(2000).trim().optional(),
  has_pets:                z.enum(['true', 'false']).transform(v => v === 'true'),
  pet_details:             z.string().max(500).trim().optional(),
  reference_1_name:         z.string().max(200).trim().optional(),
  reference_1_relationship: z.string().max(200).trim().optional(),
  reference_1_phone:        z.string().max(30).trim().optional(),
  reference_2_name:         z.string().max(200).trim().optional(),
  reference_2_relationship: z.string().max(200).trim().optional(),
  reference_2_phone:        z.string().max(30).trim().optional(),
  social_media_consent:    z.enum(['true', 'false']).transform(v => v === 'true').optional().default(false),
})

export async function POST(request: NextRequest) {
  // Global API cap: 100 req/hour per IP across all endpoints.
  const globalLimited = globalApiRateLimit(request)
  if (globalLimited) return globalLimited

  // Route-specific cap: max 10 application submissions per IP per hour.
  const ip = getClientIp(request)
  const { allowed, resetAt } = checkRateLimit(`submit:${ip}`, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    )
  }

  // Reject non-multipart requests before attempting to parse the body.
  // request.formData() throws when Content-Type isn't multipart/form-data,
  // which would fall through to the generic 500 catch — misleading because
  // the fault is the caller's, not the server's.
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json(
      { error: 'Invalid request format. Expected multipart/form-data.' },
      { status: 400 },
    )
  }

  try {
    const formData = await request.formData()

    // Extract the file before converting to a plain object, because
    // Object.fromEntries keeps only the last value per key and File objects
    // would be lost if there were name collisions.
    const documentFile = formData.get('income_document') as File | null

    // Build a plain object from the string fields and validate with Zod.
    // This is the single authoritative validation gate — nothing from the
    // client is trusted past this point.
    const rawFields: Record<string, string> = {}
    for (const [key, value] of formData.entries()) {
      if (key !== 'income_document' && typeof value === 'string') {
        rawFields[key] = value
      }
    }

    const parsed = applicationSchema.safeParse(rawFields)
    if (!parsed.success) {
      console.warn('[submit] validation failed:', parsed.error.flatten().fieldErrors)
      return NextResponse.json({ error: 'Invalid form data' }, { status: 400 })
    }
    const body = parsed.data

    const supabase = createServiceClient()

    // Verify the property exists and is active
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, name, landlord_id, monthly_rent, is_active')
      .eq('screening_token', body.screening_token)
      .single()

    if (propError || !property) {
      return NextResponse.json({ error: 'Invalid screening link' }, { status: 404 })
    }

    if (!property.is_active) {
      return NextResponse.json({ error: 'This screening link is no longer active' }, { status: 410 })
    }

    // Check landlord screening limit
    const { data: profile } = await supabase
      .from('profiles')
      .select('subscription_status, screenings_used, screening_credits')
      .eq('id', property.landlord_id)
      .single()

    if (profile?.subscription_status === 'free' && (profile?.screenings_used ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'This landlord has reached their free plan limit' },
        { status: 402 }
      )
    }

    if (profile?.subscription_status === 'basic' && (profile?.screening_credits ?? 0) <= 0) {
      return NextResponse.json(
        { error: 'This landlord has no screening credits remaining' },
        { status: 402 }
      )
    }

    // Handle income document upload
    let income_document_path: string | null = null
    let income_document_name: string | null = null

    if (documentFile && documentFile.size > 0) {
      // Validate file size (10MB)
      const MAX_SIZE = 10 * 1024 * 1024
      if (documentFile.size > MAX_SIZE) {
        return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
      }

      // Derive MIME type from the file extension — never trust documentFile.type
      // because it is client-supplied and trivially spoofed.
      const ALLOWED: Record<string, string> = {
        pdf: 'application/pdf',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
      }
      const fileExt = documentFile.name.split('.').pop()?.toLowerCase() ?? ''
      const contentType = ALLOWED[fileExt]

      if (!contentType) {
        return NextResponse.json(
          { error: 'Invalid file type. Please upload a PDF, JPG, or PNG.' },
          { status: 400 }
        )
      }

      // Convert File → Buffer (required for server-side Supabase uploads)
      const arrayBuffer = await documentFile.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const fileName = `${property.id}/${Date.now()}.${fileExt}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('income-documents')
        .upload(fileName, buffer, {
          contentType,
          upsert: false,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        // Non-fatal: application still saves, analysis runs without document
      } else {
        income_document_path = uploadData.path
        // Strip any path separators from the client-supplied filename before
        // storing. The raw value is user-controlled and could contain
        // path-traversal sequences (../../etc/passwd) or HTML if ever
        // rendered outside a JSX context.
        income_document_name = documentFile.name.replace(/[/\\]/g, '_').slice(0, 255)
      }
    }

    // Insert application using only validated, typed values from the Zod output
    const applicationData = {
      property_id:              property.id,
      full_name:                body.full_name,
      email:                    body.email,
      phone:                    body.phone,
      monthly_income_reported:  body.monthly_income_reported,
      employer_name:            body.employer_name,
      time_at_job:              body.time_at_job,
      reason_for_moving:        body.reason_for_moving,
      has_evictions:            body.has_evictions,
      eviction_explanation:     body.eviction_explanation || null,
      has_late_payments:        body.has_late_payments,
      late_payment_explanation: body.late_payment_explanation || null,
      has_pets:                 body.has_pets,
      pet_details:              body.pet_details || null,
      reference_1_name:         body.reference_1_name || null,
      reference_1_relationship: body.reference_1_relationship || null,
      reference_1_phone:        body.reference_1_phone || null,
      reference_2_name:         body.reference_2_name || null,
      reference_2_relationship: body.reference_2_relationship || null,
      reference_2_phone:        body.reference_2_phone || null,
      income_document_path,
      income_document_name,
      social_media_consent:        body.social_media_consent ?? false,
      status:                      'pending',
      income_verification_status:  income_document_path ? 'unverified' : 'no_document',
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select('id')
      .single()

    if (appError || !application) {
      // Log the full error so it shows in Vercel logs for diagnosis.
      console.error('[submit] Application insert failed — full error:', {
        code:    appError?.code,
        message: appError?.message,
        details: appError?.details,
        hint:    appError?.hint,
      })

      // PostgreSQL error 42703 = "column does not exist".
      // PostgREST surfaces this as code "42703" in the error object.
      // Cause: a migration (007, 008, or 009) has not been run in Supabase yet.
      const isMissingColumn =
        appError?.code === '42703' ||
        appError?.message?.includes('column') ||
        appError?.code === 'PGRST204'

      if (isMissingColumn) {
        console.error(
          '[submit] MISSING COLUMN — run 009_ensure_columns.sql in the Supabase SQL Editor.',
          'Missing field hint:', appError?.message
        )
      }

      return NextResponse.json({ error: 'Failed to save application' }, { status: 500 })
    }

    // Deduct from the appropriate counter
    if (profile?.subscription_status === 'basic') {
      await supabase
        .from('profiles')
        .update({ screening_credits: Math.max(0, (profile.screening_credits ?? 0) - 1) })
        .eq('id', property.landlord_id)
    } else {
      await supabase
        .from('profiles')
        .update({ screenings_used: (profile?.screenings_used ?? 0) + 1 })
        .eq('id', property.landlord_id)
    }

    // Notify the landlord — non-blocking, failure must not affect the tenant's submission
    const { data: landlordAuth } = await supabase.auth.admin.getUserById(property.landlord_id)
    if (landlordAuth.user?.email) {
      sendNewApplicationEmail({
        landlordEmail: landlordAuth.user.email,
        tenantName: body.full_name,
        propertyName: property.name,
      }).catch(() => {})
    }

    // Await the analysis before returning. Fire-and-forget is not reliable on
    // Vercel — the function can be terminated as soon as the response is sent,
    // killing the background promise before it completes. Awaiting here keeps
    // the function alive until the analysis finishes. Analysis failures are
    // caught and logged but do not fail the submission for the tenant.
    try {
      await runAnalysis(application.id)
    } catch (err) {
      console.error('[submit] runAnalysis threw unexpectedly — application saved but analysis failed:', err instanceof Error ? err.message : err)
    }

    return NextResponse.json({ success: true, application_id: application.id })
  } catch (error) {
    console.error('Submit application error:', error instanceof Error ? error.message : error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
