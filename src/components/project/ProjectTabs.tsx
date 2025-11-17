'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/lib/db/schema'
import { ChatTab } from './tabs/ChatTab'
import { CharactersTab } from './tabs/CharactersTab'
import { MagicSystemsTab } from './tabs/MagicSystemsTab'
import { WorldBuildingTab } from './tabs/WorldBuildingTab'
import { ManuscriptsTab } from './tabs/ManuscriptsTab'
import { OutlineTab } from './tabs/OutlineTab'
import { ThemesTab } from './tabs/ThemesTab'
import { AnalysisTab } from './tabs/AnalysisTab'

interface ProjectTabsProps {
  project: Project
}

export function ProjectTabs({ project }: ProjectTabsProps) {
  const [activeTab, setActiveTab] = useState('chat')

  useEffect(() => {
    const handleSwitchToAnalysis = (event: CustomEvent) => {
      setActiveTab('analysis')
    }

    window.addEventListener('switchToAnalysisTab', handleSwitchToAnalysis as EventListener)
    return () => {
      window.removeEventListener('switchToAnalysisTab', handleSwitchToAnalysis as EventListener)
    }
  }, [])

  const tabs = [
    { id: 'chat', name: 'AI Chat', icon: '💬' },
    { id: 'manuscripts', name: 'Manuscripts', icon: '📄' },
    { id: 'analysis', name: 'Analysis', icon: '📊' },
    { id: 'characters', name: 'Characters', icon: '👥' },
    { id: 'magic', name: 'Magic Systems', icon: '✨' },
    { id: 'worldbuilding', name: 'World Building', icon: '🌍' },
    { id: 'outline', name: 'Outline', icon: '📋' },
    { id: 'themes', name: 'Themes', icon: '🎭' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatTab project={project} />
      case 'manuscripts':
        return <ManuscriptsTab project={project} />
      case 'analysis':
        return <AnalysisTab project={project} />
      case 'characters':
        return <CharactersTab project={project} />
      case 'magic':
        return <MagicSystemsTab project={project} />
      case 'worldbuilding':
        return <WorldBuildingTab project={project} />
      case 'outline':
        return <OutlineTab project={project} />
      case 'themes':
        return <ThemesTab project={project} />
      default:
        return <ChatTab project={project} />
    }
  }

  return (
    <div className="w-full">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {renderTabContent()}
      </div>
    </div>
  )
}