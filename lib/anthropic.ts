import Anthropic from '@anthropic-ai/sdk'

// Create the client per-call so a missing key throws with a clear message
// inside the function that uses it, not at module load time (which would
// silently crash the entire route with no log entry).
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing env var: ANTHROPIC_API_KEY — set it in Vercel → Project → Settings → Environment Variables'
    )
  }
  return new Anthropic({ apiKey })
}

export interface IncomeExtractionResult {
  monthly_income: number | null
  document_type: 'pay_stub' | 'bank_statement' | 'offer_letter' | 'other'
  confidence: 'high' | 'medium' | 'low'
  notes: string
}

export interface ScreeningResult {
  score: number
  score_breakdown: {
    income_ratio: { score: number; max: number; explanation: string }
    employment_stability: { score: number; max: number; explanation: string }
    rental_history: { score: number; max: number; explanation: string }
    application_completeness: { score: number; max: number; explanation: string }
    references_quality: { score: number; max: number; explanation: string }
    income_verification: { score: number; max: number; explanation: string }
  }
  red_flags: string[]
  positive_factors: string[]
  interview_questions: string[]
  recommendation: 'approve' | 'review' | 'decline'
  recommendation_reason: string
  summary: string
}

export async function extractIncomeFromDocument(
  documentBase64: string,
  mediaType: string
): Promise<IncomeExtractionResult> {
  const anthropic = getClient()

  const isImage = mediaType.startsWith('image/')
  const isPDF = mediaType === 'application/pdf'

  if (!isImage && !isPDF) {
    throw new Error(`Unsupported media type for income extraction: ${mediaType}`)
  }

  const docBlock: Anthropic.ContentBlockParam = isPDF
    ? ({
        type: 'document',
        source: {
          type: 'base64',
          media_type: 'application/pdf',
          data: documentBase64,
        },
      } as unknown as Anthropic.ContentBlockParam)
    : {
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType as 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
          data: documentBase64,
        },
      }

  const textBlock: Anthropic.ContentBlockParam = {
    type: 'text',
    text: `Analyze this income document and extract the income information.

Return a JSON object with exactly these fields:
{
  "monthly_income": <number in dollars, convert annual/weekly to monthly, or null if cannot determine>,
  "document_type": <"pay_stub" | "bank_statement" | "offer_letter" | "other">,
  "confidence": <"high" | "medium" | "low">,
  "notes": <brief explanation of what you found and any caveats>
}

Rules:
- Annual salary → divide by 12
- Weekly pay → multiply by 52/12
- Be conservative if unclear
- Return null for monthly_income if the document doesn't clearly show income
- Respond with ONLY the JSON object, no other text`,
  }

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 1024,
    system: `You are a financial document analyst helping a tenant screening platform verify income.
Extract income information from the provided document accurately and conservatively.
Always convert to monthly income. Be precise.
Respond ONLY with valid JSON matching the specified schema.`,
    messages: [
      {
        role: 'user',
        content: [docBlock, textBlock] as Anthropic.ContentBlockParam[],
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Income extraction: no JSON in response. Raw text: ${text.slice(0, 200)}`)
  }

  return JSON.parse(jsonMatch[0]) as IncomeExtractionResult
}

export async function screenApplicant(params: {
  monthly_rent: number
  full_name: string
  monthly_income_reported: number
  income_verified: number | null
  income_verification_status: string
  employer_name: string
  time_at_job: string
  reason_for_moving: string
  has_evictions: boolean
  eviction_explanation: string | null
  has_late_payments: boolean
  late_payment_explanation: string | null
  reference_1_name: string | null
  reference_1_relationship: string | null
  reference_1_phone: string | null
  reference_2_name: string | null
  reference_2_relationship: string | null
  reference_2_phone: string | null
}): Promise<ScreeningResult> {
  const anthropic = getClient()

  const effectiveIncome = params.income_verified ?? params.monthly_income_reported
  const incomeRatio = (effectiveIncome / params.monthly_rent).toFixed(2)

  const ref1 = params.reference_1_name
    ? `${params.reference_1_name} (${params.reference_1_relationship || 'Unknown'}) — ${params.reference_1_phone || 'No phone'}`
    : 'Not provided'
  const ref2 = params.reference_2_name
    ? `${params.reference_2_name} (${params.reference_2_relationship || 'Unknown'}) — ${params.reference_2_phone || 'No phone'}`
    : 'Not provided'

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    system: `You are an expert tenant screening AI for a platform serving Canadian and US landlords.
You provide fair, objective, data-driven screening assessments.
You are thorough, professional, and balanced — you note both positives and concerns.
Respond ONLY with valid JSON matching the specified schema.`,
    messages: [
      {
        role: 'user',
        content: `Screen this rental applicant and provide a comprehensive report.

=== PROPERTY ===
Monthly Rent: $${params.monthly_rent}

=== APPLICANT ===
Name: ${params.full_name}
Self-Reported Monthly Income: $${params.monthly_income_reported}
Verified Monthly Income: ${params.income_verified ? `$${params.income_verified}` : 'Not verified'}
Income Verification Status: ${params.income_verification_status}
Effective Income Used for Scoring: $${effectiveIncome} (ratio: ${incomeRatio}x rent)
Employer: ${params.employer_name}
Time at Current Job: ${params.time_at_job}
Reason for Moving: ${params.reason_for_moving}

=== RENTAL HISTORY ===
Evictions: ${params.has_evictions ? `YES — ${params.eviction_explanation || 'No explanation provided'}` : 'None reported'}
Late Payments: ${params.has_late_payments ? `YES — ${params.late_payment_explanation || 'No explanation provided'}` : 'None reported'}

=== REFERENCES ===
Reference 1: ${ref1}
Reference 2: ${ref2}

=== SCORING CRITERIA (100 points total) ===
1. Income to Rent Ratio (25 pts): Use verified income if available
   - 3.0x+: 25pts | 2.5-3.0x: 20pts | 2.0-2.5x: 15pts | 1.5-2.0x: 8pts | <1.5x: 0pts
2. Employment Stability (20 pts)
   - 3+ years: 20pts | 1-3 years: 15pts | 6mo-1yr: 10pts | 3-6mo: 5pts | <3mo: 0pts
3. Rental History (20 pts)
   - No issues: 20pts | Late payments w/ explanation: 10pts | Eviction: 0pts
4. Application Completeness (15 pts)
   - All fields complete: 15pts | Minor gaps: 10pts | Major gaps: 5pts
5. References Quality (10 pts)
   - 2 complete references: 10pts | 1 complete: 5pts | None: 0pts
6. Income Verification (10 pts)
   - Verified (match): 10pts | No document: 5pts | Discrepancy detected: 0pts

Deduct up to 10 points for significant red flags.

Return a JSON object with EXACTLY these fields:
{
  "score": <integer 0-100>,
  "score_breakdown": {
    "income_ratio": {"score": <int>, "max": 25, "explanation": "<string>"},
    "employment_stability": {"score": <int>, "max": 20, "explanation": "<string>"},
    "rental_history": {"score": <int>, "max": 20, "explanation": "<string>"},
    "application_completeness": {"score": <int>, "max": 15, "explanation": "<string>"},
    "references_quality": {"score": <int>, "max": 10, "explanation": "<string>"},
    "income_verification": {"score": <int>, "max": 10, "explanation": "<string>"}
  },
  "red_flags": [<string>, ...],
  "positive_factors": [<string>, ...],
  "interview_questions": [<string>, <string>, <string>, <string>, <string>],
  "recommendation": <"approve" | "review" | "decline">,
  "recommendation_reason": "<1-2 sentence reason>",
  "summary": "<2-3 sentence overall summary of the applicant>"
}

Respond with ONLY the JSON object.`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error(`Screening: no JSON in response. Raw text: ${text.slice(0, 200)}`)
  }

  return JSON.parse(jsonMatch[0]) as ScreeningResult
}
