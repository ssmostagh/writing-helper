'use client'

import { useState } from 'react'
import { Project } from '@/lib/db/schema'

interface EditProjectModalProps {
  project: Project
  isOpen: boolean
  onClose: () => void
  onUpdate: (projectData: any) => void
}

export function EditProjectModal({ project, isOpen, onClose, onUpdate }: EditProjectModalProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    bookType: project.bookType,
    bookNumber: project.bookNumber?.toString() || '',
    totalBooks: project.totalBooks?.toString() || '',
    status: project.status,
    genreTags: [...(project.genreTags || [])],
    wordCountTarget: project.wordCountTarget?.toString() || '',
    seriesArc: project.seriesArc || ''
  })

  const [genreInput, setGenreInput] = useState('')

  const genreOptions = [
    'Urban Fantasy',
    'High Fantasy',
    'Dark Fantasy',
    'Epic Fantasy',
    'Paranormal Romance',
    'Fantasy Romance',
    'Steampunk',
    'Dystopian',
    'Science Fantasy',
    'Contemporary Fantasy'
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const projectData = {
      ...formData,
      bookNumber: formData.bookNumber ? parseInt(formData.bookNumber) : null,
      totalBooks: formData.totalBooks ? parseInt(formData.totalBooks) : null,
      wordCountTarget: formData.wordCountTarget ? parseInt(formData.wordCountTarget) : null
    }

    onUpdate(projectData)
  }

  const addGenre = (genre: string) => {
    if (!formData.genreTags.includes(genre)) {
      setFormData({
        ...formData,
        genreTags: [...formData.genreTags, genre]
      })
    }
    setGenreInput('')
  }

  const removeGenre = (genre: string) => {
    setFormData({
      ...formData,
      genreTags: formData.genreTags.filter(g => g !== genre)
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Edit Project
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                placeholder="Enter your project title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Book Type
              </label>
              <select
                value={formData.bookType}
                onChange={(e) => setFormData({ ...formData, bookType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="standalone">Standalone</option>
                <option value="series">Series</option>
              </select>
            </div>

            {formData.bookType === 'series' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Book Number
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.bookNumber}
                      onChange={(e) => setFormData({ ...formData, bookNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Total Books
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.totalBooks}
                      onChange={(e) => setFormData({ ...formData, totalBooks: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Series Arc Overview
                  </label>
                  <textarea
                    value={formData.seriesArc}
                    onChange={(e) => setFormData({ ...formData, seriesArc: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                    rows={3}
                    placeholder="Describe the overall arc of your series"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="planning">Planning</option>
                <option value="first_draft">First Draft</option>
                <option value="revising">Revising</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Genre Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.genreTags.map((genre) => (
                  <span
                    key={genre}
                    className="inline-flex items-center px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-sm rounded-md"
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => removeGenre(genre)}
                      className="ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (genreInput.trim()) {
                      addGenre(genreInput.trim())
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                placeholder="Type genre and press Enter"
              />
              <div className="flex flex-wrap gap-1 mt-2">
                {genreOptions.filter(g => !formData.genreTags.includes(g)).map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => addGenre(genre)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    + {genre}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Word Count Target
              </label>
              <input
                type="number"
                min="0"
                value={formData.wordCountTarget}
                onChange={(e) => setFormData({ ...formData, wordCountTarget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-purple-500 focus:border-purple-500"
                placeholder="e.g., 80000"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}