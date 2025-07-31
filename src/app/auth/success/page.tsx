'use client'

import { AuthStateManager } from '@/lib/authStateManager'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function AuthSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/pitch-dashboard'

  useEffect(() => {
    // Broadcast success to all tabs
    AuthStateManager.broadcastAuthSuccess()
    
    // Redirect current tab after a short delay
    const timer = setTimeout(() => {
      router.push(redirect)
    }, 500)

    return () => clearTimeout(timer)
  }, [router, redirect])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Authentication Successful!</h1>
        <p className="text-gray-600">Redirecting you to the dashboard...</p>
      </div>
    </div>
  )
}

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900">Loading...</h1>
        </div>
      </div>
    }>
      <AuthSuccessContent />
    </Suspense>
  )
}
