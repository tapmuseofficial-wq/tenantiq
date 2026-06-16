import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { runAnalysis } from '@/lib/analyze'
import { sendNewApplicationEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limit: 10 submissions per IP per hour
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  const { allowed, resetAt } = checkRateLimit(ip, 10, 60 * 60 * 1000)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
      }
    )
  }

  try {
    const formData = await request.formData()
    const supabase = createServiceClient()

    const screening_token = formData.get('screening_token') as string
    if (!screening_token) {
      return NextResponse.json({ error: 'Missing screening token' }, { status: 400 })
    }

    // Verify the property exists and is active
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id, name, landlord_id, monthly_rent, is_active')
      .eq('screening_token', screening_token)
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

    const documentFile = formData.get('income_document') as File | null
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
        income_document_name = documentFile.name
      }
    }

    // Insert application
    const applicationData = {
      property_id: property.id,
      full_name: formData.get('full_name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      monthly_income_reported: parseFloat(formData.get('monthly_income_reported') as string),
      employer_name: formData.get('employer_name') as string,
      time_at_job: formData.get('time_at_job') as string,
      reason_for_moving: formData.get('reason_for_moving') as string,
      has_evictions: formData.get('has_evictions') === 'true',
      eviction_explanation: formData.get('eviction_explanation') as string | null || null,
      has_late_payments: formData.get('has_late_payments') === 'true',
      late_payment_explanation: formData.get('late_payment_explanation') as string | null || null,
      has_pets: formData.get('has_pets') === 'true',
      pet_details: formData.get('pet_details') as string | null || null,
      reference_1_name: formData.get('reference_1_name') as string | null || null,
      reference_1_relationship: formData.get('reference_1_relationship') as string | null || null,
      reference_1_phone: formData.get('reference_1_phone') as string | null || null,
      reference_2_name: formData.get('reference_2_name') as string | null || null,
      reference_2_relationship: formData.get('reference_2_relationship') as string | null || null,
      reference_2_phone: formData.get('reference_2_phone') as string | null || null,
      income_document_path,
      income_document_name,
      status: 'pending',
      income_verification_status: income_document_path ? 'unverified' : 'no_document',
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select('id')
      .single()

    if (appError || !application) {
      console.error('Application insert error:', appError)
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
    const tenantName = formData.get('full_name') as string
    const { data: landlordAuth } = await supabase.auth.admin.getUserById(property.landlord_id)
    if (landlordAuth.user?.email) {
      sendNewApplicationEmail({
        landlordEmail: landlordAuth.user.email,
        tenantName,
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
    console.error('Submit application error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
