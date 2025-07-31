import { getPitchById, updatePitchStatus, deletePitch, getAuthenticatedUser } from '@/lib/pitchApiService'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/pitches/[id] - Get specific pitch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Get authenticated user
    const { user, error: authError, status: authStatus } = await getAuthenticatedUser()
    
    if (authError) {
      return NextResponse.json({ error: authError }, { status: authStatus })
    }

    // Get the pitch
    const { pitch, error, status } = await getPitchById(id, user!.id)
    
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    return NextResponse.json({ pitch })

  } catch (error) {
    console.error('Error in GET /api/pitches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/pitches/[id] - Update pitch status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { pitch_status } = body

    if (!id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Get authenticated user
    const { user, error: authError, status: authStatus } = await getAuthenticatedUser()
    
    if (authError) {
      return NextResponse.json({ error: authError }, { status: authStatus })
    }

    // Update the pitch
    const { pitch, error, status } = await updatePitchStatus(id, user!.id, pitch_status)
    
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    return NextResponse.json({ pitch })

  } catch (error) {
    console.error('Error in PATCH /api/pitches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/pitches/[id] - Delete pitch
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Pitch ID is required' }, { status: 400 })
    }

    // Get authenticated user
    const { user, error: authError, status: authStatus } = await getAuthenticatedUser()
    
    if (authError) {
      return NextResponse.json({ error: authError }, { status: authStatus })
    }

    // Delete the pitch
    const { error, status, message } = await deletePitch(id, user!.id)
    
    if (error) {
      return NextResponse.json({ error }, { status })
    }

    return NextResponse.json({ message })

  } catch (error) {
    console.error('Error in DELETE /api/pitches/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
