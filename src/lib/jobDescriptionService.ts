import { supabase } from './supabase'

export interface JobDescription {
  id: string
  user_id: string
  title?: string | null
  company?: string | null
  description: string
  created_at: string
  updated_at: string
}

export interface CreateJobDescriptionData {
  title?: string
  company?: string
  description: string
}

export const jobDescriptionService = {
  // Create/save a job description
  async createJobDescription(
    userId: string,
    jobData: CreateJobDescriptionData
  ): Promise<JobDescription | null> {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .insert({
          user_id: userId,
          title: jobData.title || null,
          company: jobData.company || null,
          description: jobData.description
        })
        .select()
        .maybeSingle()

      if (error) {
        console.error('Error creating job description:', error)
        return null
      }

      return data as unknown as JobDescription
    } catch (error) {
      console.error('Error creating job description:', error)
      return null
    }
  },

  // Legacy method for compatibility
  async saveJobDescription(
    userId: string,
    title: string,
    description: string,
    company?: string
  ): Promise<JobDescription | null> {
    return this.createJobDescription(userId, {
      title,
      company: company,
      description
    })
  },

  // Get user's saved job descriptions
  async getUserJobDescriptions(userId: string): Promise<JobDescription[]> {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_saved', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching job descriptions:', error)
        return []
      }

      return data as unknown as JobDescription[]
    } catch (error) {
      console.error('Error fetching job descriptions:', error)
      return []
    }
  },

  // Get job description by ID
  async getJobDescriptionById(jobId: string): Promise<JobDescription | null> {
    try {
      const { data, error } = await supabase
        .from('job_descriptions')
        .select('*')
        .eq('id', jobId)
        .single()

      if (error) {
        console.error('Error fetching job description:', error)
        return null
      }

      return data as unknown as JobDescription
    } catch (error) {
      console.error('Error fetching job description:', error)
      return null
    }
  },

  // Update job description
  async updateJobDescription(
    jobId: string,
    updateData: Partial<CreateJobDescriptionData>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_descriptions')
        .update(updateData)
        .eq('id', jobId)

      if (error) {
        console.error('Error updating job description:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error updating job description:', error)
      return false
    }
  },

  // Delete job description
  async deleteJobDescription(jobId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_descriptions')
        .delete()
        .eq('id', jobId)

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

  // Toggle save status
  async toggleSaveStatus(jobId: string, isSaved: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('job_descriptions')
        .update({ is_saved: isSaved })
        .eq('id', jobId)

      if (error) {
        console.error('Error toggling save status:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error toggling save status:', error)
      return false
    }
  }
}
