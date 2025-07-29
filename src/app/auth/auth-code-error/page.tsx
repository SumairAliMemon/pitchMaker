'use client'

import { AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const details = searchParams.get('details')

  let parsedDetails = null
  if (details) {
    try {
      parsedDetails = JSON.parse(details)
    } catch {
      // Ignore parsing errors
    }
  }

  return (
    <div className="max-w-md w-full">
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Authentication Error
        </h1>
        
        <p className="text-gray-600 mb-4">
          Sorry, there was an issue with your authentication link. This could happen if the link has expired or has already been used.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 text-left">
            <p className="text-sm text-red-700 mb-2">
              <strong>Error:</strong> {error}
            </p>
            {parsedDetails && (
              <div className="text-xs text-red-600">
                <p><strong>Status:</strong> {parsedDetails.status}</p>
                <p><strong>Code:</strong> {parsedDetails.code}</p>
              </div>
            )}
          </div>
        )}

        {/* Troubleshooting section */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-left">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Common solutions:</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Make sure you&apos;re clicking the link in the same browser</li>
            <li>• Check if the link has expired (links expire after 1 hour)</li>
            <li>• Request a new magic link if the current one doesn&apos;t work</li>
            <li>• Clear your browser cache and cookies</li>
          </ul>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/login"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Try Again</span>
          </Link>
          
          <p className="text-sm text-gray-500">
            Request a new magic link to continue
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
            <p className="text-gray-600 mb-8">Loading...</p>
          </div>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
}
