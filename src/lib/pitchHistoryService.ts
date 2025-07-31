import { supabase } from './supabase'

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

export interface PitchHistoryDetails extends PitchHistory {
  full_name?: string | null
  email?: string | null
  pitch_status?: string | null
}

export const pitchHistoryService = {
  // Get user's pitch history
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

  // Get user's pitch history with additional details
  async getUserPitchHistoryDetails(userId: string): Promise<PitchHistoryDetails[]> {
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

      return data as unknown as PitchHistoryDetails[]
    } catch (error) {
      console.error('Error fetching pitch history details:', error)
      return []
    }
  },

  // Get a specific pitch history entry
  async getPitchHistory(historyId: string): Promise<PitchHistory | null> {
    try {
      const { data, error } = await supabase
        .from('pitch_history')
        .select('*')
        .eq('id', historyId)
        .single()

      if (error) {
        console.error('Error fetching pitch history:', error)
        return null
      }

      return data as unknown as PitchHistory
    } catch (error) {
      console.error('Error fetching pitch history:', error)
      return null
    }
  },

  // Delete a pitch history entry
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

  // Get pitch history by pitch ID
  async getPitchHistoryByPitchId(pitchId: string): Promise<PitchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('pitch_history')
        .select('*')
        .eq('pitch_id', pitchId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching pitch history by pitch ID:', error)
        return []
      }

      return data as unknown as PitchHistory[]
    } catch (error) {
      console.error('Error fetching pitch history by pitch ID:', error)
      return []
    }
  },

  // Search pitch history by job title or company
  async searchPitchHistory(userId: string, searchTerm: string): Promise<PitchHistory[]> {
    try {
      const { data, error } = await supabase
        .from('pitch_history')
        .select('*')
        .eq('user_id', userId)
        .or(`job_title.ilike.%${searchTerm}%,company_name.ilike.%${searchTerm}%,job_description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error searching pitch history:', error)
        return []
      }

      return data as unknown as PitchHistory[]
    } catch (error) {
      console.error('Error searching pitch history:', error)
      return []
    }
  },

  // Get pitch history statistics for a user
  async getPitchHistoryStats(userId: string): Promise<{
    total: number
    thisMonth: number
    thisWeek: number
    byMethod: Record<string, number>
  }> {
    try {
      const { data, error } = await supabase
        .from('pitch_history')
        .select('created_at, generation_method')
        .eq('user_id', userId)

      if (error) {
        console.error('Error fetching pitch history stats:', error)
        return { total: 0, thisMonth: 0, thisWeek: 0, byMethod: {} }
      }

      const now = new Date()
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const thisWeek = new Date(now.setDate(now.getDate() - now.getDay()))

      const stats = {
        total: data.length,
        thisMonth: 0,
        thisWeek: 0,
        byMethod: {} as Record<string, number>
      }

      const entries = data as { created_at: string; generation_method: string }[]
      
      entries.forEach((entry) => {
        const createdAt = new Date(entry.created_at)
        
        if (createdAt >= thisMonth) {
          stats.thisMonth++
        }
        
        if (createdAt >= thisWeek) {
          stats.thisWeek++
        }

        const method = (entry.generation_method as string) || 'ai'
        stats.byMethod[method] = (stats.byMethod[method] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error calculating pitch history stats:', error)
      return { total: 0, thisMonth: 0, thisWeek: 0, byMethod: {} }
    }
  }
}
