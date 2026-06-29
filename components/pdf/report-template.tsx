import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ScoreItem { score: number; max: number; explanation: string }

interface CourtRecords {
  found: boolean
  summary: string
  details: string | null
}

interface SocialAnalysis {
  assessment: string
  positive_signals: string[]
  red_flags: string[]
  summary: string
  court_records?: CourtRecords
}

interface CommunityMatch {
  rating: 'positive' | 'negative'
  description: string | null
  created_at: string
  property_address: string | null
  match_reason: string
  is_disputed: boolean
}

interface CommunityHistory {
  positive_count: number
  negative_count: number
  matches: CommunityMatch[]
}

export interface ReportProps {
  application: {
    full_name: string
    email: string
    phone: string
    monthly_income_reported: number
    income_verified: number | null
    income_verification_status: string | null
    income_verification_notes: string | null
    employer_name: string
    time_at_job: string
    reason_for_moving: string
    has_evictions: boolean
    eviction_explanation: string | null
    has_late_payments: boolean
    late_payment_explanation: string | null
    has_pets: boolean
    pet_details: string | null
    reference_1_name: string | null
    reference_1_relationship: string | null
    reference_1_phone: string | null
    reference_2_name: string | null
    reference_2_relationship: string | null
    reference_2_phone: string | null
    score: number | null
    score_breakdown: Record<string, ScoreItem> | null
    red_flags: string[] | null
    positive_factors: string[] | null
    interview_questions: string[] | null
    recommendation: string | null
    recommendation_reason: string | null
    ai_summary: string | null
    status: string
    created_at: string
    community_history: CommunityHistory | null
    social_media_analysis: SocialAnalysis | null
    social_media_consent: boolean | null
  }
  property: { name: string; address: string | null; monthly_rent: number }
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 48,
    paddingBottom: 72,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1d4ed8',
  },
  logo: { fontSize: 20, fontFamily: 'Helvetica-Bold', color: '#1d4ed8' },
  headerLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1 },
  headerValue: { fontSize: 10, color: '#1e293b', fontFamily: 'Helvetica-Bold' },
  headerRight: { alignItems: 'flex-end' },
  // Score row
  scoreSection: { flexDirection: 'row', marginBottom: 20 },
  scoreBox: {
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    marginRight: 16,
  },
  scoreNumber: { fontSize: 36, fontFamily: 'Helvetica-Bold' },
  scoreSubLabel: { fontSize: 8, color: '#64748b', marginTop: 2 },
  recBox: { flex: 1, borderRadius: 10, padding: 16 },
  recLabel: { fontSize: 8, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  recValue: { fontSize: 18, fontFamily: 'Helvetica-Bold', marginBottom: 6 },
  recReason: { fontSize: 9, color: '#475569', lineHeight: 1.5 },
  // Sections
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sectionTitleRed:   { color: '#dc2626' },
  sectionTitleGreen: { color: '#16a34a' },
  sectionTitleGray:  { color: '#64748b' },
  // Fields
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  field: { width: '50%', marginBottom: 8, paddingRight: 8 },
  fieldFull: { width: '100%', marginBottom: 8 },
  fieldLabel: { fontSize: 8, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  fieldValue: { fontSize: 10, color: '#1e293b' },
  // Score breakdown
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  },
  scoreRowLabel: { flex: 1, fontSize: 9, color: '#475569' },
  scoreRowBar: { width: 80, height: 5, backgroundColor: '#e2e8f0', borderRadius: 3, marginRight: 8 },
  scoreRowFill: { height: 5, borderRadius: 3 },
  scoreRowValue: { width: 36, fontSize: 9, fontFamily: 'Helvetica-Bold', textAlign: 'right' },
  // Lists
  listItem: { flexDirection: 'row', marginBottom: 4 },
  bullet: { width: 14, fontSize: 9 },
  listText: { flex: 1, fontSize: 9, color: '#475569', lineHeight: 1.5 },
  // Badges
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: 'flex-start' },
  badgeText: { fontSize: 9, fontFamily: 'Helvetica-Bold' },
  // Info boxes
  infoBox: { borderRadius: 6, padding: 10, marginBottom: 8 },
  infoBoxText: { fontSize: 9, lineHeight: 1.5 },
  // Two-column layout
  cols: { flexDirection: 'row' },
  col: { flex: 1, paddingRight: 8 },
  colRight: { flex: 1, paddingLeft: 8 },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: { fontSize: 8, color: '#94a3b8' },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRecColors(rec: string | null) {
  if (rec === 'approve') return { bg: '#f0fdf4', text: '#16a34a', label: 'APPROVE' }
  if (rec === 'review')  return { bg: '#fefce8', text: '#ca8a04', label: 'REVIEW FURTHER' }
  return                        { bg: '#fef2f2', text: '#dc2626', label: 'DECLINE' }
}

