'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AuthCallback() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check URL fragment for tokens (implicit flow)
        const fragment = window.location.hash.substring(1)
        const params = new URLSearchParams(fragment)
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        
        console.log('🔍 Checking URL fragment:', fragment)
        console.log('Tokens found:', { accessToken: !!accessToken, refreshToken: !!refreshToken })

        if (accessToken && refreshToken) {
          console.log('🔄 Setting session from URL fragment tokens')
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('❌ Session set error:', error)
            router.push(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data?.session) {
            console.log('✅ Session set successfully!')
            router.push('/dashboard')
            return
          }
        }

        // Check URL query params for code (PKCE flow)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          console.log('🔄 Found authorization code, exchanging for session')
          
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.error('❌ Code exchange error:', error)
            router.push(`/auth/auth-code-error?error=${encodeURIComponent(error.message)}`)
            return
          }

          if (data?.session) {
            console.log('✅ Code exchange successful!')
            router.push('/dashboard')
            return
          }
        }

        // No tokens or code found
        console.log('❌ No authentication tokens or code found')
        router.push('/auth/auth-code-error?error=no_tokens_or_code')
        
      } catch (error) {
        console.error('❌ Unexpected error in auth callback:', error)
        router.push(`/auth/auth-code-error?error=${encodeURIComponent('unexpected_error')}`)
      }
    }

    handleAuthCallback()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Completing Sign In...</h2>
        <p className="text-gray-500">Please wait while we log you in</p>
      </div>
    </div>
  )
}
