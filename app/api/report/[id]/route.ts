import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { globalApiRateLimit } from '@/lib/api-rate-limit'
import chromium from '@sparticuz/chromium'
import puppeteer from 'puppeteer-core'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function esc(s: unknown): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

function scoreColor(score: number): string {
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#d97706'
  return '#dc2626'
}

function recLabel(rec: string): string {
  if (rec === 'approve') return 'APPROVED'
  if (rec === 'review') return 'REVIEW'
  if (rec === 'decline') return 'DECLINED'
  return rec.toUpperCase()
}

function recColor(rec: string): string {
  if (rec === 'approve') return '#16a34a'
  if (rec === 'review') return '#d97706'
  return '#dc2626'
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

function generateHTML(
  application: Record<string, unknown>,
  property: { name: string; address: string | null; monthly_rent: number | null },
): string {
  const score = typeof application.score === 'number' ? application.score : null
  const rec = str(application.recommendation)
  const redFlags = strArr(application.red_flags)
  const positiveFactors = strArr(application.positive_factors)
  const interviewQs = strArr(application.interview_questions)

  const socialAnalysis =
    application.social_media_analysis != null &&
    typeof application.social_media_analysis === 'object'
      ? (application.social_media_analysis as Record<string, unknown>)
      : null

  const communityHistory =
    application.community_history != null &&
    typeof application.community_history === 'object'
      ? (application.community_history as Record<string, unknown>)
      : null

  const scoreBreakdown =
    application.score_breakdown != null &&
    typeof application.score_breakdown === 'object'
      ? (application.score_breakdown as Record<string, unknown>)
      : null

  const courtRecords =
    socialAnalysis?.court_records != null &&
    typeof socialAnalysis.court_records === 'object'
      ? (socialAnalysis.court_records as Record<string, unknown>)
      : null

  const negCount =
    communityHistory && typeof communityHistory.negative_count === 'number'
      ? communityHistory.negative_count
      : 0
  const posCount =
    communityHistory && typeof communityHistory.positive_count === 'number'
      ? communityHistory.positive_count
      : 0
  const hasHistory = communityHistory?.has_history === true

  const saRedFlags = strArr(socialAnalysis?.red_flags)
  const saPositiveSignals = strArr(socialAnalysis?.positive_signals)
  const saAssessment = str(socialAnalysis?.assessment)
  const saSummary = str(socialAnalysis?.summary)

  const generatedAt = new Date().toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const reportId = String(application.id ?? '').slice(0, 8).toUpperCase()
  const monthlyRent = property.monthly_rent
  const monthlyIncome =
    typeof application.monthly_income === 'number' ? application.monthly_income : null
  const incomeRatio =
    monthlyIncome && monthlyRent ? (monthlyIncome / monthlyRent).toFixed(1) : null

  // Score breakdown rows
  const breakdownRows = scoreBreakdown
    ? Object.entries(scoreBreakdown)
        .filter(([, val]) => typeof val === 'number')
        .map(([key, val]) => {
          const pct = Math.min(100, Math.max(0, val as number))
          const label =
            BREAKDOWN_LABELS[key] ||
            key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
          const color =
            pct >= 75 ? '#16a34a' : pct >= 55 ? '#d97706' : '#dc2626'
          return `<div class="bar-row">
            <div class="bar-label">${esc(label)}</div>
            <div class="bar-track"><div class="bar-fill" style="width:${Math.round(pct)}%;background:${color}"></div></div>
            <div class="bar-num" style="color:${color}">${Math.round(pct)}</div>
          </div>`
        })
        .join('')
    : ''

  const hasRef1 = typeof application.reference_1_name === 'string'
  const hasRef2 = typeof application.reference_2_name === 'string'

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Arial,Helvetica,sans-serif;font-size:11px;color:#111;background:white}
.header{background:#1e3a5f;color:white;padding:18px 24px;display:flex;justify-content:space-between;align-items:flex-start}
.header h1{font-size:20px;font-weight:700;letter-spacing:-0.5px}
.header p{font-size:11px;color:#93c5fd;margin-top:2px}
.header-right{text-align:right;font-size:9px;color:#93c5fd;line-height:1.7}
.subheader{background:#1e40af;color:white;padding:7px 24px;font-size:10px;display:flex;gap:28px;flex-wrap:wrap}
.subheader span{color:#bfdbfe}
.subheader strong{color:white}
.body{padding:14px 24px}
.score-section{display:flex;align-items:center;gap:20px;padding:14px 18px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;margin-bottom:14px}
.score-num{font-size:48px;font-weight:700;line-height:1}
.score-label{font-size:9px;color:#6b7280;margin-top:2px}
.rec-badge{padding:4px 12px;border-radius:4px;color:white;font-size:11px;font-weight:700;letter-spacing:0.5px;display:inline-block}
.divider{width:1px;background:#e2e8f0;height:44px;flex-shrink:0}
.section{margin-bottom:12px}
.section-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#374151;border-bottom:1px solid #e5e7eb;padding-bottom:3px;margin-bottom:7px}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.field-row{margin-bottom:4px}
.field-label{font-size:8.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:#6b7280;margin-bottom:1px}
.field-value{font-size:11px;color:#111}
.summary-text{font-size:11px;line-height:1.6;color:#374151}
ul.item-list{list-style:none;padding:0}
ul.item-list li{padding:2px 0 2px 12px;font-size:11px;line-height:1.4;position:relative}
ul.item-list li::before{content:'•';position:absolute;left:0}
ul.item-list.red li::before{color:#dc2626}
ul.item-list.green li::before{color:#16a34a}
ul.item-list.blue li::before{color:#2563eb}
.bar-row{display:flex;align-items:center;margin-bottom:5px;gap:10px}
.bar-label{width:155px;font-size:10px;color:#374151;flex-shrink:0}
.bar-track{flex:1;height:7px;background:#e5e7eb;border-radius:4px;overflow:hidden}
.bar-fill{height:100%;border-radius:4px}
.bar-num{width:28px;text-align:right;font-size:10px;font-weight:600}
.card{background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;padding:8px 10px;margin-bottom:6px}
.eviction-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:4px;padding:8px 10px;margin-top:6px}
.court-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:4px;padding:9px 11px;margin-bottom:7px}
.court-box.clean{background:#f0fdf4;border-color:#86efac}
.comm-box{background:#f0f9ff;border:1px solid #bae6fd;border-radius:4px;padding:9px 12px}
.interview-item{display:flex;gap:7px;margin-bottom:4px}
.interview-num{font-size:11px;font-weight:600;color:#374151;flex-shrink:0;width:16px}
.interview-text{font-size:11px;line-height:1.4;color:#374151}
.footer{margin-top:18px;border-top:1px solid #e5e7eb;padding-top:9px;font-size:9px;color:#6b7280;line-height:1.5}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>TenantIQ</h1>
    <p>Tenant Screening Report</p>
  </div>
  <div class="header-right">
    Generated: ${esc(generatedAt)}<br>
    Report ID: ${esc(reportId)}
  </div>
</div>

<div class="subheader">
  <div><span>Applicant: </span><strong>${esc(application.full_name)}</strong></div>
  <div><span>Property: </span><strong>${esc(property.name)}</strong></div>
  ${property.address ? `<div><span>Address: </span><strong>${esc(property.address)}</strong></div>` : ''}
  ${monthlyRent ? `<div><span>Rent: </span><strong>$${Number(monthlyRent).toLocaleString()}/mo</strong></div>` : ''}
</div>

<div class="body">

<div class="score-section">
  ${score !== null ? `
  <div>
    <div class="score-num" style="color:${scoreColor(score)}">${score}</div>
    <div class="score-label">out of 100</div>
  </div>
  <div class="divider"></div>` : ''}
  ${rec ? `
  <div>
    <div class="field-label" style="margin-bottom:4px">Recommendation</div>
    <div class="rec-badge" style="background:${recColor(rec)}">${recLabel(rec)}</div>
  </div>` : ''}
  ${incomeRatio && monthlyIncome && monthlyRent ? `
  <div class="divider"></div>
  <div>
    <div class="field-label" style="margin-bottom:2px">Income to Rent</div>
    <div style="font-size:14px;font-weight:700;color:#374151">${incomeRatio}x</div>
    <div style="font-size:9px;color:#6b7280">$${Number(monthlyIncome).toLocaleString()} / $${Number(monthlyRent).toLocaleString()}</div>
  </div>` : ''}
</div>

${str(application.ai_summary) ? `
<div class="section">
  <div class="section-title">AI Analysis Summary</div>
  <div class="summary-text">${esc(application.ai_summary)}</div>
</div>` : ''}

<div class="grid-2">
  <div class="section">
    <div class="section-title">Applicant Information</div>
    <div class="field-row"><div class="field-label">Full Name</div><div class="field-value">${esc(application.full_name)}</div></div>
    <div class="field-row"><div class="field-label">Email</div><div class="field-value">${esc(application.email)}</div></div>
    ${application.phone ? `<div class="field-row"><div class="field-label">Phone</div><div class="field-value">${esc(application.phone)}</div></div>` : ''}
    ${application.date_of_birth ? `<div class="field-row"><div class="field-label">Date of Birth</div><div class="field-value">${esc(application.date_of_birth)}</div></div>` : ''}
    ${application.sin_last_three ? `<div class="field-row"><div class="field-label">SIN (last 3)</div><div class="field-value">&bull;&bull;&bull; &bull;&bull;&bull; ${esc(application.sin_last_three)}</div></div>` : ''}
    ${application.current_address ? `<div class="field-row"><div class="field-label">Current Address</div><div class="field-value">${esc(application.current_address)}</div></div>` : ''}
    ${application.move_in_date ? `<div class="field-row"><div class="field-label">Desired Move-in</div><div class="field-value">${esc(application.move_in_date)}</div></div>` : ''}
  </div>
  <div class="section">
    <div class="section-title">Income &amp; Employment</div>
    ${monthlyIncome !== null ? `<div class="field-row"><div class="field-label">Monthly Income</div><div class="field-value">$${Number(monthlyIncome).toLocaleString()}</div></div>` : ''}
    ${application.employer_name ? `<div class="field-row"><div class="field-label">Employer</div><div class="field-value">${esc(application.employer_name)}</div></div>` : ''}
    ${application.occupation ? `<div class="field-row"><div class="field-label">Occupation</div><div class="field-value">${esc(application.occupation)}</div></div>` : ''}
    ${application.income_source ? `<div class="field-row"><div class="field-label">Income Source</div><div class="field-value">${esc(application.income_source)}</div></div>` : ''}
  </div>
</div>

${breakdownRows ? `
<div class="section">
  <div class="section-title">Score Breakdown</div>
  ${breakdownRows}
</div>` : ''}

${redFlags.length > 0 || positiveFactors.length > 0 ? `
<div class="grid-2">
  ${redFlags.length > 0 ? `
  <div class="section">
    <div class="section-title" style="color:#dc2626">Red Flags</div>
    <ul class="item-list red">${redFlags.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
  </div>` : ''}
  ${positiveFactors.length > 0 ? `
  <div class="section">
    <div class="section-title" style="color:#16a34a">Positive Factors</div>
    <ul class="item-list green">${positiveFactors.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
  </div>` : ''}
</div>` : ''}

<div class="section">
  <div class="section-title">Rental History</div>
  <div class="grid-2">
    <div>
      ${application.previous_address ? `<div class="field-row"><div class="field-label">Previous Address</div><div class="field-value">${esc(application.previous_address)}</div></div>` : ''}
      ${application.reason_for_leaving ? `<div class="field-row"><div class="field-label">Reason for Leaving</div><div class="field-value">${esc(application.reason_for_leaving)}</div></div>` : ''}
    </div>
    <div>
      ${application.previous_landlord_name ? `<div class="field-row"><div class="field-label">Previous Landlord</div><div class="field-value">${esc(application.previous_landlord_name)}</div></div>` : ''}
      ${application.previous_landlord_phone ? `<div class="field-row"><div class="field-label">Landlord Phone</div><div class="field-value">${esc(application.previous_landlord_phone)}</div></div>` : ''}
    </div>
  </div>
  ${application.has_evictions === true ? `
  <div class="eviction-box">
    <div style="font-size:10px;font-weight:700;color:#dc2626;margin-bottom:2px">EVICTION HISTORY REPORTED</div>
    ${str(application.eviction_explanation) ? `<div style="font-size:10px;color:#374151">${esc(application.eviction_explanation)}</div>` : ''}
  </div>` : ''}
</div>

${hasRef1 || hasRef2 ? `
<div class="section">
  <div class="section-title">References</div>
  <div class="grid-2">
    ${hasRef1 ? `
    <div class="card">
      <div class="field-value">${esc(application.reference_1_name)}</div>
      ${typeof application.reference_1_relationship === 'string' ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${esc(application.reference_1_relationship)}</div>` : ''}
    </div>` : ''}
    ${hasRef2 ? `
    <div class="card">
      <div class="field-value">${esc(application.reference_2_name)}</div>
      ${typeof application.reference_2_relationship === 'string' ? `<div style="font-size:10px;color:#6b7280;margin-top:2px">${esc(application.reference_2_relationship)}</div>` : ''}
    </div>` : ''}
  </div>
</div>` : ''}

${communityHistory ? `
<div class="section">
  <div class="section-title">TenantIQ Community History</div>
  <div class="comm-box">
    <div style="display:flex;gap:24px;align-items:center">
      <div>
        <div style="font-size:18px;font-weight:700;color:${negCount > 0 ? '#dc2626' : '#16a34a'}">${negCount}</div>
        <div style="font-size:9px;color:#6b7280">Negative${negCount !== 1 ? 's' : ''}</div>
      </div>
      <div>
        <div style="font-size:18px;font-weight:700;color:#16a34a">${posCount}</div>
        <div style="font-size:9px;color:#6b7280">Positive${posCount !== 1 ? 's' : ''}</div>
      </div>
      <div style="font-size:10px;color:#374151;flex:1">
        ${hasHistory ? 'This applicant has a history within the TenantIQ landlord community.' : 'No history found in the TenantIQ landlord community.'}
      </div>
    </div>
  </div>
</div>` : ''}

${socialAnalysis !== null && application.social_media_consent === true ? `
<div class="section">
  <div class="section-title">Public Records &amp; Online Presence</div>
  ${courtRecords ? `
  <div class="${courtRecords.found === true ? 'court-box' : 'court-box clean'}">
    <div style="font-size:10px;font-weight:700;color:${courtRecords.found === true ? '#dc2626' : '#166534'};margin-bottom:3px">
      Court Records: ${courtRecords.found === true ? 'Records Found' : 'No Records Found'}
    </div>
    ${str(courtRecords.summary) ? `<div style="font-size:10px;color:#374151">${esc(courtRecords.summary)}</div>` : ''}
    ${str(courtRecords.details) ? `<div style="font-size:10px;color:#374151;margin-top:3px">${esc(courtRecords.details)}</div>` : ''}
  </div>` : ''}
  ${saAssessment ? `<div class="field-row"><div class="field-label">Online Presence</div><div class="field-value">${esc(saAssessment.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))}</div></div>` : ''}
  ${saSummary ? `<div style="font-size:10px;color:#374151;margin:5px 0;line-height:1.5">${esc(saSummary)}</div>` : ''}
  ${saRedFlags.length > 0 || saPositiveSignals.length > 0 ? `
  <div class="grid-2">
    ${saRedFlags.length > 0 ? `
    <div>
      <div class="field-label" style="color:#dc2626;margin-bottom:3px">Online Red Flags</div>
      <ul class="item-list red">${saRedFlags.map(f => `<li>${esc(f)}</li>`).join('')}</ul>
    </div>` : ''}
    ${saPositiveSignals.length > 0 ? `
    <div>
      <div class="field-label" style="color:#16a34a;margin-bottom:3px">Positive Signals</div>
      <ul class="item-list green">${saPositiveSignals.map(s => `<li>${esc(s)}</li>`).join('')}</ul>
    </div>` : ''}
  </div>` : ''}
</div>` : ''}

${interviewQs.length > 0 ? `
<div class="section">
  <div class="section-title">Recommended Interview Questions</div>
  ${interviewQs.map((q, i) => `
  <div class="interview-item">
    <div class="interview-num">${i + 1}.</div>
    <div class="interview-text">${esc(q)}</div>
  </div>`).join('')}
</div>` : ''}

<div class="footer">
  <strong>Disclaimer:</strong> This report is generated by TenantIQ using AI analysis and publicly available information. It is intended to assist landlords in their decision-making process and should not be the sole basis for rental decisions. TenantIQ does not guarantee the accuracy or completeness of this report. All screening decisions must comply with applicable human rights and privacy legislation.
</div>

</div>
</body>
</html>`
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
    const {
      data: { user },
    } = await supabase.auth.getUser()

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

    const html = generateHTML(application as Record<string, unknown>, property)

    let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null
    try {
      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(
          process.env.CHROMIUM_EXECUTABLE_PATH,
        ),
        headless: true,
      })

      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'domcontentloaded' })
      const pdfData = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '12mm', right: '14mm', bottom: '12mm', left: '14mm' },
      })
      const pdfBuffer = Buffer.from(pdfData)

      console.log(`[report] PDF generated — bytes=${pdfBuffer.byteLength}`)

      const safeName = String(application.full_name ?? 'report')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="tenantiq_report_${safeName}.pdf"`,
        },
      })
    } finally {
      if (browser) await browser.close().catch(() => {})
    }
  } catch (error) {
    console.error('[report] PDF generation failed —', error)
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 })
  }
}
