import { supabase } from './supabase'

export interface SavedJobDescription {
  id: string
  user_id: string
  title: string
  company?: string | null
  description: string
  created_at: string
  updated_at: string
}

export const jobDescriptionService = {
  // Save a job description
  async saveJobDescription(
    userId: string,
    title: string,
    description: string,
    company?: string
  ): Promise<SavedJobDescription | null> {
    try {
      const { data, error } = await supabase
        .from('saved_job_descriptions')
        .insert({
          user_id: userId,
          title: title.trim(),
          company: company?.trim() || null,
          description: description.trim(),
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving job description:', error)
        return null
      }

      return data as unknown as SavedJobDescription
    } catch (error) {
      console.error('Error saving job description:', error)
      return null
    }
  },

  // Get all saved job descriptions for a user
  async getUserJobDescriptions(userId: string): Promise<SavedJobDescription[]> {
    try {
      const { data, error } = await supabase
        .from('saved_job_descriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching job descriptions:', error)
        return []
      }

      return data as unknown as SavedJobDescription[]
    } catch (error) {
      console.error('Error fetching job descriptions:', error)
      return []
    }
  },

  // Delete a saved job description
  async deleteJobDescription(jobDescriptionId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_job_descriptions')
        .delete()
        .eq('id', jobDescriptionId)

      if (error) {
        console.error('Error deleting job description:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error deleting job description:', error)
      return false
    }
  },

  // Update a saved job description
  async updateJobDescription(
    jobDescriptionId: string,
    updates: Partial<Pick<SavedJobDescription, 'title' | 'company' | 'description'>>
  ): Promise<SavedJobDescription | null> {
    try {
      const { data, error } = await supabase
        .from('saved_job_descriptions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', jobDescriptionId)
        .select()
        .single()

      if (error) {
        console.error('Error updating job description:', error)
        return null
      }

      return data as unknown as SavedJobDescription
    } catch (error) {
      console.error('Error updating job description:', error)
      return null
    }
  }
}
