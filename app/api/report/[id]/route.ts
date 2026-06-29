import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { globalApiRateLimit } from '@/lib/api-rate-limit'
import { jsPDF } from 'jspdf'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function str(v: unknown): string {
  return typeof v === 'string' && v.length > 0 ? v : ''
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && x.length > 0)
}

function num(v: unknown): number | null {
  return typeof v === 'number' && isFinite(v) ? v : null
}

function bool(v: unknown): boolean | null {
  return typeof v === 'boolean' ? v : null
}

function fmt$(n: number): string {
  return '$' + n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// ── PDF generator ────────────────────────────────────────────────────────────

function generatePDF(
  application: Record<string, unknown>,
  property: { name: string; address: string | null; monthly_rent: number | null; city?: string | null },
): ArrayBuffer {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', putOnlyUsedFonts: true })

  const PW = 210
  const PH = 297
  const M  = 14
  const W  = PW - M * 2

  let y = M

  function need(h: number) {
    if (y + h > PH - M - 6) { doc.addPage(); y = M }
  }
  function gap(h: number) { y += h }

  function setFont(size: number, style: 'normal' | 'bold' = 'normal', color = '#111111') {
    doc.setFontSize(size); doc.setFont('helvetica', style); doc.setTextColor(color)
  }

  // Wrapped text at current y — advances y
  function drawText(content: string, x: number, maxW: number, size: number, style: 'normal' | 'bold' = 'normal', color = '#111111') {
    if (!content) return
    setFont(size, style, color)
    const lines = doc.splitTextToSize(content, maxW) as string[]
    need(lines.length * size * 0.38 + 1)
    doc.text(lines, x, y)
    y += lines.length * size * 0.38
  }

  // Label on top, value below — advances y
  function field(label: string, value: string, x = M, maxW = W) {
    if (!value) return
    need(10)
    setFont(7.5, 'bold', '#6b7280'); doc.text(label.toUpperCase(), x, y); y += 3.3
    setFont(9, 'normal', '#111111')
    const lines = doc.splitTextToSize(value, maxW) as string[]
    doc.text(lines, x, y); y += lines.length * 3.6 + 0.8
  }

  // Section heading + rule
  function sectionTitle(title: string, color = '#1e3a5f') {
    need(14); gap(3)
    setFont(8.5, 'bold', color); doc.text(title.toUpperCase(), M, y); y += 3
    doc.setDrawColor(color); doc.setLineWidth(0.25); doc.line(M, y, M + W, y); y += 3.5
  }

  // Bullet item
  function bullet(content: string, color = '#374151') {
    if (!content) return
    need(6); setFont(9, 'normal', color)
    doc.text('•', M, y)
    const lines = doc.splitTextToSize(content, W - 5) as string[]
    doc.text(lines, M + 5, y); y += Math.max(lines.length * 3.6, 4.5)
  }

  // Checkbox-style yes/no row
  function yesNoRow(label: string, value: boolean, explanation: string, yesColor: string, noColor: string) {
    need(8)
    const isYes = value === true
    const mark  = isYes ? '✗' : '✓'
    setFont(8.5, 'bold', isYes ? yesColor : noColor)
    doc.text(mark, M, y)
    setFont(8.5, 'bold', '#374151')
    doc.text(label + ': ', M + 4.5, y)
    setFont(8.5, 'bold', isYes ? yesColor : noColor)
    doc.text(isYes ? 'Yes' : 'None reported', M + 4.5 + doc.getTextWidth(label + ': '), y)
    y += 4
    if (isYes && explanation) {
      setFont(8, 'normal', '#6b7280')
      const lines = doc.splitTextToSize(explanation, W - 8) as string[]
      doc.text(lines, M + 8, y); y += lines.length * 3.4 + 1
    }
  }

  // ── Extract data ─────────────────────────────────────────────────────────
  const score         = num(application.score)
  const rec           = str(application.recommendation)
  const recReason     = str(application.recommendation_reason)
  const aiSummary     = str(application.ai_summary)
  const redFlags      = strArr(application.red_flags)
  const posFactors    = strArr(application.positive_factors)
  const interviewQs   = strArr(application.interview_questions)

  const monthlyRent       = num(property.monthly_rent)
  const monthlyReported   = num(application.monthly_income_reported)
  const monthlyVerified   = num(application.income_verified)
  const effectiveIncome   = monthlyVerified ?? monthlyReported
  const incomeRatio       = effectiveIncome && monthlyRent ? (effectiveIncome / monthlyRent).toFixed(1) : null
  const verStatus         = str(application.income_verification_status)
  const verNotes          = str(application.income_verification_notes)
  const docType           = str(application.income_document_type)
  const confidence        = str(application.income_extraction_confidence)

  const employerName      = str(application.employer_name)
  const timeAtJob         = str(application.time_at_job)
  const reasonForMoving   = str(application.reason_for_moving)

  const hasEvictions      = bool(application.has_evictions) === true
  const evictionExp       = str(application.eviction_explanation)
  const hasLatePayments   = bool(application.has_late_payments) === true
  const latePayExp        = str(application.late_payment_explanation)
  const hasPets           = bool(application.has_pets) === true
  const petDetails        = str(application.pet_details)

  const socialAnalysis = application.social_media_analysis != null && typeof application.social_media_analysis === 'object'
    ? (application.social_media_analysis as Record<string, unknown>) : null
  const communityHistory = application.community_history != null && typeof application.community_history === 'object'
    ? (application.community_history as Record<string, unknown>) : null
  const scoreBreakdown = application.score_breakdown != null && typeof application.score_breakdown === 'object'
    ? (application.score_breakdown as Record<string, Record<string, unknown>>) : null
  const courtRecords = socialAnalysis?.court_records != null && typeof socialAnalysis.court_records === 'object'
    ? (socialAnalysis.court_records as Record<string, unknown>) : null
  const publicRecordsResult = str(application.public_records_result)

  const negCount = communityHistory && typeof communityHistory.negative_count === 'number' ? communityHistory.negative_count : 0
  const posCount = communityHistory && typeof communityHistory.positive_count === 'number' ? communityHistory.positive_count : 0
  const saRedFlags        = strArr(socialAnalysis?.red_flags)
  const saPositiveSignals = strArr(socialAnalysis?.positive_signals)
  const saAssessment      = str(socialAnalysis?.assessment)
  const saSummary         = str(socialAnalysis?.summary)

  const scoreHex = score !== null ? (score >= 75 ? '#16a34a' : score >= 55 ? '#d97706' : '#dc2626') : '#374151'
  const recHex   = rec === 'approve' ? '#16a34a' : rec === 'review' ? '#d97706' : rec === 'decline' ? '#dc2626' : '#374151'
  const recLabel = rec === 'approve' ? 'APPROVED' : rec === 'review' ? 'REVIEW FURTHER' : rec === 'decline' ? 'DECLINE' : rec.toUpperCase()

  const verLabel: Record<string, string> = {
    verified: 'Verified', discrepancy: 'Discrepancy', unverified: 'Unverified', no_document: 'No document provided',
  }
  const verHex: Record<string, string> = {
    verified: '#16a34a', discrepancy: '#d97706', unverified: '#6b7280', no_document: '#6b7280',
  }
  const docLabel: Record<string, string> = {
    pay_stub: 'Pay Stub', bank_statement: 'Bank Statement', offer_letter: 'Offer Letter', other: 'Other',
  }

  const generatedAt = new Date().toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
  const reportId = String(application.id ?? '').slice(0, 8).toUpperCase()

  // ── HEADER BAR ──────────────────────────────────────────────────────────
  doc.setFillColor('#1e3a5f'); doc.rect(0, 0, PW, 22, 'F')
  setFont(17, 'bold', '#ffffff'); doc.text('TenantIQ', M, 10)
  setFont(9,  'normal', '#93c5fd'); doc.text('Tenant Screening Report', M, 16.5)
  setFont(7.5, 'normal', '#93c5fd')
  doc.text(`Generated: ${generatedAt}`, PW - M, 9, { align: 'right' })
  doc.text(`Report ID: ${reportId}`, PW - M, 15, { align: 'right' })

  // ── SUB-HEADER ──────────────────────────────────────────────────────────
  doc.setFillColor('#1e40af'); doc.rect(0, 22, PW, 10, 'F')
  setFont(8, 'normal', '#bfdbfe'); doc.text('Applicant:', M, 28)
  setFont(8, 'bold', '#ffffff'); doc.text(str(application.full_name), M + 19, 28)
  setFont(8, 'normal', '#bfdbfe'); doc.text('Property:', 95, 28)
  setFont(8, 'bold', '#ffffff')
  const propLabel = property.address ? property.name + '  ·  ' + property.address : property.name
  doc.text(propLabel.slice(0, 60), 108, 28)
  if (monthlyRent) {
    setFont(8, 'normal', '#bfdbfe'); doc.text('Rent:', 170, 28)
    setFont(8, 'bold', '#ffffff'); doc.text(fmt$(monthlyRent) + '/mo', 178, 28)
  }

  y = 37

  // ── SCORE BOX ───────────────────────────────────────────────────────────
  doc.setFillColor('#f8fafc'); doc.setDrawColor('#e2e8f0'); doc.setLineWidth(0.3)
  doc.roundedRect(M, y, W, 26, 2, 2, 'FD')

  let bx = M + 6

  if (score !== null) {
    setFont(28, 'bold', scoreHex); doc.text(String(score), bx, y + 14)
    setFont(7.5, 'normal', '#6b7280'); doc.text('/ 100', bx, y + 19.5)
    bx += 34
    doc.setDrawColor('#e2e8f0'); doc.line(bx, y + 3, bx, y + 23); bx += 7
  }

  if (rec) {
    setFont(7, 'bold', '#6b7280'); doc.text('RECOMMENDATION', bx, y + 7)
    doc.setFillColor(recHex); doc.roundedRect(bx, y + 9, 36, 8, 1.5, 1.5, 'F')
    setFont(8, 'bold', '#ffffff'); doc.text(recLabel, bx + 18, y + 14.5, { align: 'center' })
    if (recReason) {
      setFont(7, 'normal', '#6b7280')
      const rLines = doc.splitTextToSize(recReason, 44) as string[]
      doc.text(rLines[0] ?? '', bx, y + 21)
    }
    bx += 42
    doc.setDrawColor('#e2e8f0'); doc.line(bx, y + 3, bx, y + 23); bx += 7
  }

  if (incomeRatio && effectiveIncome && monthlyRent) {
    setFont(7, 'bold', '#6b7280'); doc.text('INCOME TO RENT', bx, y + 7)
    setFont(20, 'bold', '#374151'); doc.text(incomeRatio + 'x', bx, y + 17)
    setFont(7, 'normal', '#6b7280'); doc.text(fmt$(effectiveIncome) + ' / ' + fmt$(monthlyRent) + ' rent', bx, y + 22)
    bx += 40
    doc.setDrawColor('#e2e8f0'); doc.line(bx, y + 3, bx, y + 23); bx += 7
  }

  // Income verification badge in score box
  if (verStatus) {
    setFont(7, 'bold', '#6b7280'); doc.text('INCOME VERIFIED', bx, y + 7)
    const vHex = verHex[verStatus] ?? '#6b7280'
    doc.setFillColor(vHex + '22'); doc.setDrawColor(vHex)
    doc.roundedRect(bx, y + 9, 30, 6, 1, 1, 'FD')
    setFont(7.5, 'bold', vHex); doc.text(verLabel[verStatus] ?? verStatus, bx + 15, y + 13.2, { align: 'center' })
  }

  y += 31

  // ── AI SUMMARY ──────────────────────────────────────────────────────────
  if (aiSummary) {
    sectionTitle('AI Analysis Summary')
    drawText(aiSummary, M, W, 9); gap(1)
  }

  // ── APPLICANT INFORMATION ────────────────────────────────────────────────
  sectionTitle('Applicant Information')
  const colW = (W - 8) / 2; const colR = M + colW + 8
  const yA0 = y

  field('Full Name',    str(application.full_name))
  field('Email',        str(application.email))
  field('Phone',        str(application.phone))
  const yAL = y; y = yA0

  // Right col: address / move-in
  field('Current Address', str(application.current_address), colR, colW)
  field('Desired Move-in', str(application.move_in_date),    colR, colW)
  y = Math.max(yAL, y) + 2

  // ── INCOME & EMPLOYMENT ─────────────────────────────────────────────────
  sectionTitle('Income & Employment')
  const yI0 = y

  // Left col
  if (monthlyReported !== null) field('Reported Monthly Income', fmt$(monthlyReported) + '/mo', M, colW)
  if (monthlyVerified !== null) field('Verified Monthly Income',  fmt$(monthlyVerified) + '/mo', M, colW)
  if (verStatus) {
    need(10)
    setFont(7.5, 'bold', '#6b7280'); doc.text('VERIFICATION STATUS', M, y); y += 3.3
    const vHex = verHex[verStatus] ?? '#6b7280'
    setFont(9, 'bold', vHex); doc.text(verLabel[verStatus] ?? verStatus, M, y); y += 4
  }
  if (docType)    field('Document Type',      docLabel[docType] ?? docType)
  if (confidence) field('Extraction Confidence', confidence.charAt(0).toUpperCase() + confidence.slice(1))
  if (verNotes)   field('Notes', verNotes)
  const yIL = y; y = yI0

  // Right col: employment
  field('Employer',         employerName, colR, colW)
  field('Time at Job',      timeAtJob,    colR, colW)
  field('Reason for Moving', reasonForMoving, colR, colW)
  y = Math.max(yIL, y) + 2

  // ── SCORE BREAKDOWN ─────────────────────────────────────────────────────
  if (scoreBreakdown) {
    const entries = Object.entries(scoreBreakdown).filter(([, v]) => v && typeof v === 'object')
    if (entries.length > 0) {
      sectionTitle('Score Breakdown')
      for (const [key, item] of entries) {
        const iScore = typeof item.score === 'number' ? item.score : 0
        const iMax   = typeof item.max   === 'number' && item.max > 0 ? item.max : 1
        const iExp   = typeof item.explanation === 'string' ? item.explanation : ''
        const pct    = Math.min(100, (iScore / iMax) * 100)
        const clr    = pct >= 75 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
        const label  = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

        need(12)
        setFont(8.5, 'normal', '#374151'); doc.text(label, M, y)

        const barX = M + 58; const barW = W - 72
        doc.setFillColor('#e5e7eb'); doc.roundedRect(barX, y - 3.2, barW, 4.5, 1, 1, 'F')
        doc.setFillColor(clr);      doc.roundedRect(barX, y - 3.2, (barW * pct) / 100, 4.5, 1, 1, 'F')
        setFont(8.5, 'bold', clr); doc.text(`${iScore}/${iMax}`, PW - M, y, { align: 'right' })
        y += 5.5

        if (iExp) {
          setFont(7.5, 'normal', '#6b7280')
          const expLines = doc.splitTextToSize(iExp, W) as string[]
          need(expLines.length * 3 + 1)
          doc.text(expLines, M, y); y += expLines.length * 3 + 2
        }
      }
      gap(1)
    }
  }

  // ── RED FLAGS ───────────────────────────────────────────────────────────
  if (redFlags.length > 0) {
    sectionTitle('Red Flags', '#dc2626')
    for (const f of redFlags) bullet(f, '#b91c1c')
    gap(1)
  }

  // ── POSITIVE FACTORS ────────────────────────────────────────────────────
  if (posFactors.length > 0) {
    sectionTitle('Positive Factors', '#16a34a')
    for (const f of posFactors) bullet(f, '#15803d')
    gap(1)
  }

  // ── RENTAL HISTORY ──────────────────────────────────────────────────────
  sectionTitle('Rental History')
  yesNoRow('Evictions',     hasEvictions,    evictionExp,   '#dc2626', '#16a34a')
  gap(2)
  yesNoRow('Late Payments', hasLatePayments, latePayExp,    '#d97706', '#16a34a')
  gap(2)
  yesNoRow('Pets',          hasPets,         petDetails,    '#d97706', '#16a34a')
  gap(3)

  // ── REFERENCES ──────────────────────────────────────────────────────────
  const ref1Name = str(application.reference_1_name)
  const ref2Name = str(application.reference_2_name)
  if (ref1Name || ref2Name) {
    sectionTitle('References')

    function refBlock(name: string, rel: string, phone: string, label: string) {
      if (!name) return
      need(18)
      doc.setFillColor('#f8fafc'); doc.setDrawColor('#e2e8f0'); doc.setLineWidth(0.3)
      doc.roundedRect(M, y, W, 14, 1, 1, 'FD')
      setFont(7.5, 'bold', '#6b7280'); doc.text(label, M + 3, y + 4.5)
      setFont(9,   'bold', '#111111'); doc.text(name,  M + 3, y + 9.5)
      if (rel)   { setFont(8.5, 'normal', '#6b7280'); doc.text(rel,   M + 3 + doc.getTextWidth(name) + 4, y + 9.5) }
      if (phone) { setFont(8.5, 'normal', '#374151'); doc.text(phone, PW - M - 3, y + 9.5, { align: 'right' }) }
      y += 17
    }

    refBlock(
      ref1Name,
      str(application.reference_1_relationship),
      str(application.reference_1_phone),
      'REFERENCE 1',
    )
    refBlock(
      ref2Name,
      str(application.reference_2_relationship),
      str(application.reference_2_phone),
      'REFERENCE 2',
    )
    gap(1)
  }

  // ── INTERVIEW QUESTIONS ─────────────────────────────────────────────────
  if (interviewQs.length > 0) {
    sectionTitle('Recommended Interview Questions')
    interviewQs.forEach((q, i) => {
      need(8)
      const lines = doc.splitTextToSize(q, W - 8) as string[]
      setFont(8.5, 'bold',   '#374151'); doc.text(`${i + 1}.`, M, y)
      setFont(8.5, 'normal', '#374151'); doc.text(lines, M + 7, y)
      y += Math.max(lines.length * 3.6, 5.5)
    })
    gap(1)
  }

  // ── COMMUNITY HISTORY ───────────────────────────────────────────────────
  if (communityHistory) {
    sectionTitle('TenantIQ Community History')
    need(22)
    doc.setFillColor('#f0f9ff'); doc.setDrawColor('#bae6fd'); doc.setLineWidth(0.3)
    doc.roundedRect(M, y, W, 20, 1, 1, 'FD')

    setFont(22, 'bold', negCount > 0 ? '#dc2626' : '#16a34a')
    doc.text(String(negCount), M + 15, y + 12, { align: 'center' })
    setFont(7.5, 'normal', '#6b7280'); doc.text(`Negative${negCount !== 1 ? 's' : ''}`, M + 15, y + 17, { align: 'center' })

    doc.setDrawColor('#bae6fd'); doc.line(M + 32, y + 2, M + 32, y + 18)

    setFont(22, 'bold', '#16a34a')
    doc.text(String(posCount), M + 47, y + 12, { align: 'center' })
    setFont(7.5, 'normal', '#6b7280'); doc.text(`Positive${posCount !== 1 ? 's' : ''}`, M + 47, y + 17, { align: 'center' })

    const histMsg = communityHistory.has_history === true
      ? 'This applicant has a history within the TenantIQ landlord community.'
      : 'No history found in the TenantIQ landlord community.'
    setFont(8.5, 'normal', '#374151')
    const histLines = doc.splitTextToSize(histMsg, W - 66) as string[]
    doc.text(histLines, M + 62, y + 9)

    y += 24; gap(1)
  }

  // ── PUBLIC RECORDS CHECK ─────────────────────────────────────────────────
  if (publicRecordsResult || courtRecords) {
    sectionTitle('Public Records Check', '#1e40af')

    const found = courtRecords?.found === true
    const displayText = publicRecordsResult || str(courtRecords?.summary)
    const detailText  = publicRecordsResult ? '' : str(courtRecords?.details)

    const textLines   = displayText ? (doc.splitTextToSize(displayText, W - 8) as string[]) : []
    const detailLines = detailText  ? (doc.splitTextToSize(detailText,  W - 8) as string[]) : []
    const boxH = 8 + textLines.length * 3.6 + (detailLines.length > 0 ? detailLines.length * 3.4 + 2 : 0) + 2

    need(boxH + 2)
    doc.setFillColor(found ? '#fef2f2' : '#f0fdf4')
    doc.setDrawColor(found ? '#fca5a5' : '#86efac')
    doc.setLineWidth(0.3)
    doc.roundedRect(M, y, W, boxH, 1, 1, 'FD')

    setFont(8.5, 'bold', found ? '#dc2626' : '#166534')
    doc.text(found ? 'Records Found' : 'No Records Found', M + 3, y + 5.5)

    let cy = y + 10
    if (textLines.length > 0) {
      setFont(8.5, 'normal', '#374151'); doc.text(textLines, M + 3, cy)
      cy += textLines.length * 3.6 + 1
    }
    if (detailLines.length > 0) {
      setFont(8, 'normal', '#6b7280'); doc.text(detailLines, M + 3, cy)
    }
    y += boxH + 3

    if (saAssessment || saSummary || saRedFlags.length > 0 || saPositiveSignals.length > 0) {
      gap(1)
      if (saAssessment) field('Online Presence Assessment', saAssessment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
      if (saSummary) { drawText(saSummary, M, W, 8.5); gap(2) }
      if (saRedFlags.length > 0) {
        need(8); setFont(7.5, 'bold', '#dc2626'); doc.text('ONLINE RED FLAGS', M, y); y += 3.5
        for (const f of saRedFlags) bullet(f, '#dc2626')
      }
      if (saPositiveSignals.length > 0) {
        need(8); setFont(7.5, 'bold', '#16a34a'); doc.text('POSITIVE SIGNALS', M, y); y += 3.5
        for (const s of saPositiveSignals) bullet(s, '#16a34a')
      }
    }
    gap(1)
  }

  // ── DISCLAIMER ──────────────────────────────────────────────────────────
  need(22)
  doc.setDrawColor('#e5e7eb'); doc.setLineWidth(0.3); doc.line(M, y, M + W, y); y += 4.5
  const disclaimer =
    'Disclaimer: This report is generated by TenantIQ using AI analysis and publicly available information. ' +
    'It is intended to assist landlords in their decision-making process and should not be the sole basis for rental decisions. ' +
    'TenantIQ does not guarantee the accuracy or completeness of this report. ' +
    'All screening decisions must comply with applicable human rights and privacy legislation, including the Ontario Human Rights Code and PIPEDA.'
  setFont(7.5, 'normal', '#6b7280')
  doc.text(doc.splitTextToSize(disclaimer, W) as string[], M, y)

  return doc.output('arraybuffer')
}

// ── Route handler ─────────────────────────────────────────────────────────────

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
      .select('*, properties (name, address, city, monthly_rent, landlord_id)')
      .eq('id', id)
      .single()

    if (error || !application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    const property = application.properties as {
      name: string
      address: string | null
      city: string | null
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
