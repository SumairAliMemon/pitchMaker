'use client'

import { supabase } from '@/lib/supabase'
import { ArrowRight, Check, Mail, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AlternateLoginPage() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
        setIsSuccess(false)
      } else {
        setMessage('Check your email for the verification code!')
        setIsSuccess(true)
        setStep('otp')
      }
    } catch (error) {
      console.error('OTP send error:', error)
      setMessage('An unexpected error occurred')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      })

      if (error) {
        setMessage(`Error: ${error.message}`)
        setIsSuccess(false)
      } else if (data.session) {
        setMessage('Success! Redirecting...')
        setIsSuccess(true)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('OTP verify error:', error)
      setMessage('An unexpected error occurred')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Alternative Login
          </h1>
          <p className="text-gray-600 mt-2">
            {step === 'email' ? 'Enter your email to receive a verification code' : 'Enter the verification code from your email'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
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
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-2xl font-semibold transition-all duration-200"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </form>
          )}

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
        </div>
      </div>
    </div>
  )
}
