'use client'

import { PitchHistory, pitchHistoryService } from '@/lib/pitchHistoryService'
import { UserProfile } from '@/lib/profileService'
import { User } from '@supabase/supabase-js'
import { BookOpen, Briefcase, CheckCircle, Send } from 'lucide-react'
import { useState } from 'react'

interface PitchGeneratorProps {
  user: User
  userProfile: UserProfile | null
  onPitchGenerated: (pitch: string) => void
  onHistoryUpdate: (pitch: PitchHistory) => void
  onSaveJobModal: (jobDescription: string) => void
}

export default function PitchGenerator({ 
  user, 
  userProfile, 
  onPitchGenerated, 
  onHistoryUpdate, 
  onSaveJobModal 
}: PitchGeneratorProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

  const handleSubmit = async () => {
    const userDetails = userProfile?.background_details || ''
    
    if (!userDetails.trim() || !jobDescription.trim()) {
      alert('Please provide your details and job description')
      return
    }

    setAnalyzing(true)

    try {
      // Call the actual AI pitch generation API
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_description: jobDescription,
          job_title: 'Position', // Could be extracted from job description
          company_name: 'Company', // Could be extracted from job description
          use_saved_profile: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate pitch')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Display the generated pitch
      onPitchGenerated(data.generated_pitch)

      // Refresh pitch history
      const updatedHistory = await pitchHistoryService.getUserPitchHistory(user.id)
      if (updatedHistory.length > 0) {
        onHistoryUpdate(updatedHistory[0]) // Pass the latest pitch history entry
      }

    } catch (error) {
      console.error('Pitch generation failed:', error)
      onPitchGenerated('❌ Pitch generation failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (!userProfile?.background_details) {
    return null
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Your Pitch</h2>
      
      <div>
        <label htmlFor="job-description" className="block text-sm font-semibold text-gray-700 mb-3">
          Job Description
        </label>
        <div className="border-2 border-gray-200 rounded-2xl p-4">
          <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
          <textarea
            id="job-description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the complete job description here..."
            className="w-full h-32 p-0 border-0 focus:ring-0 text-gray-900 placeholder-gray-500 resize-none"
          />
          {jobDescription.trim() && (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Job description added</span>
              </div>
              <button
                onClick={() => onSaveJobModal(jobDescription)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
              >
                <BookOpen className="w-3 h-3" />
                <span>Save for Later</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleSubmit}
          disabled={!jobDescription.trim() || analyzing}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg mx-auto"
        >
          {analyzing ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Creating Your Pitch...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Generate Pitch</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
