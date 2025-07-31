'use client'

import { useEffect, useState } from 'react'

export default function DebugUrls() {
  const [currentOrigin, setCurrentOrigin] = useState('')
  const productionOrigin = 'https://pitch-maker.vercel.app'

  useEffect(() => {
    setCurrentOrigin(window.location.origin)
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Supabase Configuration Debug</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Environment URLs</h2>
          <div className="space-y-2">
            <div>
              <strong>Current Origin:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{currentOrigin}</code>
            </div>
            <div>
              <strong>Production Origin:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{productionOrigin}</code>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Supabase Configuration Required</h2>
          <p className="mb-4 text-yellow-700">
            Go to your Supabase Dashboard → Authentication → URL Configuration and set these EXACT values:
          </p>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-yellow-800">Site URL:</h3>
              <code className="block bg-yellow-100 p-2 rounded text-sm">
                {productionOrigin}
              </code>
            </div>
            
            <div>
              <h3 className="font-semibold text-yellow-800">Redirect URLs (add both):</h3>
              <div className="space-y-1">
                <code className="block bg-yellow-100 p-2 rounded text-sm">
                  http://localhost:3000/auth/callback
                </code>
                <code className="block bg-yellow-100 p-2 rounded text-sm">
                  {productionOrigin}/auth/callback
                </code>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">🔍 Testing Steps</h2>
          <ol className="list-decimal list-inside space-y-2 text-blue-700">
            <li>Configure Supabase URLs above</li>
            <li>Go to <a href="/login" className="underline text-blue-600">/login</a></li>
            <li>Enter your email and send magic link</li>
            <li>Check your email and click the magic link</li>
            <li>Should redirect to /pitch-dashboard with authentication</li>
          </ol>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-red-800">❌ Don&apos;t Do This</h2>
          <ul className="list-disc list-inside space-y-2 text-red-700">
            <li>Don&apos;t manually visit /auth/callback</li>
            <li>Don&apos;t type the callback URL in browser</li>
            <li>The callback URL only works when accessed via magic link</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a 
            href="/login" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login Page
          </a>
        </div>
      </div>
    </div>
  )
}
