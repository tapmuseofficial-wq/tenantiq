import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'
import { Application } from '@/types'

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    padding: 48,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#1d4ed8',
  },
  logo: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerValue: {
    fontSize: 10,
    color: '#1e293b',
    fontFamily: 'Helvetica-Bold',
  },
  scoreSection: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  scoreBox: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
  },
  scoreNumber: {
    fontSize: 36,
    fontFamily: 'Helvetica-Bold',
  },
  scoreLabel: {
    fontSize: 8,
    color: '#64748b',
    marginTop: 2,
  },
  recommendationBox: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
  },
  recommendationLabel: {
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  recommendationValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  },
  recommendationReason: {
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1d4ed8',
    marginBottom: 10,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  field: {
    width: '48%',
    marginBottom: 8,
  },
  fieldFull: {
    width: '100%',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 8,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    color: '#1e293b',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
  },
  scoreRowLabel: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
  },
  scoreRowBar: {
    width: 80,
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginRight: 8,
  },
  scoreRowFill: {
    height: 6,
    borderRadius: 3,
  },
  scoreRowValue: {
    width: 36,
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 12,
    fontSize: 9,
    color: '#64748b',
  },
  listText: {
    flex: 1,
    fontSize: 9,
    color: '#475569',
    lineHeight: 1.5,
  },
  verificationBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  verificationText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerText: {
    fontSize: 8,
    color: '#94a3b8',
  },
})

function getRecommendationColors(rec: string | null) {
  if (rec === 'approve') return { bg: '#f0fdf4', text: '#16a34a', label: 'APPROVE' }
  if (rec === 'review') return { bg: '#fefce8', text: '#ca8a04', label: 'REVIEW FURTHER' }
  return { bg: '#fef2f2', text: '#dc2626', label: 'DECLINE' }
}

function getScoreColor(score: number | null) {
  if (!score) return '#94a3b8'
  if (score >= 75) return '#16a34a'
  if (score >= 55) return '#ca8a04'
  return '#dc2626'
}

function getVerificationColors(status: string | null) {
  if (status === 'verified') return { bg: '#f0fdf4', text: '#16a34a', label: 'VERIFIED' }
  if (status === 'discrepancy') return { bg: '#fef2f2', text: '#dc2626', label: 'DISCREPANCY DETECTED' }
  if (status === 'unverified') return { bg: '#f8fafc', text: '#64748b', label: 'UNVERIFIED' }
  return { bg: '#f8fafc', text: '#94a3b8', label: 'NO DOCUMENT' }
}

interface ReportProps {
  application: Application
  property: { name: string; address: string | null; monthly_rent: number }
}

