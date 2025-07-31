'use client'

import { PitchHistory } from '@/lib/pitchHistoryService'
import { Copy } from 'lucide-react'

interface PitchModalProps {
  pitch: PitchHistory | null
  onClose: () => void
}

export default function PitchModal({ pitch, onClose }: PitchModalProps) {
  if (!pitch) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Generated Pitch</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Created:</h3>
              <p className="text-gray-600">
                {new Date(pitch.created_at).toLocaleDateString()} at{' '}
                {new Date(pitch.created_at).toLocaleTimeString()}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Job Description:</h3>
              <div className="bg-gray-50 rounded-lg p-4 max-h-32 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {pitch.job_description}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Generated Pitch:</h3>
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6">
                <pre className="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed font-sans">
                  {pitch.generated_pitch}
                </pre>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(pitch.generated_pitch)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl transition-colors duration-200"
              >
                <Copy className="w-4 h-4" />
                <span>Copy Pitch</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
