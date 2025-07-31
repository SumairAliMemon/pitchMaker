'use client'

import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function AuthTest() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  const testMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`
      console.log('🔗 Sending magic link with redirect:', redirectUrl)
      
      const { data, error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: true,
        },
      })

      console.log('📧 Magic link response:', { data, error })
      
      if (error) {
        setMessage(`❌ Error: ${error.message}`)
        setDebugInfo(JSON.stringify(error, null, 2))
      } else {
        setMessage(`✅ Magic link sent! Check your email and CLICK the link (don't type the URL manually)`)
        setDebugInfo(JSON.stringify(data, null, 2))
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setMessage('❌ Unexpected error occurred')
      setDebugInfo(JSON.stringify(error, null, 2))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold mb-6">🧪 Magic Link Test</h1>
          
          <form onSubmit={testMagicLink} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⏳ Sending...' : '🚀 Send Magic Link'}
            </button>
          </form>

          {message && (
            <div className={`mt-4 p-4 rounded-lg ${message.includes('❌') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
              {message}
            </div>
          )}

          {debugInfo && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-2">Debug Info:</h3>
              <pre className="text-xs overflow-auto">
                {debugInfo}
              </pre>
            </div>
          )}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Important Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-yellow-700 text-sm">
              <li>Click &quot;Send Magic Link&quot; above</li>
              <li>Check your email inbox</li>
              <li>Click the magic link in the email (don&apos;t copy/paste the URL)</li>
              <li>The link should redirect you to /pitch-dashboard</li>
              <li>If you get &quot;no_code&quot; error, your Supabase URLs are wrong</li>
            </ol>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">🔧 Supabase Settings Check:</h3>
            <p className="text-blue-700 text-sm mb-2">
              Go to Supabase Dashboard → Authentication → URL Configuration:
            </p>
            <div className="space-y-1 text-sm">
              <div>
                <strong>Site URL:</strong> <code className="bg-blue-100 px-1 rounded">https://pitch-maker.vercel.app</code>
              </div>
              <div>
                <strong>Redirect URLs:</strong>
                <br />
                <code className="bg-blue-100 px-1 rounded">http://localhost:3000/auth/callback</code>
                <br />
                <code className="bg-blue-100 px-1 rounded">https://pitch-maker.vercel.app/auth/callback</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
