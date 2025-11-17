'use client'

import { useState, useRef } from 'react'
import { Project } from '@/lib/db/schema'
import { useManuscripts } from '@/hooks/useManuscripts'

interface ManuscriptsTabProps {
  project: Project
}

export function ManuscriptsTab({ project }: ManuscriptsTabProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { manuscripts, isLoading: loading, mutate } = useManuscripts(project.id)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/epub+zip'
    ]
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.epub')) {
      alert('Please upload a PDF, DOCX, TXT, or EPUB file.')
      return
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', project.id.toString())

      const response = await fetch(`/api/projects/${project.id}/manuscripts/upload`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        mutate() // Trigger real-time refresh
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const error = await response.json()
        alert(`Upload failed: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (manuscriptId: number) => {
    if (!confirm('Are you sure you want to delete this manuscript?')) return

    try {
      const response = await fetch(`/api/projects/${project.id}/manuscripts/${manuscriptId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        mutate() // Trigger real-time refresh
      } else {
        alert('Failed to delete manuscript')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Failed to delete manuscript')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getUploadTypeLabel = (type: string) => {
    switch (type) {
      case 'complete': return 'Complete Manuscript'
      case 'partial': return 'Partial Draft'
      case 'single_chapter': return 'Single Chapter'
      default: return type
    }
  }

  const getUploadTypeColor = (type: string) => {
    switch (type) {
      case 'complete': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'partial': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'single_chapter': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading manuscripts...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Upload Manuscript
        </h3>

        <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Upload your manuscript
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Supports PDF, DOCX, TXT, and EPUB files up to 50MB
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt,.epub"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <span className="animate-spin">⏳</span>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <span>📁</span>
                    <span>Choose File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          <p className="mb-2"><strong>Upload Types:</strong></p>
          <ul className="space-y-1">
            <li>• <strong>Complete Manuscript:</strong> Your finished or nearly finished book</li>
            <li>• <strong>Partial Draft:</strong> Chapters 1-10, first act, work-in-progress sections</li>
            <li>• <strong>Single Chapter:</strong> Individual chapters or scenes for review</li>
          </ul>
        </div>
      </div>

      {/* Manuscripts List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Uploaded Manuscripts ({manuscripts.length})
          </h3>
        </div>

        {manuscripts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">📭</div>
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No manuscripts uploaded yet
            </h4>
            <p className="text-gray-600 dark:text-gray-300">
              Upload your manuscript files to start analyzing your work
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {manuscripts.map((manuscript) => (
              <div key={manuscript.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {manuscript.fileName}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getUploadTypeColor(
                          manuscript.uploadType
                        )}`}
                      >
                        {getUploadTypeLabel(manuscript.uploadType)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                      {manuscript.wordCount && (
                        <div className="flex items-center space-x-1">
                          <span>📊</span>
                          <span>{manuscript.wordCount.toLocaleString()} words</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <span>📅</span>
                        <span>Uploaded {formatDate(manuscript.uploadDate)}</span>
                      </div>

                      {manuscript.sectionsCovered && (
                        <div className="flex items-center space-x-1">
                          <span>📖</span>
                          <span>{manuscript.sectionsCovered}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        // Trigger the parent component to switch to analysis tab
                        const event = new CustomEvent('switchToAnalysisTab', { detail: { manuscriptId: manuscript.id } });
                        window.dispatchEvent(event);
                      }}
                      className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium"
                    >
                      Analyze
                    </button>
                    <button
                      onClick={() => handleDelete(manuscript.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}