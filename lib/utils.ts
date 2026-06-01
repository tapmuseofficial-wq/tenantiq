import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'CAD') {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 75) return 'text-green-600'
  if (score >= 55) return 'text-yellow-600'
  return 'text-red-600'
}

export function getScoreBgColor(score: number | null): string {
  if (score === null) return 'bg-gray-100 text-gray-500'
  if (score >= 75) return 'bg-green-100 text-green-700'
  if (score >= 55) return 'bg-yellow-100 text-yellow-700'
  return 'bg-red-100 text-red-700'
}

export function getRecommendationStyle(rec: string | null) {
  switch (rec) {
    case 'approve':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Approve' }
    case 'review':
      return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Review Further' }
    case 'decline':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Decline' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Pending' }
  }
}

export function getVerificationStyle(status: string | null) {
  switch (status) {
    case 'verified':
      return { bg: 'bg-green-100', text: 'text-green-700', label: 'Verified' }
    case 'discrepancy':
      return { bg: 'bg-red-100', text: 'text-red-700', label: 'Discrepancy Detected' }
    case 'unverified':
      return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Unverified' }
    case 'no_document':
      return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Not Provided' }
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-400', label: '—' }
  }
}

export function calcIncomeRatio(income: number | null, rent: number): number | null {
  if (!income || !rent) return null
  return Math.round((income / rent) * 10) / 10
}
