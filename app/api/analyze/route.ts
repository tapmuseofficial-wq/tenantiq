import { NextRequest, NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/analyze'

export async function POST(request: NextRequest) {
  let application_id: string | undefined
  try {
    const body = await request.json()
    application_id = body.application_id

    if (!application_id) {
      console.error('[analyze route] called without application_id')
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 })
    }

    console.log(`[analyze route] received request — application_id=${application_id}`)
    await runAnalysis(application_id)
    console.log(`[analyze route] completed — application_id=${application_id}`)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error(`[analyze route] unhandled error — application_id=${application_id}`, err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
