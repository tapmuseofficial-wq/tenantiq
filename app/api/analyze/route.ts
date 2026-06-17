import { NextRequest, NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/analyze'
import { globalApiRateLimit } from '@/lib/api-rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function POST(request: NextRequest) {
  const limited = globalApiRateLimit(request)
  if (limited) return limited

  // This endpoint triggers expensive Anthropic API calls — require a shared
  // secret so it cannot be abused by external callers.
  const secret = process.env.INTERNAL_API_SECRET
  if (!secret || request.headers.get('x-internal-secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let application_id: string | undefined
  try {
    const body = await request.json()
    application_id = body.application_id

    if (!application_id) {
      console.error('[analyze route] called without application_id')
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 })
    }

    // Reject non-UUID values before they reach the database query.
    if (!UUID_RE.test(application_id)) {
      console.error('[analyze route] invalid application_id format')
      return NextResponse.json({ error: 'Invalid application_id' }, { status: 400 })
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
