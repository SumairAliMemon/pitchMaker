import { supabase } from './supabase'

export interface Pitch {
  id: string
  user_id: string
  job_description_id?: string | null
  job_title?: string | null
  company_name?: string | null
  job_description: string
  user_profile_snapshot?: Record<string, unknown>
  generated_pitch: string
  pitch_status: 'generated' | 'favorited' | 'used'
  created_at: string
  updated_at: string
}

export interface CreatePitchData {
  job_title?: string
  company_name?: string
  job_description: string
  job_description_id?: string
}

export const pitchService = {
  // Create a new pitch
  async createPitch(
    userId: string,
    pitchData: CreatePitchData,
    generatedPitch: string
  ): Promise<Pitch | null> {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .insert({
          user_id: userId,
          job_description_id: pitchData.job_description_id || null,
          job_title: pitchData.job_title || null,
          company_name: pitchData.company_name || null,
          job_description: pitchData.job_description,
          generated_pitch: generatedPitch,
          pitch_status: 'generated'
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating pitch:', error)
        return null
      }

      return data as unknown as Pitch
    } catch (error) {
      console.error('Error creating pitch:', error)
      return null
    }
  },

  // Get user's pitches
  async getUserPitches(userId: string): Promise<Pitch[]> {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pitches:', error)
        return []
      }

      return data as unknown as Pitch[]
    } catch (error) {
      console.error('Error fetching pitches:', error)
      return []
    }
  },

  // Get pitch by ID
  async getPitchById(pitchId: string): Promise<Pitch | null> {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('id', pitchId)
        .single()

      if (error) {
        console.error('Error fetching pitch:', error)
        return null
      }

      return data as unknown as Pitch
    } catch (error) {
      console.error('Error fetching pitch:', error)
      return null
    }
  },

  // Update pitch status
  async updatePitchStatus(
    pitchId: string,
    status: 'generated' | 'favorited' | 'used'
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pitches')
        .update({ pitch_status: status })
        .eq('id', pitchId)

      if (error) {
        console.error('Error updating pitch status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating pitch status:', error)
      return false
    }
  },

  // Delete pitch
  async deletePitch(pitchId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pitches')
        .delete()
        .eq('id', pitchId)

      if (error) {
        console.error('Error deleting pitch:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting pitch:', error)
      return false
    }
  },

  // Get pitch statistics
  async getPitchStats(userId: string): Promise<{
    total: number
    generated: number
    favorited: number
    used: number
  }> {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select('pitch_status')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching pitch stats:', error)
        return { total: 0, generated: 0, favorited: 0, used: 0 }
      }

      const stats = data.reduce(
        (acc, pitch) => {
          acc.total++
          acc[pitch.pitch_status as keyof typeof acc]++
          return acc
        },
        { total: 0, generated: 0, favorited: 0, used: 0 }
      )

      return stats
    } catch (error) {
      console.error('Error fetching pitch stats:', error)
      return { total: 0, generated: 0, favorited: 0, used: 0 }
    }
  }
}