export function ReportDocument({ application: a, property }: ReportProps) {
  const recColors = getRecommendationColors(a.recommendation)
  const verColors = getVerificationColors(a.income_verification_status)
  const scoreColor = getScoreColor(a.score)
  const breakdown = a.score_breakdown

  const effectiveIncome = a.income_verified ?? a.monthly_income_reported
  const ratio = property.monthly_rent > 0 ? (effectiveIncome / property.monthly_rent).toFixed(1) : '—'

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>TenantIQ</Text>
            <Text style={[styles.headerLabel, { marginTop: 4 }]}>Tenant Screening Report</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerLabel}>Property</Text>
            <Text style={styles.headerValue}>{property.name}</Text>
            <Text style={[styles.headerLabel, { marginTop: 8 }]}>Report Date</Text>
            <Text style={styles.headerValue}>{new Date().toLocaleDateString('en-CA')}</Text>
            <Text style={[styles.headerLabel, { marginTop: 8 }]}>Monthly Rent</Text>
            <Text style={styles.headerValue}>${property.monthly_rent.toLocaleString()}/mo</Text>
          </View>
        </View>

        {/* Score + Recommendation */}
        <View style={styles.scoreSection}>
          <View style={[styles.scoreBox, { backgroundColor: `${scoreColor}18`, borderWidth: 2, borderColor: scoreColor }]}>
            <Text style={[styles.scoreNumber, { color: scoreColor }]}>{a.score ?? '—'}</Text>
            <Text style={styles.scoreLabel}>out of 100</Text>
          </View>
          <View style={[styles.recommendationBox, { backgroundColor: recColors.bg }]}>
            <Text style={[styles.recommendationLabel, { color: recColors.text }]}>Recommendation</Text>
            <Text style={[styles.recommendationValue, { color: recColors.text }]}>{recColors.label}</Text>
            <Text style={styles.recommendationReason}>{a.recommendation_reason || 'Analysis pending'}</Text>
          </View>
        </View>

        {/* AI Summary */}
        {a.ai_summary && (
          <View style={[styles.section, { backgroundColor: '#f8fafc', borderRadius: 8, padding: 12, marginBottom: 20 }]}>
            <Text style={[styles.sectionTitle, { borderBottomWidth: 0, marginBottom: 4 }]}>Summary</Text>
            <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.6 }}>{a.ai_summary}</Text>
          </View>
        )}

        {/* Applicant Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Applicant Information</Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <Text style={styles.fieldValue}>{a.full_name}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <Text style={styles.fieldValue}>{a.email}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone</Text>
              <Text style={styles.fieldValue}>{a.phone}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Applied</Text>
              <Text style={styles.fieldValue}>{new Date(a.created_at).toLocaleDateString('en-CA')}</Text>
            </View>
          </View>
        </View>

        {/* Income & Employment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Income & Employment</Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Self-Reported Income</Text>
              <Text style={styles.fieldValue}>${a.monthly_income_reported.toLocaleString()}/mo</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Verified Income</Text>
              <Text style={styles.fieldValue}>
                {a.income_verified ? `$${a.income_verified.toLocaleString()}/mo` : 'Not verified'}
              </Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Income-to-Rent Ratio</Text>
              <Text style={styles.fieldValue}>{ratio}x</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Income Verification</Text>
              <View style={[styles.verificationBadge, { backgroundColor: verColors.bg }]}>
                <Text style={[styles.verificationText, { color: verColors.text }]}>{verColors.label}</Text>
              </View>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Employer</Text>
              <Text style={styles.fieldValue}>{a.employer_name}</Text>
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Time at Job</Text>
              <Text style={styles.fieldValue}>{a.time_at_job}</Text>
            </View>
            <View style={styles.fieldFull}>
              <Text style={styles.fieldLabel}>Reason for Moving</Text>
              <Text style={styles.fieldValue}>{a.reason_for_moving}</Text>
            </View>
          </View>
        </View>

        {/* Score Breakdown */}
        {breakdown && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Score Breakdown</Text>
            {Object.entries(breakdown).map(([key, item]) => {
              const pct = item.max > 0 ? item.score / item.max : 0
              const fillColor = pct >= 0.75 ? '#16a34a' : pct >= 0.5 ? '#ca8a04' : '#dc2626'
              const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              return (
                <View key={key} style={styles.scoreRow}>
                  <Text style={styles.scoreRowLabel}>{label}</Text>
                  <View style={styles.scoreRowBar}>
                    <View style={[styles.scoreRowFill, { width: `${pct * 100}%`, backgroundColor: fillColor }]} />
                  </View>
                  <Text style={[styles.scoreRowValue, { color: fillColor }]}>
                    {item.score}/{item.max}
                  </Text>
                </View>
              )
            })}
          </View>
        )}

        {/* Red Flags & Positives */}
        {(a.red_flags?.length || a.positive_factors?.length) && (
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 20 }}>
            {a.red_flags && a.red_flags.length > 0 && (
              <View style={[styles.section, { flex: 1, marginBottom: 0 }]}>
                <Text style={[styles.sectionTitle, { color: '#dc2626' }]}>Red Flags</Text>
                {a.red_flags.map((flag, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={[styles.bullet, { color: '#dc2626' }]}>•</Text>
                    <Text style={styles.listText}>{flag}</Text>
                  </View>
                ))}
              </View>
            )}
            {a.positive_factors && a.positive_factors.length > 0 && (
              <View style={[styles.section, { flex: 1, marginBottom: 0 }]}>
                <Text style={[styles.sectionTitle, { color: '#16a34a' }]}>Positive Factors</Text>
                {a.positive_factors.map((factor, i) => (
                  <View key={i} style={styles.listItem}>
                    <Text style={[styles.bullet, { color: '#16a34a' }]}>•</Text>
                    <Text style={styles.listText}>{factor}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Rental History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rental History</Text>
          <View style={styles.grid}>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Evictions</Text>
              <Text style={[styles.fieldValue, { color: a.has_evictions ? '#dc2626' : '#16a34a' }]}>
                {a.has_evictions ? 'Yes' : 'None reported'}
              </Text>
              {a.has_evictions && a.eviction_explanation && (
                <Text style={[styles.listText, { marginTop: 2 }]}>{a.eviction_explanation}</Text>
              )}
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Late Payments</Text>
              <Text style={[styles.fieldValue, { color: a.has_late_payments ? '#ca8a04' : '#16a34a' }]}>
                {a.has_late_payments ? 'Yes' : 'None reported'}
              </Text>
              {a.has_late_payments && a.late_payment_explanation && (
                <Text style={[styles.listText, { marginTop: 2 }]}>{a.late_payment_explanation}</Text>
              )}
            </View>
          </View>
        </View>

        {/* References */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>References</Text>
          <View style={styles.grid}>
            {a.reference_1_name && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Reference 1</Text>
                <Text style={styles.fieldValue}>{a.reference_1_name}</Text>
                <Text style={[styles.listText, { marginTop: 2 }]}>
                  {a.reference_1_relationship} · {a.reference_1_phone}
                </Text>
              </View>
            )}
            {a.reference_2_name && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Reference 2</Text>
                <Text style={styles.fieldValue}>{a.reference_2_name}</Text>
                <Text style={[styles.listText, { marginTop: 2 }]}>
                  {a.reference_2_relationship} · {a.reference_2_phone}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Interview Questions */}
        {a.interview_questions && a.interview_questions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested Interview Questions</Text>
            {a.interview_questions.map((q, i) => (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.bullet, { color: '#1d4ed8' }]}>{i + 1}.</Text>
                <Text style={styles.listText}>{q}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>TenantIQ Screening Report — Confidential</Text>
          <Text style={styles.footerText}>Generated {new Date().toLocaleDateString('en-CA')}</Text>
        </View>
      </Page>
    </Document>
  )
}
