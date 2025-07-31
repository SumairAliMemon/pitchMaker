'use client'

import { profileService, UserProfile } from '@/lib/profileService'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { CheckCircle, Edit, Save, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    background_details: '',
    skills: '',
    experience: '',
    education: ''
  })
  const router = useRouter()

  useEffect(() => {
    const initializeData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Load user profile
        const profile = await profileService.getProfile(session.user.id)
        setUserProfile(profile)
        
        // If no profile exists, create one and enable editing
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
          setEditing(true)
        }
        
        // Set form data
        if (profile) {
          setFormData({
            full_name: profile.full_name || '',
            background_details: profile.background_details || '',
            skills: profile.skills || '',
            experience: profile.experience || '',
            education: profile.education || ''
          })
        }
      } else {
        router.push('/login')
      }
      
      setLoading(false)
    }

    initializeData()
  }, [router])

  const handleSave = async () => {
    if (!user) return

    setSaving(true)

    try {
      const updatedProfile = await profileService.updateProfile(user.id, formData)
      
      if (updatedProfile) {
        setUserProfile(updatedProfile)
        setEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (userProfile) {
      setFormData({
        full_name: userProfile.full_name || '',
        background_details: userProfile.background_details || '',
        skills: userProfile.skills || '',
        experience: userProfile.experience || '',
        education: userProfile.education || ''
      })
    }
    setEditing(false)
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
      {/* Profile Header */}
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Your Profile</h2>
              <p className="text-gray-300 text-sm sm:text-base">Manage your personal information and background</p>
            </div>
          </div>
          <button
            onClick={() => editing ? handleCancel() : setEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-900/50 hover:bg-blue-800/50 text-blue-300 rounded-xl transition-colors duration-200 text-sm"
          >
            <Edit className="w-4 h-4" />
            <span className="font-medium">
              {editing ? 'Cancel' : 'Edit Profile'}
            </span>
          </button>
        </div>

        {/* Profile Form */}
        <div className="space-y-6">
          {/* Full Name */}
          <div>
            <label htmlFor="full_name" className="block text-sm font-semibold text-gray-300 mb-3">
              Full Name
            </label>
            {editing ? (
              <input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-900 text-gray-100 placeholder-gray-400"
                suppressHydrationWarning
              />
            ) : (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                <p className="text-gray-200">{userProfile?.full_name || 'Not provided'}</p>
              </div>
            )}
          </div>

          {/* Background Details */}
          <div>
            <label htmlFor="background_details" className="block text-sm font-semibold text-gray-300 mb-3">
              Background Details
            </label>
            {editing ? (
              <textarea
                id="background_details"
                value={formData.background_details}
                onChange={(e) => setFormData(prev => ({ ...prev, background_details: e.target.value }))}
                placeholder="Share your background, key achievements, and what makes you unique..."
                className="w-full h-32 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-900 text-gray-100 placeholder-gray-400"
                suppressHydrationWarning
              />
            ) : (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {userProfile?.background_details || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <label htmlFor="skills" className="block text-sm font-semibold text-gray-300 mb-3">
              Skills
            </label>
            {editing ? (
              <textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="List your technical skills, programming languages, tools, etc..."
                className="w-full h-24 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-900 text-gray-100 placeholder-gray-400"
                suppressHydrationWarning
              />
            ) : (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {userProfile?.skills || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          {/* Experience */}
          <div>
            <label htmlFor="experience" className="block text-sm font-semibold text-gray-300 mb-3">
              Experience
            </label>
            {editing ? (
              <textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                placeholder="Describe your work experience, projects, and accomplishments..."
                className="w-full h-32 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-900 text-gray-100 placeholder-gray-400"
                suppressHydrationWarning
              />
            ) : (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {userProfile?.experience || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          {/* Education */}
          <div>
            <label htmlFor="education" className="block text-sm font-semibold text-gray-300 mb-3">
              Education
            </label>
            {editing ? (
              <textarea
                id="education"
                value={formData.education}
                onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value }))}
                placeholder="Your educational background, degrees, certifications..."
                className="w-full h-24 px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-900 text-gray-100 placeholder-gray-400"
                suppressHydrationWarning
              />
            ) : (
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-600">
                <p className="text-gray-200 whitespace-pre-wrap">
                  {userProfile?.education || 'Not provided'}
                </p>
              </div>
            )}
          </div>

          {/* Save Button */}
          {editing && (
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4">
              <button
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-xl transition-colors duration-200 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center space-x-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors duration-200 disabled:opacity-50 text-sm sm:text-base"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion Status */}
      {userProfile && (
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Profile Completion</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${userProfile.full_name ? 'text-green-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${userProfile.full_name ? 'text-green-300' : 'text-gray-400'}`}>
                Full Name
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${userProfile.background_details ? 'text-green-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${userProfile.background_details ? 'text-green-300' : 'text-gray-400'}`}>
                Background Details
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${userProfile.skills ? 'text-green-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${userProfile.skills ? 'text-green-300' : 'text-gray-400'}`}>
                Skills
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${userProfile.experience ? 'text-green-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${userProfile.experience ? 'text-green-300' : 'text-gray-400'}`}>
                Experience
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className={`w-5 h-5 ${userProfile.education ? 'text-green-400' : 'text-gray-500'}`} />
              <span className={`text-sm ${userProfile.education ? 'text-green-300' : 'text-gray-400'}`}>
                Education
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
