import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      return NextResponse.json({
        status: 'error',
        message: 'Session error',
        error: sessionError.message
      }, { status: 500 })
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({
        status: 'error',
        message: 'User error',  
        error: userError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      status: 'success',
      authenticated: !!session && !!user,
      session: {
        exists: !!session,
        expires_at: session?.expires_at,
        user_id: session?.user?.id
      },
      user: {
        exists: !!user,
        id: user?.id,
        email: user?.email,
        created_at: user?.created_at
      },
      message: session && user ? 'User is authenticated' : 'User is not authenticated',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error checking authentication',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
