import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing the app is misconfigured. Fail closed on
  // dashboard routes — never let an unauthenticated request through just
  // because configuration is broken. Public routes aren't in the matcher
  // so they are unaffected.
  if (!supabaseUrl || !supabaseAnonKey) {
    const { pathname } = request.nextUrl
    if (pathname.startsWith('/dashboard')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.search = ''
      return NextResponse.redirect(url)
    }
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Wrap in try/catch so a transient network error or bad session cookie
  // doesn't crash the middleware and return MIDDLEWARE_INVOCATION_FAILED
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // Treat auth failures as unauthenticated — the page-level auth checks
    // in server components will handle the redirect if needed
  }

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    // Clear any query params carried over from the original URL before setting
    // the redirect param — otherwise /dashboard?upgraded=true produces
    // /login?upgraded=true&redirect=... with a spurious extra param.
    url.search = ''
    url.searchParams.set('redirect', request.nextUrl.pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  if ((pathname === '/login' || pathname === '/signup') && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  // Only run auth middleware on routes that actually need it.
  // Public routes (/, /apply/*, /api/*) are intentionally excluded so they
  // are never delayed by the Supabase auth round-trip.
  matcher: ['/dashboard/:path*', '/login', '/signup'],
}
