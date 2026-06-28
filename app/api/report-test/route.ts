import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { Document, Page, Text, View } from '@react-pdf/renderer'

// Diagnostic endpoint — renders a minimal hardcoded PDF with no DB data.
// Returns JSON: { success: true, bytes: N } or { success: false, error, stack }.
// Remove once the production PDF issue is confirmed resolved.
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log('[report-test] starting minimal PDF render')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const doc = createElement(Document, null as any,
      createElement(Page, { size: 'A4' } as any,
        createElement(View, null as any,
          createElement(Text, null as any, 'TenantIQ PDF diagnostics — react-pdf is working')
        )
      )
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buf = await renderToBuffer(doc as any)
    console.log(`[report-test] success — bytes=${buf.byteLength}`)
    return NextResponse.json({ success: true, bytes: buf.byteLength })
  } catch (e: unknown) {
    const err = e instanceof Error ? e : new Error(String(e))
    console.error('[report-test] failed —', err)
    return NextResponse.json(
      { success: false, error: err.message, stack: err.stack },
      { status: 500 }
    )
  }
}
