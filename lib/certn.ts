const CERTN_BASE_URL = process.env.CERTN_BASE_URL ?? 'https://api.sandbox.certn.co'
const CERTN_API_KEY  = process.env.CERTN_API_KEY

function headers() {
  if (!CERTN_API_KEY) throw new Error('Missing env var: CERTN_API_KEY')
  return {
    'Authorization': `Token ${CERTN_API_KEY}`,
    'Content-Type': 'application/json',
  }
}

export interface CertnApplicant {
  first_name: string
  last_name: string
  email: string
  phone?: string
}

export interface CertnCase {
  id: string
  status: string           // 'INVITED' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED'
  report?: CertnReport
  applicant?: {
    email: string
    first_name: string
    last_name: string
  }
  created_at?: string
}

export interface CertnReport {
  credit_score?: number | null
  eviction_history?: 'clear' | 'flagged' | null
  criminal_record?: 'clear' | 'flagged' | null
  identity_verification?: 'verified' | 'pending' | 'failed' | null
  overall_recommendation?: string | null
  raw?: Record<string, unknown>
}

export async function createCertnCase(applicant: CertnApplicant): Promise<CertnCase> {
  const [firstName, ...rest] = applicant.first_name
    ? [applicant.first_name, applicant.last_name]
    : applicant.email.split('@')[0].split('.')

  const res = await fetch(`${CERTN_BASE_URL}/api/v1/cases/`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      applicants: [{
        email:      applicant.email,
        first_name: applicant.first_name || firstName,
        last_name:  applicant.last_name  || (rest.join(' ') || ''),
        phone:      applicant.phone,
      }],
      request_softcheck:    true,  // credit check
      request_criminal:     true,  // criminal record
      request_eviction:     true,  // eviction history
      request_identity:     true,  // identity verification
      send_email_invitation: true, // Certn emails the tenant
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Certn createCase failed (${res.status}): ${body}`)
  }

  return res.json() as Promise<CertnCase>
}

export async function getCertnCase(caseId: string): Promise<CertnCase> {
  const res = await fetch(`${CERTN_BASE_URL}/api/v1/cases/${caseId}/`, {
    headers: headers(),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Certn getCase failed (${res.status}): ${body}`)
  }

  return res.json() as Promise<CertnCase>
}

export function parseCertnReport(raw: Record<string, unknown>): CertnReport {
  const report = raw.report as Record<string, unknown> | undefined ?? raw

  return {
    credit_score:           extractCreditScore(report),
    eviction_history:       extractEvictionHistory(report),
    criminal_record:        extractCriminalRecord(report),
    identity_verification:  extractIdentityStatus(report),
    overall_recommendation: extractRecommendation(report),
    raw,
  }
}

function extractCreditScore(r: Record<string, unknown>): number | null {
  const score =
    (r.softcheck as Record<string, unknown> | undefined)?.credit_score ??
    (r.credit    as Record<string, unknown> | undefined)?.score ??
    r.credit_score
  return typeof score === 'number' ? score : null
}

function extractEvictionHistory(r: Record<string, unknown>): 'clear' | 'flagged' | null {
  const ev = r.eviction as Record<string, unknown> | undefined ?? r
  if (ev.status === 'CLEAR' || ev.eviction_found === false) return 'clear'
  if (ev.status === 'FLAGGED' || ev.eviction_found === true)  return 'flagged'
  return null
}

function extractCriminalRecord(r: Record<string, unknown>): 'clear' | 'flagged' | null {
  const cr = r.criminal as Record<string, unknown> | undefined ?? r
  if (cr.status === 'CLEAR' || cr.criminal_found === false) return 'clear'
  if (cr.status === 'FLAGGED' || cr.criminal_found === true) return 'flagged'
  return null
}

function extractIdentityStatus(r: Record<string, unknown>): 'verified' | 'pending' | 'failed' | null {
  const id = r.identity as Record<string, unknown> | undefined ?? r
  const s  = String(id.status ?? id.identity_status ?? '').toUpperCase()
  if (s === 'VERIFIED' || s === 'PASSED') return 'verified'
  if (s === 'FAILED'   || s === 'REJECTED') return 'failed'
  if (s === 'PENDING'  || s === 'IN_PROGRESS') return 'pending'
  return null
}

function extractRecommendation(r: Record<string, unknown>): string | null {
  const rec =
    r.overall_recommendation ??
    r.recommendation ??
    (r.result as Record<string, unknown> | undefined)?.recommendation
  return typeof rec === 'string' ? rec : null
}
