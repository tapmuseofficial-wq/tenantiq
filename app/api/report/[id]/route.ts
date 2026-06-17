import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createElement } from 'react'
import { ReportDocument } from '@/components/pdf/report-template'
import { globalApiRateLimit } from '@/lib/api-rate-limit'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = globalApiRateLimit(request)
  if (limited) return limited

  const { id } = await params

  // Reject non-UUID values before they reach the database — prevents probing
  // with arbitrary strings that could cause unexpected query behaviour.
  if (!UUID_RE.test(id ?? '')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    // Verify landlord owns this application
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    const { data: application, error } = await serviceSupabase
      .from('applications')
      .select(`
        *,
        properties (
          name,
          address,
          monthly_rent,
          landlord_id
        )
      `)
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const property = application.properties as { name: string; address: string; monthly_rent: number; landlord_id: string }

    if (property.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pdfBuffer = await renderToBuffer(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      createElement(ReportDocument, { application: application as any, property }) as any
    )

    const safeName = application.full_name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    const uint8 = new Uint8Array(pdfBuffer)

    return new NextResponse(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="tenantiq_report_${safeName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
