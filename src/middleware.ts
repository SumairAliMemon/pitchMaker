import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware for auth callback routes - these need to be processed without interference
  if (req.nextUrl.pathname.startsWith('/auth/')) {
    console.log('Skipping middleware for auth route:', req.nextUrl.pathname)
    return NextResponse.next()
  }

  // Skip middleware if Supabase credentials are not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials not found. Skipping authentication middleware.')
    return NextResponse.next()
  }

  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: Record<string, unknown>) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: Record<string, unknown>) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is signed in and on root path, redirect to pitch-dashboard
  if (session && req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/pitch-dashboard', req.url))
  }

  // If user is signed in and the current path is /login redirect the user to /pitch-dashboard
  if (session && req.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/pitch-dashboard', req.url))
  }

  // If user is not signed in and the current path is /pitch-dashboard redirect the user to /login
  if (!session && req.nextUrl.pathname === '/pitch-dashboard') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth (authentication routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
  ],
}
