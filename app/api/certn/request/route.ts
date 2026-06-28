import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createCertnCase } from '@/lib/certn'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let applicationId: string
  try {
    const body = await request.json()
    applicationId = body.application_id
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!applicationId) {
    return NextResponse.json({ error: 'application_id is required' }, { status: 400 })
  }

  const serviceSupabase = createServiceClient()

  const { data: app, error: appError } = await serviceSupabase
    .from('applications')
    .select('id, full_name, email, phone, certn_case_id, properties(landlord_id)')
    .eq('id', applicationId)
    .single()

  if (appError || !app) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const property = app.properties as unknown as { landlord_id: string } | null
  if (property?.landlord_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (app.certn_case_id) {
    return NextResponse.json({ error: 'Background check already requested' }, { status: 409 })
  }

  const nameParts  = (app.full_name as string).trim().split(/\s+/)
  const first_name = nameParts[0]
  const last_name  = nameParts.slice(1).join(' ') || ''

  let certnCase
  try {
    certnCase = await createCertnCase({
      first_name,
      last_name,
      email: app.email as string,
      phone: (app.phone as string | null) ?? undefined,
    })
  } catch (err) {
    console.error('[certn/request] Certn API error:', err)
    return NextResponse.json(
      { error: 'Failed to create background check. Please try again.' },
      { status: 502 },
    )
  }

  const { error: updateError } = await serviceSupabase
    .from('applications')
    .update({
      certn_case_id:                 certnCase.id,
      certn_status:                  'pending',
      background_check_requested_at: new Date().toISOString(),
    })
    .eq('id', applicationId)

  if (updateError) {
    console.error('[certn/request] DB update failed:', updateError.message)
    return NextResponse.json({ error: 'Failed to save background check status' }, { status: 500 })
  }

  return NextResponse.json({ case_id: certnCase.id })
}
