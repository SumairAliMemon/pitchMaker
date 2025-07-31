'use client'

import { profileService, UserProfile } from '@/lib/profileService'
import { User } from '@supabase/supabase-js'
import { Edit, Save, User as UserIcon } from 'lucide-react'
import { useState } from 'react'

interface ProfileSectionProps {
  user: User
  userProfile: UserProfile | null
  onProfileUpdate: (profile: UserProfile) => void
}

export default function ProfileSection({ user, userProfile, onProfileUpdate }: ProfileSectionProps) {
  const [editingProfile, setEditingProfile] = useState(false)
  const [userDetails, setUserDetails] = useState(userProfile?.background_details || '')

  const handleSaveProfile = async () => {
    if (!user || !userDetails.trim()) {
      alert('Please enter your profile details')
      return
    }

    try {
      let updatedProfile

      if (userProfile) {
        updatedProfile = await profileService.updateProfile(user.id, {
          background_details: userDetails
        })
      } else {
        updatedProfile = await profileService.upsertProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          background_details: userDetails,
          skills: '',
          experience: '',
          education: ''
        })
      }

      if (updatedProfile) {
        onProfileUpdate(updatedProfile)
        setEditingProfile(false)
        alert('Profile saved successfully!')
      } else {
        alert('Failed to save profile. Please check the console for errors.')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Failed to save profile. Please try again.')
    }
  }

  return (
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
  )
}
