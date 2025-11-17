'use client'

import { Project } from '@/lib/db/schema'

interface ChatTabProps {
  project: Project
}

export function ChatTab({ project }: ChatTabProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          AI Chat Coming Soon
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Chat with Claude about {project.title}, get writing advice, and ask questions about your project.
        </p>
      </div>
    </div>
  )
}