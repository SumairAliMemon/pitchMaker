'use client'

import { AlertCircle, Sparkles } from 'lucide-react'

interface PitchResultsProps {
  results: string | null
}

export default function PitchResults({ results }: PitchResultsProps) {
  if (!results) return null

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center space-x-2">
        <Sparkles className="w-6 h-6 text-blue-600" />
        <span>Your Generated Pitch</span>
      </h2>
      
      <div className="prose max-w-none">
        <div className="bg-gray-50 rounded-2xl p-6">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {results}
          </pre>
        </div>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Pro Tip
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Copy this pitch and customize it further based on your personal style and the specific company culture.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
