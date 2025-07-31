'use client'

import { UserProfile } from '@/lib/profileService'
import { signOut } from '@/lib/supabaseClient'
import { User } from '@supabase/supabase-js'
import { LogOut, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardHeaderProps {
  user: User
  userProfile: UserProfile | null
}

export default function DashboardHeader({ user, userProfile }: DashboardHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    const success = await signOut()
    if (success) {
      router.push('/login')
    }
  }

  return (
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
  )
}
