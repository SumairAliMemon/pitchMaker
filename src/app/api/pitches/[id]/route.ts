import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pitches/[id] - Get a specific pitch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pitchId } = await params
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

    // Get the pitch
    const { data: pitch, error } = await supabase
      .from('pitches')
      .select('*')
      .eq('id', pitchId)
      .eq('user_id', user.id) // Ensure user can only access their own pitches
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
      }
      console.error('Error fetching pitch:', error)
      return NextResponse.json({ error: 'Failed to fetch pitch' }, { status: 500 })
    }

    return NextResponse.json({ pitch })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/pitches/[id] - Update a pitch (mainly for status updates)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pitchId } = await params
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
    const { pitch_status } = body

    // Validate pitch_status if provided
    if (pitch_status && !['generated', 'favorited', 'used'].includes(pitch_status)) {
      return NextResponse.json(
        { error: 'Invalid pitch_status. Must be one of: generated, favorited, used' }, 
        { status: 400 }
      )
    }

    // Update the pitch
    const { data: pitch, error } = await supabase
      .from('pitches')
      .update({ pitch_status })
      .eq('id', pitchId)
      .eq('user_id', user.id) // Ensure user can only update their own pitches
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Pitch not found' }, { status: 404 })
      }
      console.error('Error updating pitch:', error)
      return NextResponse.json({ error: 'Failed to update pitch' }, { status: 500 })
    }

    return NextResponse.json({ pitch })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/pitches/[id] - Delete a pitch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: pitchId } = await params
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

    // Delete the pitch
    const { error } = await supabase
      .from('pitches')
      .delete()
      .eq('id', pitchId)
      .eq('user_id', user.id) // Ensure user can only delete their own pitches

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
