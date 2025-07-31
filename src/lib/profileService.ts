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
        .maybeSingle()

      if (error) {
        // If no profile found, return null so the component can handle creating one
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error fetching profile:', error)
        // If table doesn't exist, provide helpful message
        if (error.message?.includes('relation "user_profiles" does not exist')) {
          console.error('The user_profiles table does not exist. Please run the simplified_schema.sql file in your Supabase database.')
        }
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
        .maybeSingle()

      if (error) {
        console.error('Error upserting profile:', error)
        if (error.message?.includes('relation "user_profiles" does not exist')) {
          console.error('The user_profiles table does not exist. Please run the user_profiles_migration.sql file in your Supabase database.')
        }
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

  // Update specific profile fields (upsert - insert or update)
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      // For client-side usage, we'll pass the email from the calling component
      // Get the current user's session to verify they're authenticated
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.error('No authenticated user session found')
        return null
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({ 
          id: userId,
          email: session.user.email || '',
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error updating profile:', error)
        if (error.message?.includes('relation "user_profiles" does not exist')) {
          console.error('The user_profiles table does not exist. Please run the user_profiles_migration.sql file in your Supabase database.')
        }
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
