/**
 * SSRF (Server-Side Request Forgery) protection utilities.
 *
 * These guards are applied to every server-side fetch() call that constructs
 * a URL from anything other than a compile-time string literal. They block:
 *  - Non-HTTPS schemes (http, file, ftp, ...)
 *  - Loopback addresses (127.0.0.1, ::1, localhost)
 *  - RFC-1918 private ranges (10.x, 172.16-31.x, 192.168.x)
 *  - Link-local / APIPA (169.254.x) — blocks AWS/GCP/Azure metadata endpoints
 *  - Cloud metadata hostnames (metadata.google.internal, etc.)
 *
 * Usage:
 *   assertAllowlistedUrl(url, ['api.example.com'])  // throws if unsafe or not in list
 */

/** Patterns matched against the hostname portion of the URL only. */
const BLOCKED_HOSTNAME_RE: RegExp[] = [
  /^localhost$/i,
  /^127\./,             // 127.0.0.0/8 loopback
  /^0\./,               // 0.0.0.0/8
  /^10\./,              // 10.0.0.0/8 private
  /^172\.(1[6-9]|2\d|3[01])\./,  // 172.16.0.0/12 private
  /^192\.168\./,        // 192.168.0.0/16 private
  /^169\.254\./,        // 169.254.0.0/16 link-local (AWS/GCP/Azure metadata)
  /^\[?::1\]?$/,        // IPv6 loopback
  /^\[?fc[0-9a-f]{2}:/i,  // IPv6 ULA (fc00::/7)
  /^metadata\.google\.internal$/i,
  /^instance-data$/i,   // DigitalOcean metadata
]

/**
 * Parses `rawUrl` and throws if it:
 *  - Is not a valid URL
 *  - Uses a non-HTTPS scheme
 *  - Resolves to a private/internal hostname
 *  - Is not in `allowedHosts`
 *
 * @param rawUrl      The full URL string to validate.
 * @param allowedHosts Exact hostnames that are permitted (e.g. ['api.stripe.com']).
 */
/**
 * Like assertAllowlistedUrl but without the hostname allowlist.
 * Use this when the caller cannot know the full set of permitted hosts in
 * advance — e.g. tenant-supplied social profile URLs. The private-IP and
 * scheme checks still apply in full; only the domain allowlist is omitted.
 *
 * @throws if the URL is invalid, non-HTTPS, or resolves to a private host.
 */
export function assertSafePublicUrl(rawUrl: string): void {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error(`[ssrf] rejected — unparseable URL`)
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`[ssrf] rejected — non-HTTPS scheme: ${parsed.protocol}`)
  }

  const { hostname } = parsed

  for (const pattern of BLOCKED_HOSTNAME_RE) {
    if (pattern.test(hostname)) {
      throw new Error(`[ssrf] rejected — private/internal host: ${hostname}`)
    }
  }
}

export function assertAllowlistedUrl(rawUrl: string, allowedHosts: string[]): void {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw new Error(`[ssrf] rejected — unparseable URL`)
  }

  if (parsed.protocol !== 'https:') {
    throw new Error(`[ssrf] rejected — non-HTTPS scheme: ${parsed.protocol}`)
  }

  const { hostname } = parsed

  for (const pattern of BLOCKED_HOSTNAME_RE) {
    if (pattern.test(hostname)) {
      throw new Error(`[ssrf] rejected — private/internal host: ${hostname}`)
    }
  }

  if (!allowedHosts.includes(hostname)) {
    throw new Error(`[ssrf] rejected — host not in allowlist: ${hostname}`)
  }
}
