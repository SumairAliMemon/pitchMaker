import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
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

  // Get current session
  const { data: { session }, error } = await supabase.auth.getSession()

  const debugInfo = {
    timestamp: new Date().toISOString(),
    environment: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[PRESENT]' : '[MISSING]',
      NODE_ENV: process.env.NODE_ENV,
    },
    request: {
      url: request.url,
      origin: new URL(request.url).origin,
      headers: Object.fromEntries(request.headers.entries()),
    },
    session: session ? {
      userId: session.user.id,
      email: session.user.email,
      expiresAt: session.expires_at
    } : null,
    error: error ? {
      message: error.message,
      status: error.status
    } : null,
    cookies: cookieStore.getAll()
  }

  return NextResponse.json(debugInfo, { status: 200 })
}
