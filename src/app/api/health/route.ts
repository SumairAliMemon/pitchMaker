import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createSupabaseServer()
    
    // Test basic connection
    const { error: connectionError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: connectionError.message,
        code: connectionError.code,
        suggestion: connectionError.code === 'PGRST116' || connectionError.message?.includes('relation') 
          ? 'Run the simplified_schema.sql in your Supabase SQL Editor to create the required tables'
          : 'Check your Supabase configuration'
      }, { status: 500 })
    }

    // Test authentication
    const { data: { user } } = await supabase.auth.getUser()
    
    return NextResponse.json({
      status: 'success',
      message: 'Database and authentication working',
      tables: {
        user_profiles: 'exists',
        job_descriptions: 'exists', 
        pitches: 'exists'
      },
      user: user ? 'authenticated' : 'not authenticated',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Unexpected error',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
