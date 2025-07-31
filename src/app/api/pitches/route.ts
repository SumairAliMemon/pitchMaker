import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pitches - Get all pitches for authenticated user
export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's pitches
    const { data: pitches, error } = await supabase
      .from('pitches')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pitches:', error)
      return NextResponse.json({ error: 'Failed to fetch pitches' }, { status: 500 })
    }

    return NextResponse.json({ pitches })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pitches - Create a new pitch
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { 
      job_title, 
      company_name, 
      job_description, 
      job_description_id, 
      generated_pitch 
    } = body

    // Validate required fields
    if (!job_description || !generated_pitch) {
      return NextResponse.json(
        { error: 'job_description and generated_pitch are required' }, 
        { status: 400 }
      )
    }

    // Create new pitch
    const { data: pitch, error } = await supabase
      .from('pitches')
      .insert({
        user_id: user.id,
        job_description_id: job_description_id || null,
        job_title: job_title || null,
        company_name: company_name || null,
        raw_job_description: job_description,
        generated_pitch: generated_pitch,
        pitch_status: 'generated'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pitch:', error)
      return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 })
    }

    return NextResponse.json({ pitch }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