function getScoreColor(score: number | null) {
  if (score == null) return '#94a3b8'
  if (score >= 75)   return '#16a34a'
  if (score >= 55)   return '#ca8a04'
  return                    '#dc2626'
}

function getVerColors(status: string | null) {
  if (status === 'verified')    return { bg: '#f0fdf4', text: '#16a34a', label: 'VERIFIED' }
  if (status === 'discrepancy') return { bg: '#fef2f2', text: '#dc2626', label: 'DISCREPANCY' }
  if (status === 'unverified')  return { bg: '#f8fafc', text: '#64748b', label: 'UNVERIFIED' }
  return                               { bg: '#f8fafc', text: '#94a3b8', label: 'NO DOCUMENT' }
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-CA')
}

// Ensure a value from JSONB is a plain string. Anything else becomes ''.
function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

// Ensure a value from JSONB is an array of plain strings.
function strArr(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string')
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ReportDocument({ application: a, property }: ReportProps) {
  const recColors  = getRecColors(a.recommendation)
  const verColors  = getVerColors(a.income_verification_status)
  const scoreColor = getScoreColor(a.score)

  const effectiveIncome = a.income_verified ?? a.monthly_income_reported
  const ratio = property.monthly_rent > 0
    ? (effectiveIncome / property.monthly_rent).toFixed(1) + 'x'
    : '—'

  const breakdown = a.score_breakdown
  const redFlags        = strArr(a.red_flags)
  const positiveFactors = strArr(a.positive_factors)
  const interviewQs     = strArr(a.interview_questions)
  const communityHistory  = a.community_history as CommunityHistory | null
  const communityMatches  = Array.isArray(communityHistory?.matches) ? communityHistory!.matches : []

  const socialAnalysis    = a.social_media_analysis as SocialAnalysis | null
  const saAssessment      = str(socialAnalysis?.assessment)
  const saRedFlags        = strArr(socialAnalysis?.red_flags)
  const saPositiveSignals = strArr(socialAnalysis?.positive_signals)
  const saSummary         = str(socialAnalysis?.summary)
  const courtRecords      = (socialAnalysis?.court_records != null && typeof socialAnalysis.court_records === 'object')
    ? socialAnalysis.court_records as CourtRecords
    : null

  const hasRedOrPositive = redFlags.length > 0 || positiveFactors.length > 0

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>TenantIQ</Text>
            <Text style={[s.headerLabel, { marginTop: 4 }]}>Tenant Screening Report</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerLabel}>Property</Text>
            <Text style={s.headerValue}>{property.name}</Text>
            <Text style={[s.headerLabel, { marginTop: 6 }]}>Monthly Rent</Text>
            <Text style={s.headerValue}>${fmt(property.monthly_rent)}/mo</Text>
            <Text style={[s.headerLabel, { marginTop: 6 }]}>Report Date</Text>
            <Text style={s.headerValue}>{fmtDate(new Date().toISOString())}</Text>
          </View>
        </View>

        {/* ── Score + Recommendation ── */}
        <View style={s.scoreSection}>
          <View style={[s.scoreBox, { backgroundColor: scoreColor + '18', borderWidth: 2, borderColor: scoreColor }]}>
            <Text style={[s.scoreNumber, { color: scoreColor }]}>
              {a.score != null ? String(a.score) : '—'}
            </Text>
            <Text style={s.scoreSubLabel}>out of 100</Text>
          </View>
          <View style={[s.recBox, { backgroundColor: recColors.bg }]}>
            <Text style={[s.recLabel, { color: recColors.text }]}>Recommendation</Text>
            <Text style={[s.recValue, { color: recColors.text }]}>{recColors.label}</Text>
            <Text style={s.recReason}>{a.recommendation_reason || 'Analysis pending'}</Text>
          </View>
        </View>

        {/* ── AI Summary ── */}
        {!!a.ai_summary && (
          <View style={[s.section, { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12 }]}>
            <Text style={[s.sectionTitle, { borderBottomWidth: 0, marginBottom: 4 }]}>AI Summary</Text>
            <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.6 }}>{a.ai_summary}</Text>
          </View>
        )}

        {/* ── Applicant Info ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Applicant Information</Text>
          <View style={s.grid}>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Full Name</Text>
              <Text style={s.fieldValue}>{a.full_name}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Email</Text>
              <Text style={s.fieldValue}>{a.email}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Phone</Text>
              <Text style={s.fieldValue}>{a.phone}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Applied</Text>
              <Text style={s.fieldValue}>{fmtDate(a.created_at)}</Text>
            </View>
          </View>
        </View>

        {/* ── Income & Employment ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Income & Employment</Text>
          <View style={s.grid}>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Self-Reported Income</Text>
              <Text style={s.fieldValue}>${fmt(a.monthly_income_reported)}/mo</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Verified Income</Text>
              <Text style={s.fieldValue}>
                {a.income_verified != null ? `$${fmt(a.income_verified)}/mo` : 'Not verified'}
              </Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Income-to-Rent Ratio</Text>
              <Text style={s.fieldValue}>{ratio}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Income Verification</Text>
              <View style={[s.badge, { backgroundColor: verColors.bg }]}>
                <Text style={[s.badgeText, { color: verColors.text }]}>{verColors.label}</Text>
              </View>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Employer</Text>
              <Text style={s.fieldValue}>{a.employer_name}</Text>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Time at Job</Text>
              <Text style={s.fieldValue}>{a.time_at_job}</Text>
            </View>
            <View style={s.fieldFull}>
              <Text style={s.fieldLabel}>Reason for Moving</Text>
              <Text style={s.fieldValue}>{a.reason_for_moving}</Text>
            </View>
          </View>
        </View>

        {/* ── Score Breakdown ── */}
        {!!breakdown && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Score Breakdown</Text>
            {Object.entries(breakdown).filter(([, item]) => item != null).map(([key, item]) => {
              const scoreVal = item.score ?? 0
              const maxVal   = item.max   ?? 0
              const pct      = maxVal > 0 ? scoreVal / maxVal : 0
              const pctClamped = Math.max(0, Math.min(100, Math.round(pct * 100)))
              const fillColor = pct >= 0.75 ? '#16a34a' : pct >= 0.5 ? '#ca8a04' : '#dc2626'
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              return (
                <View key={key} style={s.scoreRow}>
                  <Text style={s.scoreRowLabel}>{label}</Text>
                  <View style={s.scoreRowBar}>
                    <View style={[s.scoreRowFill, { width: pctClamped + '%', backgroundColor: fillColor }]} />
                  </View>
                  <Text style={[s.scoreRowValue, { color: fillColor }]}>
                    {String(scoreVal)}/{String(maxVal)}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* ── Red Flags & Positive Factors ── */}
        {hasRedOrPositive && (
          <View style={[s.cols, { marginBottom: 18 }]}>
            {redFlags.length > 0 && (
              <View style={s.col}>
                <Text style={[s.sectionTitle, s.sectionTitleRed]}>Red Flags</Text>
                {redFlags.map((flag, i) => (
                  <View key={i} style={s.listItem}>
                    <Text style={[s.bullet, { color: '#dc2626' }]}>•</Text>
                    <Text style={s.listText}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}
            {positiveFactors.length > 0 && (
              <View style={redFlags.length > 0 ? s.colRight : s.col}>
                <Text style={[s.sectionTitle, s.sectionTitleGreen]}>Positive Factors</Text>
                {positiveFactors.map((factor, i) => (
                  <View key={i} style={s.listItem}>
                    <Text style={[s.bullet, { color: '#16a34a' }]}>•</Text>
                    <Text style={s.listText}>{factor}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ── Rental History ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Rental History</Text>
          <View style={s.grid}>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Evictions</Text>
              <Text style={[s.fieldValue, { color: a.has_evictions ? '#dc2626' : '#16a34a' }]}>
                {a.has_evictions ? 'Yes' : 'None reported'}
              </Text>
              {a.has_evictions && !!a.eviction_explanation && (
                <Text style={[s.listText, { marginTop: 2 }]}>{a.eviction_explanation}</Text>
              )}
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Late Payments</Text>
              <Text style={[s.fieldValue, { color: a.has_late_payments ? '#ca8a04' : '#16a34a' }]}>
                {a.has_late_payments ? 'Yes' : 'None reported'}
              </Text>
              {a.has_late_payments && !!a.late_payment_explanation && (
                <Text style={[s.listText, { marginTop: 2 }]}>{a.late_payment_explanation}</Text>
              )}
            </View>
            {a.has_pets && (
              <View style={s.field}>
                <Text style={s.fieldLabel}>Pets</Text>
                <Text style={[s.fieldValue, { color: '#ca8a04' }]}>Yes</Text>
                {!!a.pet_details && (
                  <Text style={[s.listText, { marginTop: 2 }]}>{a.pet_details}</Text>
                )}
              </View>
            )}
          </View>
        </View>

        {/* ── References ── */}
        {(!!a.reference_1_name || !!a.reference_2_name) && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>References</Text>
            <View style={s.grid}>
              {!!a.reference_1_name && (
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Reference 1</Text>
                  <Text style={s.fieldValue}>{a.reference_1_name}</Text>
                  <Text style={[s.listText, { marginTop: 2 }]}>
                    {a.reference_1_relationship || ''}{a.reference_1_relationship && a.reference_1_phone ? ' · ' : ''}{a.reference_1_phone || ''}
                  </Text>
                </View>
              )}
              {!!a.reference_2_name && (
                <View style={s.field}>
                  <Text style={s.fieldLabel}>Reference 2</Text>
                  <Text style={s.fieldValue}>{a.reference_2_name}</Text>
                  <Text style={[s.listText, { marginTop: 2 }]}>
                    {a.reference_2_relationship || ''}{a.reference_2_relationship && a.reference_2_phone ? ' · ' : ''}{a.reference_2_phone || ''}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Community History ── */}
        {!!communityHistory && communityMatches.length > 0 && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, (communityHistory.negative_count ?? 0) > 0 ? s.sectionTitleRed : s.sectionTitleGreen]}>
              Community History
            </Text>
            {(communityHistory.negative_count ?? 0) > 0 && (
              <View style={[s.infoBox, { backgroundColor: '#fef2f2' }]}>
                <Text style={[s.infoBoxText, { color: '#dc2626', fontFamily: 'Helvetica-Bold' }]}>
                  {communityHistory.negative_count} negative rating{communityHistory.negative_count !== 1 ? 's' : ''} from TenantIQ landlords
                </Text>
              </View>
            )}
            {(communityHistory.positive_count ?? 0) > 0 && (communityHistory.negative_count ?? 0) === 0 && (
              <View style={[s.infoBox, { backgroundColor: '#f0fdf4' }]}>
                <Text style={[s.infoBoxText, { color: '#16a34a', fontFamily: 'Helvetica-Bold' }]}>
                  {communityHistory.positive_count} positive rating{communityHistory.positive_count !== 1 ? 's' : ''} from TenantIQ landlords
                </Text>
              </View>
            )}
            {communityMatches.slice(0, 5).map((m, i) => (
              <View key={i} style={[s.infoBox, {
                backgroundColor: m.rating === 'positive' ? '#f0fdf4' : '#fef2f2',
                marginBottom: 4,
              }]}>
                <Text style={[s.infoBoxText, { fontFamily: 'Helvetica-Bold', color: m.rating === 'positive' ? '#16a34a' : '#dc2626' }]}>
                  {m.rating === 'positive' ? '▲ Positive' : '▼ Negative'} — {fmtDate(m.created_at)}
                  {m.is_disputed ? ' [DISPUTED]' : ''}
                </Text>
                {typeof m.description === 'string' && m.description.length > 0 && (
                  <Text style={[s.infoBoxText, { color: '#475569', marginTop: 2 }]}>{m.description.slice(0, 200)}</Text>
                )}
                {typeof m.property_address === 'string' && m.property_address.length > 0 && (
                  <Text style={[s.infoBoxText, { color: '#94a3b8', marginTop: 2 }]}>Property: {m.property_address}</Text>
                )}
              </View>
            ))}
            <Text style={[s.infoBoxText, { color: '#94a3b8', marginTop: 4 }]}>
              Matched by email, phone, and/or name. Unverified — use alongside other information.
            </Text>
          </View>
        )}

        {/* ── Public Court Records ── */}
        {!!courtRecords && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, courtRecords.found ? s.sectionTitleRed : s.sectionTitleGreen]}>
              Public Court Records
            </Text>
            <View style={[s.infoBox, { backgroundColor: courtRecords.found ? '#fef2f2' : '#f0fdf4' }]}>
              <Text style={[s.infoBoxText, { fontFamily: 'Helvetica-Bold', color: courtRecords.found ? '#dc2626' : '#16a34a' }]}>
                {courtRecords.found ? 'Records found' : 'No public court records found'}
              </Text>
              <Text style={[s.infoBoxText, { color: '#475569', marginTop: 3 }]}>{str(courtRecords.summary)}</Text>
              {typeof courtRecords.details === 'string' && courtRecords.details.length > 0 && (
                <Text style={[s.infoBoxText, { color: '#64748b', marginTop: 3 }]}>{courtRecords.details}</Text>
              )}
            </View>
            <Text style={[s.infoBoxText, { color: '#94a3b8', marginTop: 2 }]}>
              Source: CanLII and Openroom. Results may be incomplete. Tenant consented to this search.
            </Text>
          </View>
        )}

        {/* ── Public Online Presence ── */}
        {!!socialAnalysis && !!a.social_media_consent && (
          <View style={s.section}>
            <Text style={[s.sectionTitle, s.sectionTitleGray]}>Public Online Presence</Text>
            <View style={[s.infoBox, { backgroundColor: '#f8fafc' }]}>
              <Text style={[s.infoBoxText, { fontFamily: 'Helvetica-Bold', color: '#475569', marginBottom: 3 }]}>
                Assessment: {saAssessment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Text>
              <Text style={[s.infoBoxText, { color: '#475569' }]}>{saSummary}</Text>
            </View>
            {saRedFlags.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Text style={[s.infoBoxText, { fontFamily: 'Helvetica-Bold', color: '#dc2626', marginBottom: 3 }]}>Signals of concern:</Text>
                {saRedFlags.map((f, i) => (
                  <View key={i} style={s.listItem}>
                    <Text style={[s.bullet, { color: '#dc2626' }]}>•</Text>
                    <Text style={s.listText}>{f}</Text>
                  </View>
                ))}
              </View>
            )}
            {saPositiveSignals.length > 0 && (
              <View style={{ marginTop: 4 }}>
                <Text style={[s.infoBoxText, { fontFamily: 'Helvetica-Bold', color: '#16a34a', marginBottom: 3 }]}>Positive signals:</Text>
                {saPositiveSignals.map((sig, i) => (
                  <View key={i} style={s.listItem}>
                    <Text style={[s.bullet, { color: '#16a34a' }]}>•</Text>
                    <Text style={s.listText}>{sig}</Text>
                  </View>
                ))}
              </View>
            )}
            <Text style={[s.infoBoxText, { color: '#94a3b8', marginTop: 4 }]}>
              Tenant consented to public presence search. Results may not be attributable to this specific person.
            </Text>
          </View>
        )}

        {/* ── Interview Questions ── */}
        {interviewQs.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Suggested Interview Questions</Text>
            {interviewQs.map((q, i) => (
              <View key={i} style={s.listItem}>
                <Text style={[s.bullet, { color: '#1d4ed8', fontFamily: 'Helvetica-Bold' }]}>{i + 1}.</Text>
                <Text style={s.listText}>{q}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>TenantIQ Screening Report — Confidential</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>

      </Page>
    </Document>
  )
}
