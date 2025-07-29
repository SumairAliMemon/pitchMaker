'use client'

import { supabase } from '@/lib/supabase'
import { AuthStateManager } from '@/lib/authStateManager'
import { ArrowRight, Check, Mail, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  // Listen for auth success from other tabs
  useEffect(() => {
    const cleanup = AuthStateManager.onAuthSuccess(() => {
      // If user gets authenticated in another tab, redirect this tab too
      router.push('/dashboard')
    })

    return cleanup
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setMessage(error.message)
        setIsSuccess(false)
      } else {
        setMessage('Check your email for the magic link!')
        setIsSuccess(true)
      }
    } catch {
      setMessage('An unexpected error occurred')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome to Pitch Maker
          </h1>
          <p className="text-gray-600 mt-2">Sign in with magic link to create your perfect pitch</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending Magic Link...</span>
                </>
              ) : (
                <>
                  <span>Send Magic Link</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Success/Error Message */}
          {message && (
            <div className={`mt-6 p-4 rounded-2xl flex items-start space-x-3 ${
              isSuccess 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {isSuccess ? (
                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 bg-red-500 rounded-full flex-shrink-0 mt-0.5"></div>
              )}
              <p className={`text-sm font-medium ${
                isSuccess ? 'text-green-700' : 'text-red-700'
              }`}>
                {message}
              </p>
            </div>
          )}

          {/* Divider */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              New user? No problem! Just sign in with your email and we&apos;ll create your account automatically.
            </p>
          </div>
        </div>

        {/* Magic Link Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            We&apos;ll send you a secure link to sign in without a password
          </p>
        </div>
      </div>
    </div>
  )
}
