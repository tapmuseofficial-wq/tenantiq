import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { globalApiRateLimit } from '@/lib/api-rate-limit'
import { jsPDF } from 'jspdf'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

const BREAKDOWN_LABELS: Record<string, string> = {
  income_ratio: 'Income to Rent Ratio',
  rental_history: 'Rental History',
  credit_score: 'Credit Assessment',
  references: 'References',
  overall_fit: 'Overall Fit',
  employment_stability: 'Employment Stability',
  public_records: 'Public Records',
}

function generatePDF(
  application: Record<string, unknown>,
  property: { name: string; address: string | null; monthly_rent: number | null },
): ArrayBuffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', putOnlyUsedFonts: true })

  const PW = 210   // page width
  const PH = 297   // page height
  const M  = 14    // margin
  const W  = PW - M * 2  // usable width

  let y = M

  // Ensure there's room; add a page if not
  function need(h: number) {
    if (y + h > PH - M - 4) {
      doc.addPage()
      y = M
    }
  }

  function gap(h: number) { y += h }

  // Set active font
  function setFont(size: number, style: 'normal' | 'bold' = 'normal', color = '#111111') {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(color)
  }

  // Draw wrapped text at current y, advance y
  function drawText(content: string, x: number, maxW: number, size: number, style: 'normal' | 'bold' = 'normal', color = '#111111') {
    if (!content) return
    setFont(size, style, color)
    const lines = doc.splitTextToSize(content, maxW) as string[]
    const lineH = size * 0.38
    need(lines.length * lineH + 1)
    doc.text(lines, x, y)
    y += lines.length * lineH
  }

  // Label above, value below — advances y
  function field(label: string, value: string, x = M, maxW = W) {
    if (!value) return
    need(10)
    setFont(7.5, 'bold', '#6b7280')
    doc.text(label.toUpperCase(), x, y)
    y += 3.2
    setFont(9, 'normal', '#111111')
    const lines = doc.splitTextToSize(value, maxW) as string[]
    doc.text(lines, x, y)
    y += lines.length * 3.6 + 0.5
  }

  // Section heading with a divider line
  function sectionTitle(title: string, color = '#1e3a5f') {
    need(12)
    gap(3)
    setFont(8.5, 'bold', color)
    doc.text(title.toUpperCase(), M, y)
    y += 3
    doc.setDrawColor(color)
    doc.setLineWidth(0.25)
    doc.line(M, y, M + W, y)
    y += 3.5
  }

  // Bullet-list item — advances y
  function bullet(content: string, color = '#374151') {
    if (!content) return
    need(6)
    setFont(9, 'normal', color)
    doc.text('•', M, y)
    const lines = doc.splitTextToSize(content, W - 5) as string[]
    doc.text(lines, M + 5, y)
    y += Math.max(lines.length * 3.6, 4.5)
  }

  // ── Extract data ─────────────────────────────────────────────────────────
  const score         = typeof application.score === 'number' ? application.score : null
  const rec           = str(application.recommendation)
  const redFlags      = strArr(application.red_flags)
  const posFactors    = strArr(application.positive_factors)
  const interviewQs   = strArr(application.interview_questions)
  const monthlyRent   = property.monthly_rent
  const monthlyIncome = typeof application.monthly_income === 'number' ? application.monthly_income : null
  const incomeRatio   = monthlyIncome && monthlyRent ? (monthlyIncome / monthlyRent).toFixed(1) : null

  const socialAnalysis = application.social_media_analysis != null && typeof application.social_media_analysis === 'object'
    ? (application.social_media_analysis as Record<string, unknown>) : null
  const communityHistory = application.community_history != null && typeof application.community_history === 'object'
    ? (application.community_history as Record<string, unknown>) : null
  const scoreBreakdown = application.score_breakdown != null && typeof application.score_breakdown === 'object'
    ? (application.score_breakdown as Record<string, unknown>) : null
  const courtRecords = socialAnalysis?.court_records != null && typeof socialAnalysis.court_records === 'object'
    ? (socialAnalysis.court_records as Record<string, unknown>) : null

  const negCount = communityHistory && typeof communityHistory.negative_count === 'number' ? communityHistory.negative_count : 0
  const posCount = communityHistory && typeof communityHistory.positive_count === 'number' ? communityHistory.positive_count : 0
  const saRedFlags       = strArr(socialAnalysis?.red_flags)
  const saPositiveSignals = strArr(socialAnalysis?.positive_signals)
  const saAssessment     = str(socialAnalysis?.assessment)
  const saSummary        = str(socialAnalysis?.summary)

  const scoreHex = score !== null ? (score >= 75 ? '#16a34a' : score >= 55 ? '#d97706' : '#dc2626') : '#374151'
  const recHex   = rec === 'approve' ? '#16a34a' : rec === 'review' ? '#d97706' : rec === 'decline' ? '#dc2626' : '#374151'
  const recLabel = rec === 'approve' ? 'APPROVED' : rec === 'review' ? 'REVIEW' : rec === 'decline' ? 'DECLINED' : rec.toUpperCase()

  const generatedAt = new Date().toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const reportId = String(application.id ?? '').slice(0, 8).toUpperCase()

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor('#1e3a5f')
  doc.rect(0, 0, PW, 22, 'F')

  setFont(16, 'bold', '#ffffff')
  doc.text('TenantIQ', M, 10)
  setFont(9, 'normal', '#93c5fd')
  doc.text('Tenant Screening Report', M, 16.5)

  setFont(7.5, 'normal', '#93c5fd')
  doc.text(`Generated: ${generatedAt}`, PW - M, 9, { align: 'right' })
  doc.text(`Report ID: ${reportId}`, PW - M, 15, { align: 'right' })

  // ── Sub-header ──────────────────────────────────────────────────────────
  doc.setFillColor('#1e40af')
  doc.rect(0, 22, PW, 9, 'F')

  setFont(8, 'normal', '#bfdbfe')
  doc.text('Applicant:', M, 27.5)
  setFont(8, 'bold', '#ffffff')
  doc.text(str(application.full_name), M + 18, 27.5)

  setFont(8, 'normal', '#bfdbfe')
  doc.text('Property:', 95, 27.5)
  setFont(8, 'bold', '#ffffff')
  doc.text(property.name, 110, 27.5)

  if (monthlyRent) {
    setFont(8, 'normal', '#bfdbfe')
    doc.text('Rent:', 162, 27.5)
    setFont(8, 'bold', '#ffffff')
    doc.text(`$${Number(monthlyRent).toLocaleString()}/mo`, 170, 27.5)
  }

  y = 36

  // ── Score box ───────────────────────────────────────────────────────────
  doc.setFillColor('#f8fafc')
  doc.setDrawColor('#e2e8f0')
  doc.setLineWidth(0.3)
  doc.roundedRect(M, y, W, 22, 2, 2, 'FD')

  let boxX = M + 6

  if (score !== null) {
    setFont(26, 'bold', scoreHex)
    doc.text(String(score), boxX, y + 13)
    setFont(7.5, 'normal', '#6b7280')
    doc.text('out of 100', boxX, y + 18.5)

    boxX += 32
    doc.setDrawColor('#e2e8f0')
    doc.setLineWidth(0.3)
    doc.line(boxX, y + 3, boxX, y + 19)
    boxX += 6
  }

  if (rec) {
    setFont(7.5, 'bold', '#6b7280')
    doc.text('RECOMMENDATION', boxX, y + 7)
    doc.setFillColor(recHex)
    doc.roundedRect(boxX, y + 9, 30, 7, 1, 1, 'F')
    setFont(8, 'bold', '#ffffff')
    doc.text(recLabel, boxX + 15, y + 14, { align: 'center' })

    boxX += 36
    doc.setDrawColor('#e2e8f0')
    doc.setLineWidth(0.3)
    doc.line(boxX, y + 3, boxX, y + 19)
    boxX += 6
  }

  if (incomeRatio && monthlyIncome && monthlyRent) {
    setFont(7.5, 'bold', '#6b7280')
    doc.text('INCOME TO RENT RATIO', boxX, y + 7)
    setFont(18, 'bold', '#374151')
    doc.text(`${incomeRatio}x`, boxX, y + 16)
    setFont(7, 'normal', '#6b7280')
    doc.text(`$${Number(monthlyIncome).toLocaleString()} / $${Number(monthlyRent).toLocaleString()} rent`, boxX, y + 20)
  }

  y += 26

  // ── AI Summary ──────────────────────────────────────────────────────────
  if (str(application.ai_summary)) {
    sectionTitle('AI Analysis Summary')
    drawText(str(application.ai_summary), M, W, 9)
    gap(1)
  }

  // ── Applicant Information ───────────────────────────────────────────────
  sectionTitle('Applicant Information')

  const col  = (W - 8) / 2
  const colR = M + col + 8

  // Left column snapshot of y before drawing left col
  const yL0 = y
  field('Full Name',      str(application.full_name),    M, col)
  field('Email',          str(application.email),         M, col)
  if (str(application.phone))          field('Phone',          str(application.phone),          M, col)
  if (str(application.date_of_birth))  field('Date of Birth',  str(application.date_of_birth),  M, col)
  if (str(application.sin_last_three)) field('SIN (last 3)',   `••• ••• ${str(application.sin_last_three)}`, M, col)
  if (str(application.current_address)) field('Current Address', str(application.current_address), M, col)
  if (str(application.move_in_date))   field('Desired Move-in', str(application.move_in_date),  M, col)
  const yL1 = y

  // Right column — income & employment (reset y to top of section)
  y = yL0
  if (monthlyIncome !== null) field('Monthly Income', `$${Number(monthlyIncome).toLocaleString()}`, colR, col)
  if (str(application.employer_name)) field('Employer',       str(application.employer_name), colR, col)
  if (str(application.occupation))    field('Occupation',     str(application.occupation),    colR, col)
  if (str(application.income_source)) field('Income Source',  str(application.income_source), colR, col)
  const yR1 = y

  y = Math.max(yL1, yR1) + 2

  // ── Score Breakdown ─────────────────────────────────────────────────────
  if (scoreBreakdown) {
    const entries = Object.entries(scoreBreakdown).filter(([, v]) => typeof v === 'number')
    if (entries.length > 0) {
      sectionTitle('Score Breakdown')
      for (const [key, val] of entries) {
        need(8)
        const pct   = Math.min(100, Math.max(0, val as number))
        const label = BREAKDOWN_LABELS[key] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        const barClr = pct >= 75 ? '#16a34a' : pct >= 55 ? '#d97706' : '#dc2626'

        setFont(8.5, 'normal', '#374151')
        doc.text(label, M, y)

        const barX = M + 58
        const barW = W - 70

        doc.setFillColor('#e5e7eb')
        doc.roundedRect(barX, y - 3, barW, 4, 1, 1, 'F')
        doc.setFillColor(barClr)
        doc.roundedRect(barX, y - 3, (barW * pct) / 100, 4, 1, 1, 'F')

        setFont(8.5, 'bold', barClr)
        doc.text(String(Math.round(pct)), PW - M, y, { align: 'right' })

        y += 6.5
      }
      gap(1)
    }
  }

  // ── Red Flags ───────────────────────────────────────────────────────────
  if (redFlags.length > 0) {
    sectionTitle('Red Flags', '#dc2626')
    for (const f of redFlags) bullet(f, '#dc2626')
    gap(1)
  }

  // ── Positive Factors ────────────────────────────────────────────────────
  if (posFactors.length > 0) {
    sectionTitle('Positive Factors', '#16a34a')
    for (const f of posFactors) bullet(f, '#16a34a')
    gap(1)
  }

  // ── Rental History ──────────────────────────────────────────────────────
  sectionTitle('Rental History')

  const yH0 = y
  if (str(application.previous_address))   field('Previous Address',   str(application.previous_address),    M, col)
  if (str(application.reason_for_leaving)) field('Reason for Leaving', str(application.reason_for_leaving),  M, col)
  const yHL = y

  y = yH0
  if (str(application.previous_landlord_name))  field('Previous Landlord', str(application.previous_landlord_name),  colR, col)
  if (str(application.previous_landlord_phone)) field('Landlord Phone',    str(application.previous_landlord_phone), colR, col)
  const yHR = y

  y = Math.max(yHL, yHR)

  if (application.has_evictions === true) {
    const evText  = str(application.eviction_explanation)
    const evLines = evText ? (doc.splitTextToSize(evText, W - 6) as string[]) : []
    const boxH    = 8 + (evLines.length > 0 ? evLines.length * 3.6 + 2 : 0)
    need(boxH + 2)
    doc.setFillColor('#fef2f2')
    doc.setDrawColor('#fca5a5')
    doc.setLineWidth(0.3)
    doc.roundedRect(M, y, W, boxH, 1, 1, 'FD')
    setFont(8, 'bold', '#dc2626')
    doc.text('EVICTION HISTORY REPORTED', M + 3, y + 5)
    if (evLines.length > 0) {
      setFont(8, 'normal', '#374151')
      doc.text(evLines, M + 3, y + 10)
    }
    y += boxH + 2
  }

  gap(1)

  // ── References ──────────────────────────────────────────────────────────
  const hasRef1 = typeof application.reference_1_name === 'string'
  const hasRef2 = typeof application.reference_2_name === 'string'
  if (hasRef1 || hasRef2) {
    sectionTitle('References')
    if (hasRef1) {
      need(8)
      setFont(9, 'bold', '#111111')
      doc.text(str(application.reference_1_name), M, y)
      y += 3.5
      if (typeof application.reference_1_relationship === 'string') {
        setFont(8.5, 'normal', '#6b7280')
        doc.text(str(application.reference_1_relationship), M, y)
        y += 3.5
      }
    }
    if (hasRef2) {
      if (hasRef1) gap(2)
      need(8)
      setFont(9, 'bold', '#111111')
      doc.text(str(application.reference_2_name), M, y)
      y += 3.5
      if (typeof application.reference_2_relationship === 'string') {
        setFont(8.5, 'normal', '#6b7280')
        doc.text(str(application.reference_2_relationship), M, y)
        y += 3.5
      }
    }
    gap(1)
  }

  // ── Community History ───────────────────────────────────────────────────
  if (communityHistory) {
    sectionTitle('TenantIQ Community History')
    need(20)
    doc.setFillColor('#f0f9ff')
    doc.setDrawColor('#bae6fd')
    doc.setLineWidth(0.3)
    doc.roundedRect(M, y, W, 18, 1, 1, 'FD')

    setFont(20, 'bold', negCount > 0 ? '#dc2626' : '#16a34a')
    doc.text(String(negCount), M + 13, y + 11, { align: 'center' })
    setFont(7, 'normal', '#6b7280')
    doc.text(`Negative${negCount !== 1 ? 's' : ''}`, M + 13, y + 15.5, { align: 'center' })

    doc.setDrawColor('#bae6fd')
    doc.line(M + 28, y + 2, M + 28, y + 16)

    setFont(20, 'bold', '#16a34a')
    doc.text(String(posCount), M + 43, y + 11, { align: 'center' })
    setFont(7, 'normal', '#6b7280')
    doc.text(`Positive${posCount !== 1 ? 's' : ''}`, M + 43, y + 15.5, { align: 'center' })

    const histMsg = communityHistory.has_history === true
      ? 'This applicant has a history within the TenantIQ landlord community.'
      : 'No history found in the TenantIQ landlord community.'
    setFont(8.5, 'normal', '#374151')
    const histLines = doc.splitTextToSize(histMsg, W - 62) as string[]
    doc.text(histLines, M + 58, y + 9)

    y += 22
    gap(1)
  }

  // ── Public Records ──────────────────────────────────────────────────────
  if (socialAnalysis !== null && application.social_media_consent === true) {
    sectionTitle('Public Records & Online Presence')

    if (courtRecords) {
      const found       = courtRecords.found === true
      const courtSum    = str(courtRecords.summary)
      const courtDet    = str(courtRecords.details)
      const detLines    = courtDet ? (doc.splitTextToSize(courtDet, W - 6) as string[]) : []
      const boxH        = 8 + (courtSum ? 4 : 0) + (detLines.length > 0 ? detLines.length * 3.6 + 1 : 0)

      need(boxH + 2)
      doc.setFillColor(found ? '#fef2f2' : '#f0fdf4')
      doc.setDrawColor(found ? '#fca5a5' : '#86efac')
      doc.setLineWidth(0.3)
      doc.roundedRect(M, y, W, boxH, 1, 1, 'FD')

      setFont(8.5, 'bold', found ? '#dc2626' : '#166534')
      doc.text(`Court Records: ${found ? 'Records Found' : 'No Records Found'}`, M + 3, y + 5)

      let cy = y + 10
      if (courtSum) {
        setFont(8, 'normal', '#374151')
        doc.text(courtSum, M + 3, cy)
        cy += 4
      }
      if (detLines.length > 0) {
        setFont(8, 'normal', '#374151')
        doc.text(detLines, M + 3, cy)
      }
      y += boxH + 3
    }

    if (saAssessment) {
      field('Online Presence Assessment', saAssessment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    }
    if (saSummary) {
      drawText(saSummary, M, W, 9)
      gap(2)
    }
    if (saRedFlags.length > 0) {
      need(8)
      setFont(7.5, 'bold', '#dc2626')
      doc.text('ONLINE RED FLAGS', M, y)
      y += 3
      for (const f of saRedFlags) bullet(f, '#dc2626')
    }
    if (saPositiveSignals.length > 0) {
      need(8)
      setFont(7.5, 'bold', '#16a34a')
      doc.text('POSITIVE SIGNALS', M, y)
      y += 3
      for (const s of saPositiveSignals) bullet(s, '#16a34a')
    }
    gap(1)
  }

  // ── Interview Questions ──────────────────────────────────────────────────
  if (interviewQs.length > 0) {
    sectionTitle('Recommended Interview Questions')
    interviewQs.forEach((q, i) => {
      need(7)
      const lines = doc.splitTextToSize(q, W - 7) as string[]
      setFont(9, 'bold', '#374151')
      doc.text(`${i + 1}.`, M, y)
      setFont(9, 'normal', '#374151')
      doc.text(lines, M + 7, y)
      y += Math.max(lines.length * 3.6, 5)
    })
    gap(1)
  }

  // ── Footer / Disclaimer ─────────────────────────────────────────────────
  need(20)
  doc.setDrawColor('#e5e7eb')
  doc.setLineWidth(0.3)
  doc.line(M, y, M + W, y)
  y += 4
  const disclaimer = 'Disclaimer: This report is generated by TenantIQ using AI analysis and publicly available information. It is intended to assist landlords in their decision-making process and should not be the sole basis for rental decisions. TenantIQ does not guarantee the accuracy or completeness of this report. All screening decisions must comply with applicable human rights and privacy legislation.'
  setFont(7.5, 'normal', '#6b7280')
  doc.text(doc.splitTextToSize(disclaimer, W) as string[], M, y)

  return doc.output('arraybuffer')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const limited = globalApiRateLimit(request)
  if (limited) return limited

  const { id } = await params

  if (!UUID_RE.test(id ?? '')) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const serviceSupabase = createServiceClient()

    const { data: application, error } = await serviceSupabase
      .from('applications')
      .select('*, properties (name, address, monthly_rent, landlord_id)')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const property = application.properties as {
      name: string
      address: string | null
      monthly_rent: number | null
      landlord_id: string
    } | null

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    if (property.landlord_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    console.log(`[report] generating PDF — application_id=${id} name="${application.full_name}"`)

    const pdfData = generatePDF(application as Record<string, unknown>, property)

    console.log(`[report] PDF generated — bytes=${pdfData.byteLength}`)

    const safeName = String(application.full_name ?? 'report')
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase()

    return new NextResponse(new Blob([pdfData], { type: 'application/pdf' }), {
      headers: {
        'Content-Disposition': `attachment; filename="tenantiq_report_${safeName}.pdf"`,
      },
    })
  } catch (error) {
    console.error('[report] PDF generation failed —', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
