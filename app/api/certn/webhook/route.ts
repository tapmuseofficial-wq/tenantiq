import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { parseCertnReport } from '@/lib/certn'

export async function POST(request: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const caseId = (payload.id ?? payload.case_id) as string | undefined
  if (!caseId) {
    console.error('[certn/webhook] missing case id in payload')
    return NextResponse.json({ error: 'Missing case id' }, { status: 400 })
  }

  const rawStatus = String(payload.status ?? '').toUpperCase()
  const isFailed  = rawStatus === 'FAILED' || rawStatus === 'ERROR'
  const isComplete = rawStatus === 'COMPLETE' || rawStatus === 'COMPLETED'

  if (!isComplete && !isFailed) {
    return NextResponse.json({ received: true })
  }

  const supabase = createServiceClient()

  const { data: app, error: lookupError } = await supabase
    .from('applications')
    .select('id')
    .eq('certn_case_id', caseId)
    .single()

  if (lookupError || !app) {
    console.error('[certn/webhook] no application found for case_id:', caseId)
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (isFailed) {
    await supabase
      .from('applications')
      .update({ certn_status: 'failed' })
      .eq('id', app.id)
    return NextResponse.json({ received: true })
  }

  const parsedReport = parseCertnReport(payload)

  const { error: updateError } = await supabase
    .from('applications')
    .update({
      certn_status: 'complete',
      certn_report: parsedReport,
    })
    .eq('id', app.id)

  if (updateError) {
    console.error('[certn/webhook] failed to update application:', updateError.message)
    return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
  }

  console.log(`[certn/webhook] report saved for application ${app.id}`)
  return NextResponse.json({ received: true })
}
