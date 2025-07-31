'use client'

import { PitchHistory, pitchHistoryService } from '@/lib/pitchHistoryService'
import { pitchService } from '@/lib/pitchService'
import { profileService, UserProfile } from '@/lib/profileService'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { AlertCircle, Briefcase, CheckCircle, Clock, Copy, Edit, History, LogOut, Save, Send, Sparkles, Trash2, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProfile, setEditingProfile] = useState(false)
  const [userDetails, setUserDetails] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [results, setResults] = useState<string | null>(null)
  const [pitchHistory, setPitchHistory] = useState<PitchHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedPitch, setSelectedPitch] = useState<PitchHistory | null>(null)
  const router = useRouter()

  // Create Supabase client for browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Get initial session and load profile
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Load user profile
        const profile = await profileService.getProfile(session.user.id)
        setUserProfile(profile)
        
        // If profile exists, set user details
        if (profile?.background_details) {
          setUserDetails(profile.background_details)
        }
        
        // If no profile exists, create one
        if (!profile) {
          const newProfile = await profileService.upsertProfile({
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || '',
            background_details: '',
            skills: '',
            experience: '',
            education: ''
          })
          setUserProfile(newProfile)
          setEditingProfile(true) // Show profile editor for new users
        }

        // Load pitch history
        const history = await pitchHistoryService.getUserPitchHistory(session.user.id)
        setPitchHistory(history)
      } else {
        router.push('/login')
      }
      
      setLoading(false)
    }

    getUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user && event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      router.push('/login')
    }
  }

  const handleSaveProfile = async () => {
    if (!user || !userProfile) return

    const updatedProfile = await profileService.updateProfile(user.id, {
      background_details: userDetails
    })

    if (updatedProfile) {
      setUserProfile(updatedProfile)
      setEditingProfile(false)
    }
  }

  const handleSubmit = async () => {
    if (!userDetails.trim() || !jobDescription.trim()) {
      alert('Please provide your details and job description')
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
          job_title: 'Position', // You could extract this from job description or ask user
          company_name: 'Company' // You could extract this from job description or ask user
        },
        mockPitch
      )

      if (savedPitch) {
        // Refresh pitch history to show the new entry
        const updatedHistory = await pitchHistoryService.getUserPitchHistory(user.id)
        setPitchHistory(updatedHistory)
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
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Welcome back, {userProfile?.full_name || user.email?.split('@')[0]}!
                </h1>
                <p className="text-gray-600">
                  {userProfile?.background_details ? 'Create a new pitch for your next opportunity' : 'Complete your profile to get started'}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {/* History Toggle */}
        {pitchHistory.length > 0 && (
          <div className="mb-6">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors duration-200"
            >
              <History className="w-4 h-4" />
              <span>
                {showHistory ? 'Hide' : 'Show'} Previous Pitches ({pitchHistory.length})
              </span>
            </button>
          </div>
        )}

        {/* Pitch History Section */}
        {showHistory && pitchHistory.length > 0 && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Pitch History</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {pitchHistory.map((pitch) => (
                <div key={pitch.id} className="border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          {new Date(pitch.created_at).toLocaleDateString()} at{' '}
                          {new Date(pitch.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {pitch.job_description.substring(0, 200)}...
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedPitch(pitch)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          View Full Pitch
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(pitch.generated_pitch)}
                          className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        if (await pitchHistoryService.deletePitchHistory(pitch.id)) {
                          setPitchHistory(prev => prev.filter(p => p.id !== pitch.id))
                        }
                      }}
                      className="text-red-400 hover:text-red-600 ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Your Profile</h2>
            <button
              onClick={() => setEditingProfile(!editingProfile)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
              <span className="text-sm font-medium">
                {editingProfile ? 'Cancel' : 'Edit Profile'}
              </span>
            </button>
          </div>

          {editingProfile ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="user-details" className="block text-sm font-semibold text-gray-700 mb-3">
                  Your Background, Skills & Experience
                </label>
                <div className="border-2 border-gray-200 rounded-2xl p-4">
                  <UserIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <textarea
                    id="user-details"
                    value={userDetails}
                    onChange={(e) => setUserDetails(e.target.value)}
                    placeholder="Share your background, skills, experience, education, and any relevant details that make you a great candidate..."
                    className="w-full h-32 p-0 border-0 focus:ring-0 text-gray-900 placeholder-gray-500 resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-medium">Save Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl p-6">
              {userDetails ? (
                <p className="text-gray-700 whitespace-pre-wrap">{userDetails}</p>
              ) : (
                <p className="text-gray-500 italic">No profile information added yet. Click &ldquo;Edit Profile&rdquo; to get started.</p>
              )}
            </div>
          )}
        </div>

        {/* Job Description Section */}
        {userProfile?.background_details && (
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
                  <div className="mt-2 flex items-center space-x-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Job description added</span>
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
        )}

        {/* Results Section */}
        {results && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span>Your Generated Pitch</span>
            </h2>
            
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-2xl p-6">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                  {results}
                </pre>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Pro Tip
                  </p>
                  <p className="text-sm text-blue-700 mt-1">
                    Copy this pitch and customize it further based on your personal style and the specific company culture.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Pitch Modal */}
      {selectedPitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Generated Pitch</h2>
                <button
                  onClick={() => setSelectedPitch(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Created:</h3>
                  <p className="text-gray-600">
                    {new Date(selectedPitch.created_at).toLocaleDateString()} at{' '}
                    {new Date(selectedPitch.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {selectedPitch.job_description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Pitch:</h3>
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                      {selectedPitch.generated_pitch}
                    </pre>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => navigator.clipboard.writeText(selectedPitch.generated_pitch)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Pitch</span>
                  </button>
                  <button
                    onClick={() => setSelectedPitch(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
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
