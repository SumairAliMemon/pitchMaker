'use client'

import { jobDescriptionService } from '@/lib/jobDescriptionService'
import { pitchService } from '@/lib/pitchService'
import { profileService, UserProfile } from '@/lib/profileService'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { AlertCircle, Briefcase, CheckCircle, Send, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [profileIncomplete, setProfileIncomplete] = useState(false)
  const [showFullPitch, setShowFullPitch] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const initializeData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Load user profile and create one if it doesn't exist
        let profile = await profileService.getProfile(session.user.id)
        
        // If no profile exists, create one automatically
        if (!profile) {
          profile = await profileService.upsertProfile({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            background_details: '',
            skills: '',
            experience: '',
            education: ''
          })
        }
        
        setUserProfile(profile)
        
        // Check if profile is incomplete (no background details)
        if (!profile || !profile.background_details?.trim()) {
          setProfileIncomplete(true)
        }
      } else {
        router.push('/login')
      }
      
      setLoading(false)
    }

    initializeData()
  }, [router])

  const extractCompanyAndTitle = (jobDesc: string) => {
    // Simple extraction - you could enhance this with better parsing
    const lines = jobDesc.split('\n').filter(line => line.trim())
    
    // Try to find company name (look for common patterns)
    let companyName = 'the Company'
    let jobTitle = 'this Position'
    
    for (const line of lines) {
      // Look for company patterns
      if (line.toLowerCase().includes('company:') || line.toLowerCase().includes('organization:')) {
        companyName = line.split(':')[1]?.trim() || companyName
        break
      }
      // Look for @company or Company Name patterns
      const companyMatch = line.match(/(?:at|@)\s+([A-Z][a-zA-Z\s&.,-]+(?:Inc|LLC|Corp|Ltd|Co)?)/i)
      if (companyMatch) {
        companyName = companyMatch[1].trim()
        break
      }
    }
    
    // Look for job title (usually in first few lines)
    for (const line of lines.slice(0, 5)) {
      if (line.toLowerCase().includes('position:') || line.toLowerCase().includes('role:') || line.toLowerCase().includes('title:')) {
        jobTitle = line.split(':')[1]?.trim() || jobTitle
        break
      }
      // If line looks like a job title (contains common job words)
      if (line.match(/(?:engineer|developer|manager|analyst|designer|specialist|coordinator|director|lead|senior|junior)/i) && line.length < 100) {
        jobTitle = line.trim()
        break
      }
    }
    
    return { companyName, jobTitle }
  }

  const copyToClipboard = async (text: string) => {
    try {
      // Clean the text by removing markdown formatting
      const cleanText = text
        .replace(/\*\*/g, '') // Remove bold markdown
        .replace(/\*/g, '')   // Remove italic markdown
        .replace(/^---.*$/gm, '') // Remove separator lines
        .trim()
      
      await navigator.clipboard.writeText(cleanText)
      alert('✅ Pitch copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy: ', err)
      // Fallback: create a text area and copy
      const textArea = document.createElement('textarea')
      textArea.value = text.replace(/\*\*/g, '').replace(/\*/g, '')
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('✅ Pitch copied to clipboard!')
    }
  }

  const handleSubmit = async () => {
    if (!userProfile || !userProfile.background_details?.trim()) {
      setProfileIncomplete(true)
      return
    }

    if (!jobDescription.trim()) {
      alert('Please provide a job description')
      return
    }

    if (!user) return

    setAnalyzing(true)
    setResults(null)

    try {
      // Extract company name and job title from job description
      const { companyName, jobTitle } = extractCompanyAndTitle(jobDescription)
      
      // First, save the job description to database
      const savedJobDescription = await jobDescriptionService.createJobDescription(
        user.id,
        {
          title: jobTitle,
          company_name: companyName,
          description: jobDescription
        }
      )

      // Generate pitch using API endpoint
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          jobDescription,
          jobTitle,
          companyName
        }),
      })

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`)
      }

      const data = await response.json()
      const generatedPitch = data.pitch

      setResults(generatedPitch)

      // Save pitch to database with job_description_id reference
      const savedPitch = await pitchService.createPitch(
        user.id,
        {
          job_description_id: savedJobDescription?.id,
          job_description: jobDescription,
          job_title: jobTitle,
          company_name: companyName
        },
        generatedPitch
      )

      if (savedPitch) {
        console.log('Pitch saved successfully to history')
      } else {
        console.warn('Failed to save pitch to history')
      }
    } catch (error) {
      console.error('Pitch generation failed:', error)
      setResults('❌ Pitch generation failed. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Incomplete Warning */}
      {profileIncomplete && (
        <div className="bg-amber-900/50 border border-amber-700 rounded-2xl p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-2">
                Complete Your Profile First
              </h3>
              <p className="text-amber-200 mb-4 text-sm sm:text-base">
                To generate personalized pitches, you need to complete your profile with your background, skills, and experience.
              </p>
              <button
                onClick={() => router.push('/pitch-dashboard/profile')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Description Section */}
      {!profileIncomplete && (
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6 lg:p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">Generate Your Pitch</h2>
          </div>
          
          <div>
            <label htmlFor="job-description" className="block text-sm font-semibold text-gray-300 mb-3">
              Job Description
            </label>
            <div className="border-2 border-gray-600 rounded-xl p-4 bg-gray-900">
              <Briefcase className="w-8 h-8 text-gray-400 mb-3" />
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full h-40 p-0 border-0 focus:ring-0 text-gray-100 placeholder-gray-400 resize-none bg-transparent"
                suppressHydrationWarning
              />
              {jobDescription.trim() && (
                <div className="mt-3 flex items-center space-x-2 text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Job description added ({jobDescription.length} characters)</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 text-center">
            <button
              onClick={handleSubmit}
              disabled={!jobDescription.trim() || analyzing || profileIncomplete}
              className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg mx-auto text-sm sm:text-base"
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
      )}

      {/* Results Section */}
      {results && (
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6 lg:p-8">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span>Your Generated Pitch</span>
          </h2>
          
          <div className="prose max-w-none">
            <div className="bg-gray-900 rounded-xl p-4 sm:p-6 border border-gray-600">
              <pre className="whitespace-pre-wrap text-sm text-gray-200 font-sans">
                {results}
              </pre>
            </div>
          </div>

          {/* Copy and View Full Buttons */}
          <div className="mt-4 flex justify-center space-x-3">
            <button
              onClick={() => copyToClipboard(results)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy Pitch</span>
            </button>
            <button
              onClick={() => setShowFullPitch(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl font-semibold transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>View Full</span>
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-900/50 rounded-xl border border-blue-700">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-300">
                  Pro Tip
                </p>
                <p className="text-sm text-blue-200 mt-1">
                  Copy this pitch and customize it further. Check your pitch history to view and manage all your generated pitches.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Pitch Overlay Modal */}
      {showFullPitch && results && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  <span>Your Generated Pitch</span>
                </h2>
                <button
                  onClick={() => setShowFullPitch(false)}
                  className="text-gray-400 hover:text-white text-2xl transition-colors"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-600">
                  <pre className="whitespace-pre-wrap text-gray-200 font-sans leading-relaxed">
                    {results}
                  </pre>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => copyToClipboard(results)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span>Copy to Clipboard</span>
                  </button>
                  <button
                    onClick={() => router.push('/pitch-dashboard/history')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>View History</span>
                  </button>
                  <button
                    onClick={() => setShowFullPitch(false)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
