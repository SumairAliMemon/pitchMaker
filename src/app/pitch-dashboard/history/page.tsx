'use client'

import { PitchHistory, pitchHistoryService } from '@/lib/pitchHistoryService'
import { createBrowserClient } from '@supabase/ssr'
import { User } from '@supabase/supabase-js'
import { Calendar, Clock, Copy, Eye, FileText, Search, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'

export default function PitchHistoryPage() {
  const [user, setUser] = useState<User | null>(null)
  const [pitchHistory, setPitchHistory] = useState<PitchHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPitch, setSelectedPitch] = useState<PitchHistory | null>(null)
  const router = useRouter()

  // Create Supabase client for browser
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Load pitch history
        const history = await pitchHistoryService.getUserPitchHistory(session.user.id)
        setPitchHistory(history)
      } else {
        router.push('/login')
      }
      
      setLoading(false)
    }

    getUser()
  }, [router, supabase.auth])

  const handleDeletePitch = async (pitchId: string) => {
    if (confirm('Are you sure you want to delete this pitch? This action cannot be undone.')) {
      const success = await pitchHistoryService.deletePitchHistory(pitchId)
      if (success) {
        setPitchHistory(prev => prev.filter(p => p.id !== pitchId))
        if (selectedPitch?.id === pitchId) {
          setSelectedPitch(null)
        }
      }
    }
  }

  const handleCopyPitch = (pitch: string) => {
    navigator.clipboard.writeText(pitch)
    // You could add a toast notification here
  }

  const filteredHistory = pitchHistory.filter(pitch =>
    pitch.job_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pitch.generated_pitch.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Pitch History</h2>
              <p className="text-gray-600">
                View and manage all your generated pitches ({pitchHistory.length} total)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search job descriptions or pitches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Pitch History Grid */}
      {filteredHistory.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredHistory.map((pitch) => (
            <div key={pitch.id} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {new Date(pitch.created_at).toLocaleDateString()}
                  </span>
                </div>
                <button
                  onClick={() => handleDeletePitch(pitch.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description:</h3>
                <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                  {pitch.job_description}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Pitch Preview:</h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {pitch.generated_pitch.substring(0, 100)}...
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPitch(pitch)}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                >
                  <Eye className="w-3 h-3" />
                  <span>View Full</span>
                </button>
                <button
                  onClick={() => handleCopyPitch(pitch.generated_pitch)}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors text-sm"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center space-x-1 text-gray-400">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">
                    {new Date(pitch.created_at).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            {searchTerm ? 'No matching pitches found' : 'No pitch history yet'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Try adjusting your search terms or clear the search to see all pitches.'
              : 'Start creating pitches to see your history here.'
            }
          </p>
          {searchTerm ? (
            <button
              onClick={() => setSearchTerm('')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={() => router.push('/pitch-dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
            >
              Create Your First Pitch
            </button>
          )}
        </div>
      )}

      {/* Selected Pitch Modal */}
      {selectedPitch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Pitch Details</h2>
                <button
                  onClick={() => setSelectedPitch(null)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Created:</h3>
                  <p className="text-gray-600">
                    {new Date(selectedPitch.created_at).toLocaleDateString()} at{' '}
                    {new Date(selectedPitch.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {selectedPitch.job_description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">User Details Used:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap text-sm">
                      {selectedPitch.user_details_snapshot}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Pitch:</h3>
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                    <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                      {selectedPitch.generated_pitch}
                    </pre>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleCopyPitch(selectedPitch.generated_pitch)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors duration-200"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy Pitch</span>
                  </button>
                  <button
                    onClick={() => setSelectedPitch(null)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
