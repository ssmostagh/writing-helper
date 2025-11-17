'use client'

import Link from 'next/link'
import { Project } from '@/lib/db/schema'

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getBookTypeDisplay = () => {
    if (project.bookType === 'series' && project.bookNumber && project.totalBooks) {
      return `Book ${project.bookNumber} of ${project.totalBooks}`
    }
    return project.bookType === 'series' ? 'Series' : 'Standalone'
  }

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
            {project.title}
          </h3>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              statusColors[project.status as keyof typeof statusColors]
            }`}
          >
            {statusLabels[project.status as keyof typeof statusLabels]}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <span className="mr-2">📖</span>
            <span>{getBookTypeDisplay()}</span>
          </div>

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

          {project.wordCountTarget && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
              <span className="mr-2">🎯</span>
              <span>{project.wordCountTarget.toLocaleString()} word target</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <span>Last worked on</span>
          <span>{formatDate(project.lastWorkedOn)}</span>
        </div>
      </div>
    </Link>
  )
}