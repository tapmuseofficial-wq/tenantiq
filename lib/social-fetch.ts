import { assertSafePublicUrl } from '@/lib/ssrf'

/** Maximum number of links a tenant may submit. */
export const MAX_SOCIAL_LINKS = 5

/** Hard cap on response body size to avoid prompt-stuffing. */
const MAX_BYTES = 80_000   // 80 KB
const FETCH_TIMEOUT_MS = 8_000

export type FetchStatus = 'ok' | 'blocked' | 'timeout' | 'ssrf_blocked' | 'error'

export interface SocialFetchResult {
  url: string
  status: FetchStatus
  /** Extracted plain text, null when status !== 'ok'. */
  text: string | null
  /** HTTP status code when one was received. */
  httpStatus?: number
  error?: string
}

/**
 * Parse raw textarea input (comma-separated or newline-separated) into a
 * de-duplicated list of at most MAX_SOCIAL_LINKS URLs.
 */
export function parseSocialLinks(raw: string): string[] {
  return [
    ...new Set(
      raw
        .split(/[\n,]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && s.length <= 2048)
    ),
  ].slice(0, MAX_SOCIAL_LINKS)
}

/**
 * Strip HTML tags and collapse whitespace so only readable text remains.
 * Keeps enough structure (newlines between block elements) for Claude to
 * understand the content without needing a real DOM parser.
 */
function htmlToText(html: string): string {
  return html
    // Replace block/structural tags with newlines
    .replace(/<\/(p|div|li|h[1-6]|br|tr|section|article|header|footer|nav|main|aside)[^>]*>/gi, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    // Strip all remaining tags
    .replace(/<[^>]+>/g, ' ')
    // Decode common HTML entities
    .replace(/&amp;/g,  '&')
    .replace(/&lt;/g,   '<')
    .replace(/&gt;/g,   '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g,  "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x27;/g, "'")
    // Collapse whitespace
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/**
 * Fetch one tenant-supplied URL safely:
 *  - Validates it is HTTPS and not a private/internal host (SSRF guard)
 *  - Uses a strict 8-second timeout
 *  - Caps the response body at MAX_BYTES
 *  - Returns extracted plain text from HTML, or raw text for other content types
 *
 * No deceptive User-Agent is set — we identify as a standard HTTP client.
 * If a platform blocks us, the result status records that honestly.
 */
export async function fetchSocialUrl(rawUrl: string): Promise<SocialFetchResult> {
  // SSRF check first — rejects private IPs, non-HTTPS, and internal hostnames
  try {
    assertSafePublicUrl(rawUrl)
  } catch (err) {
    return {
      url:    rawUrl,
      status: 'ssrf_blocked',
      text:   null,
      error:  err instanceof Error ? err.message : String(err),
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(rawUrl, {
      signal:  controller.signal,
      headers: {
        // A neutral client identifier — not mimicking a browser to evade bot
        // detection. If the site requires authentication or blocks bots, we
        // record that honestly rather than trying to deceive it.
        'User-Agent': 'TenantIQ/1.0 (tenant-profile-review; +https://tenants-iq.com)',
        'Accept':     'text/html,text/plain,*/*',
      },
      redirect: 'follow',
    })

    clearTimeout(timer)

    if (!response.ok) {
      return {
        url:        rawUrl,
        status:     'blocked',
        text:       null,
        httpStatus: response.status,
        error:      `HTTP ${response.status}`,
      }
    }

    // Read up to MAX_BYTES, then discard the rest
    const reader   = response.body?.getReader()
    const chunks: Uint8Array[] = []
    let   total    = 0
    let   truncated = false

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done || !value) break
        const remaining = MAX_BYTES - total
        if (value.byteLength >= remaining) {
          chunks.push(value.slice(0, remaining))
          truncated = true
          break
        }
        chunks.push(value)
        total += value.byteLength
      }
      reader.cancel().catch(() => {})
    }

    const bodyText = new TextDecoder().decode(
      chunks.reduce((acc, c) => {
        const merged = new Uint8Array(acc.byteLength + c.byteLength)
        merged.set(acc, 0)
        merged.set(c, acc.byteLength)
        return merged
      }, new Uint8Array(0))
    )

    const contentType = response.headers.get('content-type') ?? ''
    const isHtml      = contentType.includes('text/html')
    const plainText   = isHtml ? htmlToText(bodyText) : bodyText.trim()

    // Cap extracted text at 3000 chars for the Claude prompt
    const capped = plainText.slice(0, 3000) + (plainText.length > 3000 || truncated ? '\n[... content truncated ...]' : '')

    return {
      url:        rawUrl,
      status:     'ok',
      text:       capped || null,
      httpStatus: response.status,
    }
  } catch (err) {
    clearTimeout(timer)
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return {
      url:    rawUrl,
      status: isTimeout ? 'timeout' : 'error',
      text:   null,
      error:  isTimeout ? 'Request timed out after 8 seconds' : (err instanceof Error ? err.message : String(err)),
    }
  }
}

/**
 * Fetch all tenant-supplied links concurrently. Each URL is fetched
 * independently — one failure does not block the others.
 */
export async function fetchAllSocialLinks(urls: string[]): Promise<SocialFetchResult[]> {
  return Promise.all(urls.map(url => fetchSocialUrl(url)))
}
