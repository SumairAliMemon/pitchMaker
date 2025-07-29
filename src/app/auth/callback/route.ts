import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('Auth callback called with:', { 
    code: code ? 'present' : 'missing', 
    origin, 
    next,
    fullUrl: request.url,
    headers: Object.fromEntries(request.headers.entries())
  })

  if (code) {
    try {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
            set(name: string, value: string, options: Record<string, unknown>) {
              cookieStore.set({ name, value, ...options })
            },
            remove(name: string, options: Record<string, unknown>) {
              cookieStore.delete({ name, ...options })
            },
          },
        }
      )

      console.log('Attempting to exchange code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth exchange error:', {
          message: error.message,
          status: error.status,
          details: error
        })
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}&details=${encodeURIComponent(JSON.stringify({
          status: error.status,
          code: error.name
        }))}}`)
      }

      if (data?.session) {
        console.log('Auth successful! Session data:', {
          userId: data.session.user.id,
          email: data.session.user.email,
          expiresAt: data.session.expires_at
        })
        
        // Redirect directly to dashboard for now (skip the success page to simplify)
        return NextResponse.redirect(`${origin}${next}`)
      } else {
        console.error('No session data received despite no error')
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_session_data`)
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent('unexpected_error')}&details=${encodeURIComponent(String(error))}`)
    }
  }

  console.log('No authorization code provided')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}
