import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Build a per-request Content-Security-Policy header.
 *
 * script-src uses a cryptographic nonce instead of 'unsafe-inline'.
 * A fresh nonce is generated on every request so there is nothing static
 * for an attacker to predict or replay. 'strict-dynamic' is included so
 * that scripts loaded by a nonced script (e.g. GTM loading analytics.js)
 * are automatically trusted — without it every domain GTM injects would
 * have to be whitelisted. The URL allowlist at the end is a fallback for
 * older browsers that don't understand strict-dynamic.
 *
 * style-src retains 'unsafe-inline' because React renders inline styles
 * as style="…" HTML attributes throughout the codebase. Nonces only apply
 * to <style> blocks, not to attribute-level styles, so removing
 * unsafe-inline here would require migrating every component to CSS classes.
 */
function buildCsp(nonce: string): string {
  const directives = [
    "default-src 'self'",

    [
      "script-src",
      "'self'",
      `'nonce-${nonce}'`,
      "'strict-dynamic'",
      // Fallback allowlist for browsers without strict-dynamic support
      "https://www.googletagmanager.com",
      "https://www.google-analytics.com",
      "https://www.redditstatic.com",
      "https://vercel.live",
    ].join(' '),

    // unsafe-inline required for React style={{}} attribute-level inline styles
    "style-src 'self' 'unsafe-inline'",

    "img-src 'self' data: blob: https://*.supabase.co",
    "font-src 'self'",

    [
      "connect-src 'self'",
      "https://*.supabase.co",
      "https://api.stripe.com",
      "https://ads-api.reddit.com",
      "https://www.google-analytics.com",
      "https://www.googletagmanager.com",
      "https://vitals.vercel-insights.com",
      "https://va.vercel-scripts.com",
    ].join(' '),

    "frame-src https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
    "frame-ancestors 'none'",
    "form-action 'self' https://checkout.stripe.com",
    "base-uri 'self'",
    "object-src 'none'",
  ]

  return directives.join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Generate a fresh nonce for every request.
  // crypto.randomUUID() is available in the Edge/Node runtime without imports.
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp   = buildCsp(nonce)

  // Inject the nonce into the *request* headers so Server Components can read
  // it with headers() — Next.js forwards mutated request headers to the RSC
  // renderer when you pass them via NextResponse.next({ request }).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)

  // ── Fast path: routes that don't need an auth check ──────────────────────
  // Only /dashboard/*, /login, and /signup need the Supabase round-trip.
  // Every other route (/, /apply/*, /privacy, /terms, /api/*, ...) still gets
  // the nonce so the root layout's tracking scripts are covered.
  const needsAuthCheck =
    pathname.startsWith('/dashboard') ||
    pathname === '/login' ||
    pathname === '/signup'

  if (!needsAuthCheck) {
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('x-nonce', nonce)
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  // ── Auth flow (dashboard / login / signup only) ───────────────────────────
  const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Fail closed when env vars are missing — never let an unauthenticated
  // request through /dashboard just because configuration is broken.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search   = ''
      return NextResponse.redirect(url)
    }
    const res = NextResponse.next({ request: { headers: requestHeaders } })
    res.headers.set('x-nonce', nonce)
    res.headers.set('Content-Security-Policy', csp)
    return res
  }

  // supabaseResponse is reassigned inside setAll() if Supabase needs to write
  // session cookies — we must return *that* response so the cookies are set.
  let supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request: { headers: requestHeaders } })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Treat auth failures as unauthenticated — page-level server components
    // perform their own getUser() check as a second layer.
  }

  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.search   = ''
    url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Stamp the nonce and CSP onto whichever response object Supabase produced.
  supabaseResponse.headers.set('x-nonce', nonce)
  supabaseResponse.headers.set('Content-Security-Policy', csp)
  return supabaseResponse
}

export const config = {
  matcher: [
    // Run on every route that can serve HTML — excludes Next.js internals,
    // static files, and image optimisation paths. API routes are included
    // (the nonce header on JSON responses is harmless) so the pattern stays
    // simple. Static assets under /_next/static are the main exclusion.
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
}
