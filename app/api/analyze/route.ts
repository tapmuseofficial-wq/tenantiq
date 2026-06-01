import { NextRequest, NextResponse } from 'next/server'
import { runAnalysis } from '@/lib/analyze'

export async function POST(request: NextRequest) {
  try {
    const { application_id } = await request.json()
    if (!application_id) {
      return NextResponse.json({ error: 'Missing application_id' }, { status: 400 })
    }
    await runAnalysis(application_id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analysis route error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
