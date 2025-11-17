'use client'

import { useState, useEffect } from 'react'

interface LiveStatusProps {
  isLoading?: boolean
  lastUpdate?: Date
  className?: string
}

export function LiveStatus({ isLoading, lastUpdate, className = '' }: LiveStatusProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) return

      const now = new Date()
      const diff = now.getTime() - lastUpdate.getTime()
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)

      if (seconds < 10) {
        setTimeAgo('just now')
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`)
      } else {
        setTimeAgo('over 1h ago')
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)

    return () => clearInterval(interval)
  }, [lastUpdate])

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <div className="flex items-center space-x-1">
        <div
          className={`w-2 h-2 rounded-full ${
            isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
          }`}
        />
        <span className="text-gray-500 dark:text-gray-400">
          {isLoading ? 'Syncing...' : 'Live'}
        </span>
      </div>

      {lastUpdate && !isLoading && (
        <span className="text-gray-400 dark:text-gray-500 text-xs">
          Updated {timeAgo}
        </span>
      )}
    </div>
  )
}