import { createServiceClient } from '@/lib/supabase/server'
import { extractIncomeFromDocument, screenApplicant } from '@/lib/anthropic'

export async function runAnalysis(application_id: string): Promise<void> {
  const supabase = createServiceClient()

  const { data: app, error: fetchError } = await supabase
    .from('applications')
    .select(`*, properties (monthly_rent, name, landlord_id)`)
    .eq('id', application_id)
    .single()

  if (fetchError || !app) {
    console.error('Analysis: application not found', application_id)
    return
  }

  await supabase
    .from('applications')
    .update({ status: 'analyzing' })
    .eq('id', application_id)

  const property = app.properties as { monthly_rent: number; name: string; landlord_id: string }

  let income_verified: number | null = null
  let income_document_type: string | null = null
  let income_extraction_confidence: string | null = null
  let income_verification_status = app.income_document_path ? 'unverified' : 'no_document'
  let income_verification_notes: string | null = null

  // Step 1: Extract income from document — only if one was uploaded
  if (app.income_document_path) {
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('income-documents')
        .download(app.income_document_path)

      if (!downloadError && fileData) {
        const arrayBuffer = await fileData.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const mediaType = fileData.type || 'application/octet-stream'

        const extraction = await extractIncomeFromDocument(base64, mediaType)

        income_verified = extraction.monthly_income
        income_document_type = extraction.document_type
        income_extraction_confidence = extraction.confidence
        income_verification_notes = extraction.notes

        if (extraction.monthly_income !== null) {
          const diff = Math.abs(app.monthly_income_reported - extraction.monthly_income) / Math.max(app.monthly_income_reported, 1)
          income_verification_status = diff <= 0.15 ? 'verified' : 'discrepancy'
        }
      }
    } catch (err) {
      console.error('Income extraction error:', err)
      income_verification_notes = 'Document could not be processed'
    }
  }

  // Step 2: AI screening — always runs regardless of document
  try {
    const screening = await screenApplicant({
      monthly_rent: property.monthly_rent,
      full_name: app.full_name,
      monthly_income_reported: app.monthly_income_reported,
      income_verified,
      income_verification_status,
      employer_name: app.employer_name,
      time_at_job: app.time_at_job,
      reason_for_moving: app.reason_for_moving,
      has_evictions: app.has_evictions,
      eviction_explanation: app.eviction_explanation,
      has_late_payments: app.has_late_payments,
      late_payment_explanation: app.late_payment_explanation,
      reference_1_name: app.reference_1_name,
      reference_1_relationship: app.reference_1_relationship,
      reference_1_phone: app.reference_1_phone,
      reference_2_name: app.reference_2_name,
      reference_2_relationship: app.reference_2_relationship,
      reference_2_phone: app.reference_2_phone,
    })

    await supabase
      .from('applications')
      .update({
        income_verified,
        income_document_type,
        income_extraction_confidence,
        income_verification_status,
        income_verification_notes,
        score: screening.score,
        score_breakdown: screening.score_breakdown,
        red_flags: screening.red_flags,
        positive_factors: screening.positive_factors,
        interview_questions: screening.interview_questions,
        recommendation: screening.recommendation,
        recommendation_reason: screening.recommendation_reason,
        ai_summary: screening.summary,
        status: 'complete',
        analyzed_at: new Date().toISOString(),
      })
      .eq('id', application_id)
  } catch (err) {
    console.error('Screening error:', err)
    await supabase
      .from('applications')
      .update({ status: 'error', error_message: String(err) })
      .eq('id', application_id)
  }
}
