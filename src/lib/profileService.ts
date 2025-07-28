import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  background_details?: string
  skills?: string
  experience?: string
  education?: string
  created_at: string
  updated_at: string
}

export const profileService = {
  // Get user profile
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }

      return data as unknown as UserProfile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  },

  // Create or update user profile
  async upsertProfile(profile: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profile, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting profile:', error)
        return null
      }

      return data as unknown as UserProfile
    } catch (error) {
      console.error('Error upserting profile:', error)
      return null
    }
  },

  // Update specific profile fields
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating profile:', error)
        return null
      }

      return data as unknown as UserProfile
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }
}
