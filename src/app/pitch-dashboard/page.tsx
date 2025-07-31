'use client'

import DashboardHeader from '@/components/DashboardHeader'
import HistorySection from '@/components/HistorySection'
import PitchGenerator from '@/components/PitchGenerator'
import PitchModal from '@/components/PitchModal'
import PitchResults from '@/components/PitchResults'
import ProfileSection from '@/components/ProfileSection'
import SaveJobModal from '@/components/SaveJobModal'
import { PitchHistory, pitchHistoryService } from '@/lib/pitchHistoryService'
import { profileService, UserProfile } from '@/lib/profileService'
import { getSupabaseClient, getCurrentUser } from '@/lib/supabaseClient'
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [results, setResults] = useState<string | null>(null)
  const [pitchHistory, setPitchHistory] = useState<PitchHistory[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const [selectedPitch, setSelectedPitch] = useState<PitchHistory | null>(null)
  const [showSaveJobModal, setShowSaveJobModal] = useState(false)
  const [jobDescriptionForSave, setJobDescriptionForSave] = useState('')
  const router = useRouter()

  useEffect(() => {
    const initializeData = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        console.log('Loading profile for user:', currentUser.id)
        
        // Load user profile
        const profile = await profileService.getProfile(currentUser.id)
        console.log('Loaded profile:', profile)
        setUserProfile(profile)
        
        // If no profile exists, create one
        if (!profile) {
          console.log('No profile found, creating new profile...')
          const newProfile = await profileService.upsertProfile({
            id: currentUser.id,
            email: currentUser.email || '',
            full_name: currentUser.user_metadata?.full_name || '',
            background_details: '',
            skills: '',
            experience: '',
            education: ''
          })
          console.log('Created new profile:', newProfile)
          setUserProfile(newProfile)
        }

        // Load pitch history
        const history = await pitchHistoryService.getUserPitches(currentUser.id)
        setPitchHistory(history)
      } else {
        router.push('/login')
      }
      
      setLoading(false)
    }

    initializeData()

    // Listen for auth changes
    const supabase = getSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        if (!session?.user && event === 'SIGNED_OUT') {
          router.push('/login')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handlePitchGenerated = (pitch: string) => {
    setResults(pitch)
  }

  const handleHistoryUpdate = (newPitch: PitchHistory) => {
    setPitchHistory(prev => [newPitch, ...prev])
  }

  const handleHistoryDelete = (updatedHistory: PitchHistory[]) => {
    setPitchHistory(updatedHistory)
  }

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile)
  }

  const handleSaveJobComplete = () => {
    // Job description saved successfully
    console.log('Job description saved')
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
        <DashboardHeader user={user} userProfile={userProfile} />
        
        <HistorySection
          pitchHistory={pitchHistory}
          showHistory={showHistory}
          onToggleHistory={() => setShowHistory(!showHistory)}
          onSelectPitch={setSelectedPitch}
          onHistoryUpdate={handleHistoryDelete}
        />

        <ProfileSection
          user={user}
          userProfile={userProfile}
          onProfileUpdate={handleProfileUpdate}
        />

        <PitchGenerator
          user={user}
          userProfile={userProfile}
          onPitchGenerated={handlePitchGenerated}
          onHistoryUpdate={handleHistoryUpdate}
          onSaveJobModal={(jobDescription) => {
            setJobDescriptionForSave(jobDescription)
            setShowSaveJobModal(true)
          }}
        />

        <PitchResults results={results} />
      </div>

      <PitchModal
        pitch={selectedPitch}
        onClose={() => setSelectedPitch(null)}
      />

      <SaveJobModal
        isOpen={showSaveJobModal}
        jobDescription="" // This needs to be passed from PitchGenerator
        userId={user.id}
        onClose={() => setShowSaveJobModal(false)}
        onSaved={handleSaveJobComplete}
      />
    </div>
  )
}
