import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer()

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
    cookies: 'Debug info - cookies removed for security'
  }

  return NextResponse.json(debugInfo, { status: 200 })
}
