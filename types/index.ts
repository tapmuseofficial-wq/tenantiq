export type SubscriptionStatus = 'free' | 'basic'
export type VerificationStatus = 'verified' | 'unverified' | 'discrepancy' | 'no_document'
export type Recommendation = 'approve' | 'review' | 'decline'
export type ApplicationStatus = 'pending' | 'analyzing' | 'complete' | 'error'
export type CertnStatus = 'pending' | 'complete' | 'failed'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  company_name: string | null
  subscription_status: SubscriptionStatus
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  screenings_used: number
  screening_credits: number
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  landlord_id: string
  name: string
  address: string | null
  unit: string | null
  city: string | null
  province_state: string | null
  country: string
  monthly_rent: number
  bedrooms: number | null
  bathrooms: number | null
  screening_token: string
  is_active: boolean
  created_at: string
}

export interface ScoreBreakdownItem {
  score: number
  max: number
  explanation: string
}

export interface ScoreBreakdown {
  income_ratio: ScoreBreakdownItem
  employment_stability: ScoreBreakdownItem
  rental_history: ScoreBreakdownItem
  application_completeness: ScoreBreakdownItem
  references_quality: ScoreBreakdownItem
  income_verification: ScoreBreakdownItem
}

export interface Application {
  id: string
  property_id: string
  full_name: string
  email: string
  phone: string
  monthly_income_reported: number
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
  income_document_path: string | null
  income_document_name: string | null
  income_verified: number | null
  income_document_type: string | null
  income_extraction_confidence: string | null
  income_verification_status: VerificationStatus | null
  income_verification_notes: string | null
  score: number | null
  score_breakdown: ScoreBreakdown | null
  red_flags: string[] | null
  positive_factors: string[] | null
  interview_questions: string[] | null
  recommendation: Recommendation | null
  recommendation_reason: string | null
  ai_summary: string | null
  status: ApplicationStatus
  error_message: string | null
  created_at: string
  analyzed_at: string | null
  certn_case_id: string | null
  certn_status: CertnStatus | null
  certn_report: import('@/lib/certn').CertnReport | null
  background_check_requested_at: string | null
}

export interface ApplicationSummary {
  id: string
  property_id: string
  full_name: string
  email: string
  phone: string
  monthly_income_reported: number
  income_verified: number | null
  income_verification_status: VerificationStatus | null
  score: number | null
  recommendation: Recommendation | null
  status: ApplicationStatus
  has_evictions: boolean
  has_late_payments: boolean
  created_at: string
  property_name: string
  monthly_rent: number
  landlord_id: string
  income_ratio: number | null
}

export interface ApplicationFormData {
  full_name: string
  email: string
  phone: string
  monthly_income_reported: number
  employer_name: string
  time_at_job: string
  reason_for_moving: string
  has_evictions: boolean
  eviction_explanation?: string
  has_late_payments: boolean
  late_payment_explanation?: string
  reference_1_name: string
  reference_1_relationship: string
  reference_1_phone: string
  reference_2_name: string
  reference_2_relationship: string
  reference_2_phone: string
  income_document?: File
}
