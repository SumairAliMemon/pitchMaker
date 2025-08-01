import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

// Test endpoint - POST /api/job-descriptions-test - Create job description without auth
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Parse request body
    const body = await request.json()
    const { title, company_name, description, source_url, user_id } = body

    // Validate required fields
    if (!description || description.trim() === '') {
      return NextResponse.json(
        { error: 'description is required' }, 
        { status: 400 }
      )
    }

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required for testing' }, 
        { status: 400 }
      )
    }

    // Create job description
    const { data: jobDescription, error } = await supabase
      .from('job_descriptions')
      .insert({
        user_id: user_id,
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
      return NextResponse.json({ 
        error: 'Failed to create job description',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      job_description: jobDescription,
      message: 'Job description created successfully'
    }, { status: 201 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Test endpoint - GET /api/job-descriptions-test - Get job descriptions without auth
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get user_id from query params
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id query parameter is required for testing' }, 
        { status: 400 }
      )
    }

    // Get all job descriptions for this user
    const { data: jobDescriptions, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching job descriptions:', error)
      return NextResponse.json({ 
        error: 'Failed to fetch job descriptions',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      job_descriptions: jobDescriptions,
      count: jobDescriptions?.length || 0,
      message: `Found ${jobDescriptions?.length || 0} job descriptions`
    }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Test endpoint - DELETE /api/job-descriptions-test - Delete job description without auth
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get parameters from query params
    const { searchParams } = new URL(request.url)
    const jobDescriptionId = searchParams.get('id')
    const userId = searchParams.get('user_id')

    if (!jobDescriptionId) {
      return NextResponse.json(
        { error: 'Job description ID is required' }, 
        { status: 400 }
      )
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id is required for testing' }, 
        { status: 400 }
      )
    }

    // Delete job description (only if it belongs to the user)
    const { data: deletedJobDescription, error } = await supabase
      .from('job_descriptions')
      .delete()
      .eq('id', jobDescriptionId)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error deleting job description:', error)
      return NextResponse.json({ 
        error: 'Failed to delete job description',
        details: error.message 
      }, { status: 500 })
    }

    if (!deletedJobDescription) {
      return NextResponse.json({ 
        error: 'Job description not found or not authorized' 
      }, { status: 404 })
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
