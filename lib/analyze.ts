import { createServiceClient } from '@/lib/supabase/server'
import { extractIncomeFromDocument, screenApplicant, analyzePublicPresence } from '@/lib/anthropic'
import {
  lookupCommunityHistory,
  adjustScoreForCommunity,
  type CommunityHistory,
} from '@/lib/community-history'
import { searchDuckDuckGo } from '@/lib/social-fetch'

export async function runAnalysis(application_id: string): Promise<void> {
  console.log(`[analyze] starting — application_id=${application_id}`)

  const supabase = createServiceClient()

  const { data: app, error: fetchError } = await supabase
    .from('applications')
    .select(`*, properties (monthly_rent, name, landlord_id, city)`)
    .eq('id', application_id)
    .single()

  if (fetchError || !app) {
    console.error(`[analyze] application not found — id=${application_id}`, fetchError?.message)
    return
  }

  console.log(`[analyze] fetched application — name="${app.full_name}" has_document=${!!app.income_document_path}`)

  await supabase
    .from('applications')
    .update({ status: 'analyzing' })
    .eq('id', application_id)

  const property = app.properties as { monthly_rent: number; name: string; landlord_id: string; city: string | null }

  let income_verified: number | null = null
  let income_document_type: string | null = null
  let income_extraction_confidence: string | null = null
  let income_verification_status = app.income_document_path ? 'unverified' : 'no_document'
  let income_verification_notes: string | null = null

  // Step 1: Extract income from document — only if one was uploaded
  if (app.income_document_path) {
    console.log(`[analyze] downloading document — path=${app.income_document_path}`)
    try {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('income-documents')
        .download(app.income_document_path)

      if (downloadError || !fileData) {
        console.error(`[analyze] document download failed — path=${app.income_document_path}`, downloadError?.message)
      } else {
        const arrayBuffer = await fileData.arrayBuffer()
        const base64 = Buffer.from(arrayBuffer).toString('base64')
        const mediaType = fileData.type || 'application/octet-stream'

        console.log(`[analyze] extracting income from document — mediaType=${mediaType} size=${arrayBuffer.byteLength}`)

        const extraction = await extractIncomeFromDocument(base64, mediaType)

        console.log(`[analyze] income extraction complete — monthly_income=${extraction.monthly_income} confidence=${extraction.confidence}`)

        income_verified = extraction.monthly_income
        income_document_type = extraction.document_type
        income_extraction_confidence = extraction.confidence
        income_verification_notes = extraction.notes

        if (extraction.monthly_income !== null) {
          const diff = Math.abs(app.monthly_income_reported - extraction.monthly_income) / Math.max(app.monthly_income_reported, 1)
          income_verification_status = diff <= 0.15 ? 'verified' : 'discrepancy'
          console.log(`[analyze] income verification — reported=${app.monthly_income_reported} extracted=${extraction.monthly_income} diff=${(diff * 100).toFixed(1)}% status=${income_verification_status}`)
        }
      }
    } catch (err) {
      console.error(`[analyze] income extraction threw — application_id=${application_id}`, err instanceof Error ? err.message : err)
      income_verification_notes = 'Document could not be processed'
    }
  }

  // Step 2: Community history lookup — runs before AI screening so history
  // can be included in the prompt context and stored with the application.
  let communityHistory: CommunityHistory | null = null
  try {
    console.log(`[analyze] looking up community history — email=${app.email}`)
    communityHistory = await lookupCommunityHistory({
      email:     app.email,
      phone:     app.phone,
      full_name: app.full_name,
    })
    console.log(`[analyze] community history — positive=${communityHistory.positive_count} negative=${communityHistory.negative_count} matches=${communityHistory.matches.length}`)

    // Persist the snapshot so the applicant detail page can show it without
    // re-querying the tenant_ratings table (which the landlord can't see).
    await supabase
      .from('applications')
      .update({ community_history: communityHistory })
      .eq('id', application_id)
  } catch (err) {
    console.error(`[analyze] community history lookup failed — application_id=${application_id}`, err instanceof Error ? err.message : err)
    // Non-fatal: continue without community history
  }

  // Build a plain-text summary of community history for the Claude prompt.
  function buildCommunityContext(history: CommunityHistory | null): string | undefined {
    if (!history || history.matches.length === 0) return undefined

    const lines: string[] = []
    const fmt = (d: string) => new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short' })

    for (const m of history.matches) {
      const icon   = m.rating === 'positive' ? '👍 POSITIVE' : '👎 NEGATIVE'
      const date   = fmt(m.created_at)
      const desc   = m.description ? ` — "${m.description.slice(0, 300)}"` : ''
      const addr   = m.property_address ? ` (property: ${m.property_address})` : ''
      const flag   = m.is_disputed ? ' [DISPUTED]' : ''
      lines.push(`${icon}${flag} on ${date}${addr}${desc}`)
    }

    return lines.join('\n')
  }

  // Step 3: Public presence search — runs only when tenant gave consent
  if (app.social_media_consent) {
    try {
      const city         = (property.city ?? '').trim()
      const searchQuery  = city ? `${app.full_name} ${city}` : app.full_name
      console.log(`[analyze] searching public presence — query="${searchQuery}"`)

      const searchText = await searchDuckDuckGo(searchQuery)

      if (searchText) {
        const analysis = await analyzePublicPresence({ full_name: app.full_name, searchQuery, searchText })

        await supabase
          .from('applications')
          .update({ social_media_analysis: analysis })
          .eq('id', application_id)

        console.log(`[analyze] public presence analysis done — assessment=${analysis.assessment}`)
      } else {
        console.log(`[analyze] public presence search returned no usable content — skipping`)
      }
    } catch (err) {
      console.error(`[analyze] public presence analysis failed — application_id=${application_id}`, err instanceof Error ? err.message : err)
      // Non-fatal — continue with the rest of the analysis
    }
  }

  // Step 4: AI screening
  console.log(`[analyze] starting screening — application_id=${application_id}`)
  try {
    const screening = await screenApplicant({
      monthly_rent:             property.monthly_rent,
      full_name:                app.full_name,
      monthly_income_reported:  app.monthly_income_reported,
      income_verified,
      income_verification_status,
      employer_name:            app.employer_name,
      time_at_job:              app.time_at_job,
      reason_for_moving:        app.reason_for_moving,
      has_evictions:            app.has_evictions,
      eviction_explanation:     app.eviction_explanation,
      has_late_payments:        app.has_late_payments,
      late_payment_explanation: app.late_payment_explanation,
      reference_1_name:         app.reference_1_name,
      reference_1_relationship: app.reference_1_relationship,
      reference_1_phone:        app.reference_1_phone,
      reference_2_name:         app.reference_2_name,
      reference_2_relationship: app.reference_2_relationship,
      reference_2_phone:        app.reference_2_phone,
      community_context:        buildCommunityContext(communityHistory),
    })

    // Apply deterministic community score adjustment on top of the AI score.
    const adjustedScore = communityHistory
      ? adjustScoreForCommunity(screening.score, communityHistory)
      : screening.score

    if (adjustedScore !== screening.score) {
      console.log(`[analyze] community score adjustment — base=${screening.score} adjusted=${adjustedScore}`)
    }

    console.log(`[analyze] screening complete — score=${adjustedScore} recommendation=${screening.recommendation}`)

    const { error: updateError } = await supabase
      .from('applications')
      .update({
        income_verified,
        income_document_type,
        income_extraction_confidence,
        income_verification_status,
        income_verification_notes,
        score:                   adjustedScore,
        score_breakdown:         screening.score_breakdown,
        red_flags:               screening.red_flags,
        positive_factors:        screening.positive_factors,
        interview_questions:     screening.interview_questions,
        recommendation:          screening.recommendation,
        recommendation_reason:   screening.recommendation_reason,
        ai_summary:              screening.summary,
        status:                  'complete',
        analyzed_at:             new Date().toISOString(),
      })
      .eq('id', application_id)

    if (updateError) {
      console.error(`[analyze] failed to save screening results — application_id=${application_id}`, updateError.message)
    } else {
      console.log(`[analyze] done — application_id=${application_id}`)
    }
  } catch (err) {
    console.error(`[analyze] screenApplicant threw — application_id=${application_id}`, err instanceof Error ? err.message : err)
    const { error: statusError } = await supabase
      .from('applications')
      .update({ status: 'error', error_message: 'Analysis could not be completed. Please contact support if this persists.' })
      .eq('id', application_id)
    if (statusError) {
      console.error(`[analyze] also failed to set error status — application_id=${application_id}`, statusError.message)
    }
  }
}
