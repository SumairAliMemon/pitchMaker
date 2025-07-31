'use client'

import { pitchService } from '@/lib/pitchService'
import { profileService, UserProfile } from '@/lib/profileService'
import { createBrowserClient } from '@supabase/ssr'
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
  const router = useRouter()

  // Create Supabase client for browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const initializeData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Load user profile and check if it's complete
        const profile = await profileService.getProfile(session.user.id)
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
  }, [router, supabase.auth])

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
      // Simulate AI pitch generation (replace with actual AI service)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Mock pitch results
      const mockPitch = `
**Your Personalized Pitch:**

Dear Hiring Manager,

I am excited to apply for this position as it perfectly aligns with my background and career aspirations. Based on the job requirements, I believe I would be an excellent fit for your team.

**Why I'm the Right Candidate:**

✨ **Relevant Experience**: My background demonstrates strong alignment with your key requirements, particularly in the areas you've prioritized.

🚀 **Technical Skills**: I bring hands-on experience with the technologies and methodologies mentioned in your job description.

💡 **Problem-Solving Approach**: My experience has equipped me with the analytical thinking and creative problem-solving skills essential for this role.

🤝 **Team Collaboration**: I thrive in collaborative environments and am committed to contributing positively to team dynamics and project success.

**What I Can Contribute:**
- Immediate impact through my relevant skill set
- Fresh perspectives combined with proven experience
- Strong commitment to continuous learning and growth
- Enthusiasm for tackling the challenges outlined in your job description

I would welcome the opportunity to discuss how my background and passion align with your team's needs. Thank you for considering my application.

Best regards,
${userProfile?.full_name || 'Your Name'}

---
*This pitch has been tailored specifically for the role based on your saved profile and the job requirements.*
      `
      
      setResults(mockPitch)

      // Save to pitches table (history will be created automatically via trigger)
      const savedPitch = await pitchService.createPitch(
        user.id,
        {
          job_description: jobDescription,
          job_title: 'Position', // You could extract this from job description
          company_name: 'Company' // You could extract this from job description
        },
        mockPitch
      )

      if (savedPitch) {
        console.log('Pitch saved successfully')
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
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-orange-800 mb-2">
                Complete Your Profile First
              </h3>
              <p className="text-orange-700 mb-4">
                To generate personalized pitches, you need to complete your profile with your background, skills, and experience.
              </p>
              <button
                onClick={() => router.push('/pitch-dashboard/profile')}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors duration-200"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Description Section */}
      {!profileIncomplete && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Generate Your Pitch</h2>
          </div>
          
          <div>
            <label htmlFor="job-description" className="block text-sm font-semibold text-gray-700 mb-3">
              Job Description
            </label>
            <div className="border-2 border-gray-200 rounded-xl p-4">
              <Briefcase className="w-8 h-8 text-gray-400 mb-3" />
              <textarea
                id="job-description"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                className="w-full h-40 p-0 border-0 focus:ring-0 text-gray-900 placeholder-gray-500 resize-none"
                suppressHydrationWarning
              />
              {jobDescription.trim() && (
                <div className="mt-3 flex items-center space-x-2 text-green-600">
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
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg mx-auto"
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
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span>Your Generated Pitch</span>
          </h2>
          
          <div className="prose max-w-none">
            <div className="bg-gray-50 rounded-xl p-6">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                {results}
              </pre>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Pro Tip
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Copy this pitch and customize it further. Check your pitch history to view and manage all your generated pitches.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
