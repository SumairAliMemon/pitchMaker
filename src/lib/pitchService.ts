import { supabase } from './supabase'

export interface Pitch {
  id: string
  user_id: string
  job_description_id?: string | null
  job_title?: string | null
  company_name?: string | null
  raw_job_description: string
  generated_pitch: string
  pitch_status: 'generated' | 'favorited' | 'used'
  created_at: string
  updated_at: string
}

export interface PitchHistory {
  id: string
  user_id: string
  pitch_id?: string | null
  job_title?: string | null
  company_name?: string | null
  job_description: string
  user_details_snapshot: string
  generated_pitch: string
  generation_method: 'ai' | 'template' | 'manual'
  created_at: string
}

export interface CreatePitchData {
  job_title?: string
  company_name?: string
  job_description: string
  job_description_id?: string
}

export const pitchService = {
  // Generate and save a new pitch
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
          raw_job_description: pitchData.job_description,
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

  // Get all pitches for a user
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

  // Get a specific pitch
  async getPitch(pitchId: string): Promise<Pitch | null> {
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

  // Update pitch status (favorited, used, etc.)
  async updatePitchStatus(
    pitchId: string,
    status: 'generated' | 'favorited' | 'used'
  ): Promise<Pitch | null> {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .update({ pitch_status: status })
        .eq('id', pitchId)
        .select()
        .single()

      if (error) {
        console.error('Error updating pitch status:', error)
        return null
      }

      return data as unknown as Pitch
    } catch (error) {
      console.error('Error updating pitch status:', error)
      return null
    }
  },

  // Delete a pitch
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

  // Get pitch history for a user
  async getUserPitchHistory(userId: string): Promise<PitchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('pitch_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pitch history:', error)
        return []
      }

      return data as unknown as PitchHistory[]
    } catch (error) {
      console.error('Error fetching pitch history:', error)
      return []
    }
  },

  // Get pitch history with details (using view)
  async getUserPitchHistoryDetails(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('pitch_history_details')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pitch history details:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error fetching pitch history details:', error)
      return []
    }
  },

  // Delete pitch history entry
  async deletePitchHistory(historyId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('pitch_history')
        .delete()
        .eq('id', historyId)

      if (error) {
        console.error('Error deleting pitch history:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting pitch history:', error)
      return false
    }
  },

  // Get pitches by job description
  async getPitchesByJobDescription(jobDescriptionId: string): Promise<Pitch[]> {
    try {
      const { data, error } = await supabase
        .from('pitches')
        .select('*')
        .eq('job_description_id', jobDescriptionId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pitches by job description:', error)
        return []
      }

      return data as unknown as Pitch[]
    } catch (error) {
      console.error('Error fetching pitches by job description:', error)
      return []
    }
  }
}
