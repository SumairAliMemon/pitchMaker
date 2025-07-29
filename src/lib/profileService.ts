import { supabase } from './supabase'

export interface UserProfile {
  id: string
  email: string
  full_name?: string | null
  background_details?: string | null
  skills?: string | null
  experience?: string | null
  education?: string | null
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

      if (!data) {
        return null
      }

      // Ensure the data matches UserProfile structure
      const profile: UserProfile = {
        id: data.id as string,
        email: data.email as string,
        full_name: data.full_name as string | null,
        background_details: data.background_details as string | null,
        skills: data.skills as string | null,
        experience: data.experience as string | null,
        education: data.education as string | null,
        created_at: data.created_at as string,
        updated_at: data.updated_at as string,
      }

      return profile
    } catch (error) {
      console.error('Error fetching profile:', error)
      return null
    }
  },

    // Create or update user profile
  async upsertProfile(profileData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert(profileData, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single()

      if (error) {
        console.error('Error upserting profile:', error)
        return null
      }

      if (!data) {
        return null
      }

      // Ensure the data matches UserProfile structure
      const profile: UserProfile = {
        id: data.id as string,
        email: data.email as string,
        full_name: data.full_name as string | null,
        background_details: data.background_details as string | null,
        skills: data.skills as string | null,
        experience: data.experience as string | null,
        education: data.education as string | null,
        created_at: data.created_at as string,
        updated_at: data.updated_at as string,
      }

      return profile
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

      if (!data) {
        return null
      }

      // Ensure the data matches UserProfile structure
      const profile: UserProfile = {
        id: data.id as string,
        email: data.email as string,
        full_name: data.full_name as string | null,
        background_details: data.background_details as string | null,
        skills: data.skills as string | null,
        experience: data.experience as string | null,
        education: data.education as string | null,
        created_at: data.created_at as string,
        updated_at: data.updated_at as string,
      }

      return profile
    } catch (error) {
      console.error('Error updating profile:', error)
      return null
    }
  }
}
