'use client'

import { supabase } from "@/lib/supabase";
import { ArrowRight, CheckCircle, Sparkles, Upload } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Add client-side auth state management for cross-tab communication
function AuthStateListener() {
  if (typeof window !== 'undefined') {
    import('@/lib/authStateManager').then(({ AuthStateManager }) => {
      AuthStateManager.onAuthSuccess(() => {
        window.location.href = '/pitch-dashboard'
      })
    })
  }
  return null
}

export default function Home() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          console.log('✅ User is authenticated, redirecting to dashboard...')
          setIsAuthenticated(true)
          router.push('/pitch-dashboard')
          return
        }

        console.log('ℹ️ User not authenticated, showing landing page')
        setIsLoading(false)
      } catch (error) {
        console.error('Error checking auth:', error)
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Show loading spinner while checking authentication
  if (isLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {isAuthenticated ? 'Redirecting to Dashboard...' : 'Loading...'}
          </h2>
          <p className="text-gray-500">Please wait</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100">
      <AuthStateListener />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
            AI-Powered Pitch Maker
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Share your details and job description - get a compelling, personalized pitch that makes you stand out.
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Share Your Details</h3>
            <p className="text-gray-600">
              Provide your background, skills, and experience along with the job description.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Pitch Generation</h3>
            <p className="text-gray-600">
              Get a compelling, personalized pitch crafted by advanced AI technology.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Perfect Pitch</h3>
            <p className="text-gray-600">
              Receive a tailored pitch that highlights your strengths for the specific role.
            </p>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign In</h3>
              <p className="text-gray-600">Create your account with secure magic link authentication</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Share Details</h3>
              <p className="text-gray-600">Provide your background, skills, and the job description you&apos;re targeting</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Get Your Pitch</h3>
              <p className="text-gray-600">Receive a compelling, personalized pitch for your target role</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to create your perfect pitch?
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Get started with AI-powered pitch generation in just a few clicks.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/login"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Built with Next.js, Tailwind CSS, and Supabase
          </p>
        </footer>
      </div>
    </div>
  );
}
