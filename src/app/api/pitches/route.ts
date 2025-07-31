import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pitches - Get all pitches for authenticated user
export async function GET() {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all pitches for this user
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
    console.error('Error in GET /api/pitches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pitches - Create new pitch
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

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
        { error: 'Job description and generated pitch are required' }, 
        { status: 400 }
      )
    }

    // Insert pitch
    const { data: pitch, error } = await supabase
      .from('pitches')
      .insert({
        user_id: user.id,
        job_title: job_title || null,
        company_name: company_name || null,
        job_description,
        job_description_id: job_description_id || null,
        generated_pitch,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating pitch:', error)
      return NextResponse.json({ error: 'Failed to create pitch' }, { status: 500 })
    }

    return NextResponse.json({ pitch })

  } catch (error) {
    console.error('Error in POST /api/pitches:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
