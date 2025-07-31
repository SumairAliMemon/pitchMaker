'use client'

import { PitchHistory, pitchHistoryService } from '@/lib/pitchHistoryService'
import { Clock, Copy, ExternalLink, History, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface HistorySectionProps {
  pitchHistory: PitchHistory[]
  showHistory: boolean
  onToggleHistory: () => void
  onSelectPitch: (pitch: PitchHistory) => void
  onHistoryUpdate: (history: PitchHistory[]) => void
}

export default function HistorySection({ 
  pitchHistory, 
  showHistory, 
  onToggleHistory, 
  onSelectPitch, 
  onHistoryUpdate 
}: HistorySectionProps) {
  const handleDeletePitch = async (pitchId: string) => {
    if (await pitchHistoryService.deletePitchHistory(pitchId)) {
      const updatedHistory = pitchHistory.filter(p => p.id !== pitchId)
      onHistoryUpdate(updatedHistory)
    }
  }

  if (pitchHistory.length === 0) return null

  return (
    <>
      {/* History Toggle */}
      <div className="mb-6 flex items-center space-x-4">
        <button
          onClick={onToggleHistory}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors duration-200"
        >
          <History className="w-4 h-4" />
          <span>
            {showHistory ? 'Hide' : 'Show'} Recent Pitches ({Math.min(pitchHistory.length, 3)})
          </span>
        </button>
        <Link
          href="/pitch-history"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors duration-200"
        >
          <ExternalLink className="w-4 h-4" />
          <span>View All History ({pitchHistory.length})</span>
        </Link>
      </div>

      {/* Pitch History Section */}
      {showHistory && (
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Pitches</h2>
            <Link
              href="/pitch-history"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {pitchHistory.slice(0, 3).map((pitch) => (
              <div key={pitch.id} className="border border-gray-200 rounded-2xl p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        {new Date(pitch.created_at).toLocaleDateString()} at{' '}
                        {new Date(pitch.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {pitch.job_description.substring(0, 200)}...
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onSelectPitch(pitch)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        View Full Pitch
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(pitch.generated_pitch)}
                        className="text-sm text-green-600 hover:text-green-800 flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePitch(pitch.id)}
                    className="text-red-400 hover:text-red-600 ml-4"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
