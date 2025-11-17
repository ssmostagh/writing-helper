'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Project } from '@/lib/db/schema'
import { ProjectTabs } from '@/components/project/ProjectTabs'
import { EditProjectModal } from '@/components/project/EditProjectModal'
import { useProject } from '@/hooks/useProjects'
import Link from 'next/link'

export default function ProjectPage() {
  const params = useParams()
  const router = useRouter()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const projectId = params.id as string
  const { project, isLoading: loading, isError, mutate } = useProject(projectId)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isError) {
      setError('Failed to load project')
    } else if (project && projectId) {
      // Update last worked on date
      fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastWorkedOn: new Date() })
      }).then(() => mutate()) // Refresh after updating
    }
  }, [project, isError, projectId, mutate])

  const handleUpdateProject = async (projectData: any) => {
    try {
      const response = await fetch(`/api/projects/${project?.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      })

      if (response.ok) {
        mutate() // Trigger real-time refresh
        setIsEditModalOpen(false)
      } else {
        alert('Failed to update project')
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Failed to update project')
    }
  }

  const statusColors = {
    planning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    first_draft: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    revising: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    complete: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  const statusLabels = {
    planning: 'Planning',
    first_draft: 'First Draft',
    revising: 'Revising',
    complete: 'Complete'
  }

  const getBookTypeDisplay = () => {
    if (!project) return ''
    if (project.bookType === 'series' && project.bookNumber && project.totalBooks) {
      return `Book ${project.bookNumber} of ${project.totalBooks}`
    }
    return project.bookType === 'series' ? 'Series' : 'Standalone'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="text-lg text-gray-600 dark:text-gray-300">Loading project...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {error || 'Project not found'}
            </h3>
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 flex items-center"
            >
              ← Back to Dashboard
            </Link>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1 text-sm"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  statusColors[project.status as keyof typeof statusColors]
                }`}
              >
                {statusLabels[project.status as keyof typeof statusLabels]}
              </span>
            </div>
          </div>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {project.title}
              </h1>

              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center">
                  <span className="mr-2">📖</span>
                  <span>{getBookTypeDisplay()}</span>
                </div>

                {project.wordCountTarget && (
                  <div className="flex items-center">
                    <span className="mr-2">🎯</span>
                    <span>{project.wordCountTarget.toLocaleString()} word target</span>
                  </div>
                )}

                {project.genreTags && project.genreTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.genreTags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-300 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {project.genreTags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-md">
                        +{project.genreTags.length - 3}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {project.seriesArc && (
                <div className="mt-3">
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    <span className="font-medium">Series Arc:</span> {project.seriesArc}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <ProjectTabs project={project} />
      </div>

      {project && (
        <EditProjectModal
          project={project}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleUpdateProject}
        />
      )}
    </div>
  )
}