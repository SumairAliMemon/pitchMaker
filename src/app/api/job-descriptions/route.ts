import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/job-descriptions - Get all job descriptions for current user
export async function GET() {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all job descriptions for this user
    const { data: jobDescriptions, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching job descriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch job descriptions' }, { status: 500 })
    }

    return NextResponse.json({ 
      job_descriptions: jobDescriptions,
      count: jobDescriptions?.length || 0
    }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/job-descriptions - Create a new job description
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
    const { title, company_name, description, source_url } = body

    // Validate required fields
    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'description is required' }, 
        { status: 400 }
      )
    }

    // Create job description
    const { data: jobDescription, error } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: user.id,
        title: title?.trim() || null,
        company_name: company_name?.trim() || null,
        description: description.trim(),
        source_url: source_url?.trim() || null,
        is_saved: true
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating job description:', error)
      return NextResponse.json({ error: 'Failed to create job description' }, { status: 500 })
    }

    return NextResponse.json({ 
      job_description: jobDescription
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/job-descriptions - Delete a job description
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get job description ID from query params
    const { searchParams } = new URL(request.url)
    const jobDescriptionId = searchParams.get('id')

    if (!jobDescriptionId) {
      return NextResponse.json(
        { error: 'Job description ID is required' }, 
        { status: 400 }
      )
    }

    // Delete job description (only if it belongs to the user)
    const { data: deletedJobDescription, error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', jobDescriptionId)
      .eq('user_id', user.id) // Ensure user can only delete their own job descriptions
      .select()
      .single()

    if (error) {
      console.error('Error deleting job description:', error)
      return NextResponse.json({ error: 'Failed to delete job description' }, { status: 500 })
    }

    if (!deletedJobDescription) {
      return NextResponse.json({ error: 'Job description not found or not authorized' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Job description deleted successfully',
      deleted_job_description: deletedJobDescription
    }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
