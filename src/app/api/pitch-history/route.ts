import { createSupabaseServer } from '@/lib/supabaseServer'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pitch-history - Get pitch history for authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    let query
    
    if (detailed) {
      // Use the view for detailed information
      query = supabase
        .from('pitch_history_details')
        .select('*')
        .eq('user_id', user.id)
    } else {
      // Use basic pitches table since pitch_history might not exist
      query = supabase
        .from('pitches')
        .select('*')
        .eq('user_id', user.id)
    }

    const { data: history, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching pitch history:', error)
      return NextResponse.json({ error: 'Failed to fetch pitch history' }, { status: 500 })
    }

    return NextResponse.json({ history })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/pitch-history - Delete a pitch from history
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServer()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { historyId } = body

    if (!historyId) {
      return NextResponse.json({ error: 'historyId is required' }, { status: 400 })
    }

    // Delete the pitch (using pitches table)
    const { error } = await supabase
      .from('pitches')
      .delete()
      .eq('id', historyId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting pitch:', error)
      return NextResponse.json({ error: 'Failed to delete pitch' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pitch deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
