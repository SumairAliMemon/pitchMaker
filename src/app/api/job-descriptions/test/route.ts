import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// GET /api/job-descriptions/test - Test endpoint to check all job descriptions
export async function GET() {
  try {
    // Get all job descriptions (for testing purposes)
    const { data: jobDescriptions, error } = await supabase
      .from('job_descriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10) // Limit to last 10 for testing

    if (error) {
      console.error('Error fetching job descriptions:', error)
      return NextResponse.json({ error: 'Failed to fetch job descriptions', details: error }, { status: 500 })
    }

    return NextResponse.json({ 
      job_descriptions: jobDescriptions,
      count: jobDescriptions?.length || 0,
      message: 'Recent job descriptions retrieved successfully'
    }, { status: 200 })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
