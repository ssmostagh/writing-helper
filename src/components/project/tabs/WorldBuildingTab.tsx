'use client'

import { Project } from '@/lib/db/schema'

interface WorldBuildingTabProps {
  project: Project
}

export function WorldBuildingTab({ project }: WorldBuildingTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🌍</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          World Building Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Track locations, factions, timelines, and world details for {project.title}.
        </p>
      </div>
    </div>
  )
}