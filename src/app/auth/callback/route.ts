import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  console.log('🔍 Auth callback route - Code:', !!code)
  
  if (code) {
    try {
      const supabase = await createSupabaseServer()
      
      console.log('🔄 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth callback error:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
      }
      
      if (data?.session) {
        console.log('✅ Session created successfully')
        return NextResponse.redirect(`${origin}/pitch-dashboard`)
      }
      
    } catch (error) {
      console.error('❌ Unexpected auth error:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error?error=unexpected_error`)
    }
  }
  
  // No code parameter
  console.log('❌ No authorization code found')
  return NextResponse.redirect(`${origin}/auth/auth-code-error?error=no_code`)
}
