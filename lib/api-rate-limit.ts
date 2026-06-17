import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from './rate-limit'

export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

/**
 * Global API rate limit: 100 requests per IP per hour.
 * Returns a 429 NextResponse if the limit is exceeded, or null if the
 * request is allowed. Each API route uses a shared `api:<ip>` bucket so
 * the limit is applied across all endpoints together.
 *
 * Usage:
 *   const limited = globalApiRateLimit(request)
 *   if (limited) return limited
 */
export function globalApiRateLimit(
  request: NextRequest,
  limit = 100,
  windowMs = 60 * 60 * 1000,
): NextResponse | null {
  const ip = getClientIp(request)
  const { allowed, resetAt } = checkRateLimit(`api:${ip}`, limit, windowMs)
  if (allowed) return null
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: { 'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)) },
    },
  )
}
