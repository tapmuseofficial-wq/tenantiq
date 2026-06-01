'use client'

import { useState, useRef, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import {
  CheckCircle,
  CloudUpload,
  FileText,
  X,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import { Property } from '@/types'

const schema = z.object({
  full_name: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  monthly_income_reported: z.coerce.number().min(1, 'Please enter your monthly income'),
  employer_name: z.string().min(2, 'Please enter your employer name'),
  time_at_job: z.string().min(1, 'Please enter your time at current job'),
  reason_for_moving: z.string().min(10, "Please tell us why you're moving (at least 10 characters)"),
  has_evictions: z.boolean(),
  eviction_explanation: z.string().optional(),
  has_late_payments: z.boolean(),
  late_payment_explanation: z.string().optional(),
  reference_1_name: z.string().min(2, 'Reference name is required'),
  reference_1_relationship: z.string().min(2, 'Relationship is required'),
  reference_1_phone: z.string().min(10, 'Phone number is required'),
  reference_2_name: z.string().optional(),
  reference_2_relationship: z.string().optional(),
  reference_2_phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface ApplicationFormProps {
  property: Property
}

const STEPS = [
  { id: 1, title: 'Personal Info', description: 'Your contact details' },
  { id: 2, title: 'Employment', description: 'Income and job details' },
  { id: 3, title: 'Rental History', description: 'Previous tenancy info' },
  { id: 4, title: 'References', description: 'People who know you' },
  { id: 5, title: 'Income Document', description: 'Proof of income upload' },
]

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ACCEPTED_TYPES: Record<string, string> = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
}

export function ApplicationForm({ property }: ApplicationFormProps) {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [provideLater, setProvideLater] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSubmit = uploadedFile !== null || provideLater

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { has_evictions: false, has_late_payments: false },
  })

  const hasEvictions = watch('has_evictions')
  const hasLatePayments = watch('has_late_payments')

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ['full_name', 'email', 'phone'],
    2: ['monthly_income_reported', 'employer_name', 'time_at_job', 'reason_for_moving'],
    3: ['has_evictions', 'has_late_payments'],
    4: ['reference_1_name', 'reference_1_relationship', 'reference_1_phone'],
    5: [],
  }

  async function handleNext() {
    const valid = await trigger(stepFields[step])
    if (valid) setStep(s => s + 1)
  }

  const handleFileSelect = useCallback((file: File) => {
    setFileError(null)
    if (file.size > MAX_FILE_SIZE) {
      setFileError('File is too large. Maximum size is 10MB.')
      return
    }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    const mimeType = file.type || ACCEPTED_TYPES[ext] || ''
    if (!Object.values(ACCEPTED_TYPES).includes(mimeType)) {
      setFileError('Invalid file type. Please upload a PDF, JPG, or PNG.')
      return
    }
    setUploadedFile(file)
    setProvideLater(false)
  }, [])

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(true)
  }
  function handleDragLeave(e: React.DragEvent) {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false)
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFileSelect(file)
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('screening_token', property.screening_token)
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value))
      })
      if (uploadedFile) formData.append('income_document', uploadedFile)

      const res = await fetch('/api/submit-application', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Submission failed')
      setSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center py-10">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            boxShadow: '0 0 40px rgba(16,185,129,0.2)',
          }}
        >
          <CheckCircle className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-100 mb-3">Application Submitted!</h2>
        <p className="text-slate-400 max-w-sm mx-auto text-sm leading-relaxed">
          Your application for <strong className="text-slate-300">{property.name}</strong> has been received. The landlord will
          review it and reach out if you&apos;re selected.
        </p>
        <p className="text-xs text-slate-600 mt-5">You can close this window.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Step indicator */}
      <div className="mb-8">
        {/* Progress bar */}
        <div className="w-full h-1 rounded-full mb-5 overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: `${((step - 1) / (STEPS.length - 1)) * 100}%`,
              background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
            }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center flex-1">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 flex-shrink-0"
                style={
                  step > s.id
                    ? { background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', color: 'white', boxShadow: '0 0 12px rgba(59,130,246,0.4)' }
                    : step === s.id
                    ? { background: 'rgba(59,130,246,0.2)', color: '#60A5FA', border: '2px solid rgba(59,130,246,0.5)', boxShadow: '0 0 16px rgba(59,130,246,0.3)' }
                    : { background: 'rgba(255,255,255,0.05)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {step > s.id ? '✓' : s.id}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="flex-1 h-px mx-2 transition-all duration-500"
                  style={{ background: step > s.id ? 'linear-gradient(90deg, rgba(59,130,246,0.4), rgba(139,92,246,0.2))' : 'rgba(255,255,255,0.06)' }}
                />
              )}
            </div>
          ))}
        </div>

        <div>
          <h3 className="font-bold text-slate-100">{STEPS[step - 1].title}</h3>
          <p className="text-sm text-slate-500 mt-0.5">{STEPS[step - 1].description}</p>
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="space-y-4">
          <Input label="Full Name" placeholder="Jane Smith" {...register('full_name')} error={errors.full_name?.message} />
          <Input label="Email Address" type="email" placeholder="jane@email.com" {...register('email')} error={errors.email?.message} />
          <Input label="Phone Number" type="tel" placeholder="(416) 555-0123" {...register('phone')} error={errors.phone?.message} />
        </div>
      )}

      {/* Step 2: Employment */}
      {step === 2 && (
        <div className="space-y-4">
          <Input
            label="Monthly Income (before tax)"
            type="number"
            placeholder="4500"
            hint="Enter your gross monthly income in dollars"
            {...register('monthly_income_reported', { valueAsNumber: true })}
            error={errors.monthly_income_reported?.message}
          />
          <Input label="Employer Name" placeholder="Acme Corporation" {...register('employer_name')} error={errors.employer_name?.message} />
          <Input label="Time at Current Job" placeholder="e.g., 2 years, 8 months" {...register('time_at_job')} error={errors.time_at_job?.message} />
          <Textarea
            label="Reason for Moving"
            placeholder="Tell us why you're looking for a new place..."
            rows={4}
            {...register('reason_for_moving')}
            error={errors.reason_for_moving?.message}
          />
        </div>
      )}

      {/* Step 3: Rental History */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Have you ever been evicted?</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: false, label: 'No, never' }, { value: true, label: 'Yes' }].map((opt) => (
                <label
                  key={String(opt.value)}
                  className="flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium"
                  style={hasEvictions === opt.value ? {
                    background: 'rgba(59,130,246,0.15)',
                    border: '2px solid rgba(59,130,246,0.4)',
                    color: '#60A5FA',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#64748B',
                  }}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={String(opt.value)}
                    {...register('has_evictions', { setValueAs: (v) => v === 'true' })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {hasEvictions && (
              <Textarea label="Please explain" placeholder="Provide details about the eviction..." {...register('eviction_explanation')} error={errors.eviction_explanation?.message} />
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-300">Have you had any late rental payments in the past 3 years?</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ value: false, label: 'No, always on time' }, { value: true, label: 'Yes' }].map((opt) => (
                <label
                  key={String(opt.value)}
                  className="flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all duration-200 text-sm font-medium"
                  style={hasLatePayments === opt.value ? {
                    background: 'rgba(59,130,246,0.15)',
                    border: '2px solid rgba(59,130,246,0.4)',
                    color: '#60A5FA',
                  } : {
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#64748B',
                  }}
                >
                  <input
                    type="radio"
                    className="sr-only"
                    value={String(opt.value)}
                    {...register('has_late_payments', { setValueAs: (v) => v === 'true' })}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
            {hasLatePayments && (
              <Textarea label="Please explain" placeholder="Provide details about the late payments..." {...register('late_payment_explanation')} error={errors.late_payment_explanation?.message} />
            )}
          </div>
        </div>
      )}

      {/* Step 4: References */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-bold text-slate-300">Reference 1</h4>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-semibold"
                style={{ background: 'rgba(59,130,246,0.15)', color: '#60A5FA' }}
              >
                Required
              </span>
            </div>
            <div className="space-y-3">
              <Input label="Full Name" placeholder="John Doe" {...register('reference_1_name')} error={errors.reference_1_name?.message} />
              <Input label="Relationship to You" placeholder="e.g., Previous landlord, Manager" {...register('reference_1_relationship')} error={errors.reference_1_relationship?.message} />
              <Input label="Phone Number" type="tel" placeholder="(416) 555-0100" {...register('reference_1_phone')} error={errors.reference_1_phone?.message} />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-sm font-bold text-slate-300">Reference 2</h4>
              <span className="text-xs text-slate-600">Optional</span>
            </div>
            <div className="space-y-3">
              <Input label="Full Name" placeholder="Jane Doe" {...register('reference_2_name')} error={errors.reference_2_name?.message} />
              <Input label="Relationship to You" placeholder="e.g., Previous landlord, Manager" {...register('reference_2_relationship')} error={errors.reference_2_relationship?.message} />
              <Input label="Phone Number" type="tel" placeholder="(416) 555-0200" {...register('reference_2_phone')} error={errors.reference_2_phone?.message} />
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Income Document */}
      {step === 5 && (
        <div className="space-y-4">
          {/* Info banner */}
          <div
            className="flex items-start gap-3 rounded-xl p-4"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}
          >
            <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-300">
                Uploading a document significantly improves your score
              </p>
              <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                Applicants with verified income are prioritised by landlords. Accepted: pay stub, bank statement, or employment offer letter.
              </p>
            </div>
          </div>

          {/* Upload zone */}
          {uploadedFile ? (
            <div
              className="flex items-center gap-4 p-5 rounded-2xl"
              style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid rgba(16,185,129,0.25)' }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(16,185,129,0.2)' }}
              >
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-emerald-300 truncate">{uploadedFile.name}</p>
                <p className="text-xs text-emerald-500 mt-0.5">
                  {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to upload
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setUploadedFile(null); setFileError(null) }}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200"
                style={{ color: '#34D399' }}
                aria-label="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative w-full rounded-2xl cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center py-12 px-6"
              style={isDragging ? {
                background: 'rgba(59,130,246,0.1)',
                border: '2px dashed rgba(59,130,246,0.5)',
                transform: 'scale(1.01)',
              } : {
                background: 'rgba(255,255,255,0.03)',
                border: '2px dashed rgba(255,255,255,0.1)',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200"
                style={isDragging ? {
                  background: 'rgba(59,130,246,0.2)',
                  boxShadow: '0 0 24px rgba(59,130,246,0.3)',
                } : {
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <CloudUpload className="w-8 h-8" style={{ color: isDragging ? '#60A5FA' : '#475569' }} />
              </div>

              <p className="text-base font-semibold text-slate-200 mb-1">
                {isDragging ? 'Drop your file here' : 'Drag & drop your document here'}
              </p>
              <p className="text-sm text-slate-500 mb-5">or click anywhere to browse</p>

              <div className="flex flex-wrap justify-center gap-2 text-xs text-slate-500 mb-4">
                {['Pay stub', 'Bank statement', 'Offer letter'].map(label => (
                  <span
                    key={label}
                    className="px-3 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              <p className="text-xs text-slate-600">PDF, JPG, or PNG · Max 10MB</p>

              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileSelect(file)
                  e.target.value = ''
                }}
              />
            </div>
          )}

          {fileError && (
            <div
              className="flex items-center gap-2.5 rounded-xl p-3.5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{fileError}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Provide later */}
          <label
            className="flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-200"
            style={provideLater ? {
              background: 'rgba(255,255,255,0.06)',
              border: '2px solid rgba(255,255,255,0.12)',
            } : {
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <input
              type="checkbox"
              checked={provideLater}
              onChange={(e) => {
                setProvideLater(e.target.checked)
                if (e.target.checked) { setUploadedFile(null); setFileError(null) }
              }}
              className="mt-0.5 w-4 h-4 rounded cursor-pointer accent-blue-500"
            />
            <div>
              <p className="text-sm font-semibold text-slate-300">I will provide income documents later</p>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                Your application will be submitted, but may receive a lower score without verified income.
              </p>
            </div>
          </label>

          {!canSubmit && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Upload a document or check the box above to continue.</span>
            </div>
          )}

          {error && (
            <div
              className="flex items-center gap-2.5 rounded-xl p-3.5"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div
        className="flex items-center justify-between mt-8 pt-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        {step > 1 ? (
          <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)} size="md">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        ) : (
          <div />
        )}

        {step < STEPS.length ? (
          <Button type="button" onClick={handleNext} size="md">
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" loading={submitting} disabled={!canSubmit} size="md">
            Submit Application
          </Button>
        )}
      </div>
    </form>
  )
}
