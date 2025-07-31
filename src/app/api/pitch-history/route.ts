import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pitch-history - Get pitch history for authenticated user
export async function GET(request: NextRequest) {
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
      // Use basic pitch_history table
      query = supabase
        .from('pitch_history')
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

// DELETE /api/pitch-history/[id] - Delete a pitch history entry
export async function DELETE(request: NextRequest) {
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

    const body = await request.json()
    const { historyId } = body

    if (!historyId) {
      return NextResponse.json({ error: 'historyId is required' }, { status: 400 })
    }

    // Delete the pitch history entry
    const { error } = await supabase
      .from('pitch_history')
      .delete()
      .eq('id', historyId)
      .eq('user_id', user.id) // Ensure user can only delete their own history

    if (error) {
      console.error('Error deleting pitch history:', error)
      return NextResponse.json({ error: 'Failed to delete pitch history' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Pitch history deleted successfully' })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
