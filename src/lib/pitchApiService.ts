import { createSupabaseServer } from '@/lib/supabaseServer'

// Get a specific pitch by ID for the authenticated user
export async function getPitchById(pitchId: string, userId: string) {
  const supabase = await createSupabaseServer()
  
  const { data: pitch, error } = await supabase
    .from('pitches')
    .select('*')
    .eq('id', pitchId)
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { pitch: null, error: 'Pitch not found', status: 404 }
    }
    console.error('Error fetching pitch:', error)
    return { pitch: null, error: 'Failed to fetch pitch', status: 500 }
  }

  return { pitch, error: null, status: 200 }
}

// Update pitch status
export async function updatePitchStatus(pitchId: string, userId: string, pitchStatus: string) {
  // Validate pitch_status
  if (!['generated', 'favorited', 'used'].includes(pitchStatus)) {
    return { 
      pitch: null, 
      error: 'Invalid pitch_status. Must be one of: generated, favorited, used', 
      status: 400 
    }
  }

  const supabase = await createSupabaseServer()
  
  const { data: pitch, error } = await supabase
    .from('pitches')
    .update({ pitch_status: pitchStatus })
    .eq('id', pitchId)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return { pitch: null, error: 'Pitch not found', status: 404 }
    }
    console.error('Error updating pitch:', error)
    return { pitch: null, error: 'Failed to update pitch', status: 500 }
  }

  return { pitch, error: null, status: 200 }
}

// Delete a pitch
export async function deletePitch(pitchId: string, userId: string) {
  const supabase = await createSupabaseServer()
  
  const { error } = await supabase
    .from('pitches')
    .delete()
    .eq('id', pitchId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error deleting pitch:', error)
    return { error: 'Failed to delete pitch', status: 500 }
  }

  return { error: null, status: 200, message: 'Pitch deleted successfully' }
}

// Get authenticated user from request
export async function getAuthenticatedUser() {
  const supabase = await createSupabaseServer()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    return { user: null, error: 'Unauthorized', status: 401 }
  }

  return { user, error: null, status: 200 }
}
