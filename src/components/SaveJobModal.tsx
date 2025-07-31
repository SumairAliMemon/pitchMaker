'use client'

import { jobDescriptionService } from '@/lib/jobDescriptionService'
import { useState } from 'react'

interface SaveJobModalProps {
  isOpen: boolean
  jobDescription: string
  userId: string
  onClose: () => void
  onSaved: () => void
}

export default function SaveJobModal({ 
  isOpen, 
  jobDescription, 
  userId, 
  onClose, 
  onSaved 
}: SaveJobModalProps) {
  const [saveJobTitle, setSaveJobTitle] = useState('')
  const [saveJobCompany, setSaveJobCompany] = useState('')

  const handleSaveJobDescription = async () => {
    if (!jobDescription.trim() || !saveJobTitle.trim()) {
      alert('Please provide a title and job description')
      return
    }

    const savedJob = await jobDescriptionService.saveJobDescription(
      userId,
      saveJobTitle,
      jobDescription,
      saveJobCompany
    )

    if (savedJob) {
      onSaved()
      onClose()
      setSaveJobTitle('')
      setSaveJobCompany('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Save Job Description</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={saveJobTitle}
                onChange={(e) => setSaveJobTitle(e.target.value)}
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company (optional)
              </label>
              <input
                type="text"
                value={saveJobCompany}
                onChange={(e) => setSaveJobCompany(e.target.value)}
                placeholder="e.g., Google, Microsoft"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveJobDescription}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Save Job
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
