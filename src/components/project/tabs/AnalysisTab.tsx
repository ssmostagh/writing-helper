'use client'

import { useState } from 'react'
import { Project, Manuscript } from '@/lib/db/schema'
import { useManuscripts } from '@/hooks/useManuscripts'
import { useManuscriptAnalyses, startAnalysis } from '@/hooks/useAnalysis'

interface AnalysisTabProps {
  project: Project
}

export function AnalysisTab({ project }: AnalysisTabProps) {
  const { manuscripts, isLoading: manuscriptsLoading } = useManuscripts(project.id)
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null)
  const [runningAnalysis, setRunningAnalysis] = useState<string | null>(null)

  const { analyses, isLoading: analysesLoading, mutate } = useManuscriptAnalyses(
    project.id.toString(),
    selectedManuscript?.id.toString() || ''
  )

  const handleStartAnalysis = async (analysisType: string) => {
    if (!selectedManuscript) return

    setRunningAnalysis(analysisType)
    try {
      await startAnalysis(
        project.id.toString(),
        selectedManuscript.id.toString(),
        analysisType as any
      )
      mutate() // Refresh analyses
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Analysis failed. Please try again.')
    } finally {
      setRunningAnalysis(null)
    }
  }

  const handleDeleteAnalysis = async (analysisId: number) => {
    if (!selectedManuscript) return

    if (!confirm('Are you sure you want to delete this analysis?')) return

    try {
      const response = await fetch(
        `/api/projects/${project.id}/manuscripts/${selectedManuscript.id}/analyze?analysisId=${analysisId}`,
        {
          method: 'DELETE',
        }
      )

      if (response.ok) {
        mutate() // Refresh analyses
      } else {
        alert('Failed to delete analysis')
      }
    } catch (error) {
      console.error('Delete failed:', error)
      alert('Failed to delete analysis')
    }
  }

  const getAnalysisStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳'
      case 'in_progress': return '🔄'
      case 'completed': return '✅'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  const getAnalysisTypeLabel = (type: string) => {
    switch (type) {
      case 'pov_distribution': return 'POV Distribution'
      case 'character_analysis': return 'Character Analysis'
      case 'pacing': return 'Pacing Analysis'
      case 'consistency': return 'Consistency Check'
      default: return type
    }
  }

  const renderAnalysisResults = (analysis: any) => {
    const results = analysis.results

    switch (analysis.analysisType) {
      case 'pov_distribution':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  {results.summary?.total_words?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">Total Words</div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  {results.summary?.characters_detected?.length || 0}
                </div>
                <div className="text-sm text-blue-700 dark:text-blue-300">POV Characters</div>
              </div>
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                  {results.summary?.pov_switches || 0}
                </div>
                <div className="text-sm text-green-700 dark:text-green-300">POV Switches</div>
              </div>
            </div>

            {results.summary?.characters_detected && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Character Distribution</h4>
                {results.summary.characters_detected.map((char: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium text-gray-900 dark:text-white">{char.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {char.percentage?.toFixed(1)}% ({char.word_count?.toLocaleString()} words)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${char.percentage || 0}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {char.segments} segment{char.segments !== 1 ? 's' : ''}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'character_analysis':
        return (
          <div className="space-y-4">
            {results.characters && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Characters Identified</h4>
                {results.characters.map((char: any, index: number) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900 dark:text-white">{char.name}</h5>
                      <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                        {char.role}
                      </span>
                    </div>
                    {char.traits && char.traits.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Traits: </span>
                        <span className="text-sm text-gray-800 dark:text-gray-200">
                          {char.traits.join(', ')}
                        </span>
                      </div>
                    )}
                    {char.development_arc && (
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {char.development_arc}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'pacing':
        return (
          <div className="space-y-4">
            {/* Overall Metrics */}
            {results.overall_metrics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {results.overall_metrics.total_words?.toLocaleString() || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Words</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-red-900 dark:text-red-100">
                    {results.overall_metrics.action_percentage || 0}%
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Action</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {results.overall_metrics.dialogue_percentage || 0}%
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Dialogue</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                    {results.overall_metrics.description_percentage || 0}%
                  </div>
                  <div className="text-sm text-purple-700 dark:text-purple-300">Description</div>
                </div>
              </div>
            )}

            {/* Summary */}
            {results.summary && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Summary</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{results.summary}</p>
              </div>
            )}

            {/* Pacing Issues */}
            {results.overall_metrics?.pacing_issues && results.overall_metrics.pacing_issues.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">Pacing Issues Found</h4>
                <ul className="space-y-1">
                  {results.overall_metrics.pacing_issues.map((issue: string, index: number) => (
                    <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                      • {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Chunk Analysis */}
            {results.chunk_analyses && results.chunk_analyses.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">Section-by-Section Analysis</h4>
                {results.chunk_analyses.map((chunk: any, index: number) => (
                  <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Section {index + 1}
                      {chunk.chunk_metrics && (
                        <span className="text-sm text-gray-600 dark:text-gray-300 font-normal ml-2">
                          ({chunk.chunk_metrics.word_count?.toLocaleString()} words)
                        </span>
                      )}
                    </h5>

                    {chunk.chunk_metrics && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center p-2 bg-red-50 dark:bg-red-900 rounded">
                          <div className="text-sm font-medium text-red-900 dark:text-red-100">
                            {chunk.chunk_metrics.action_percentage}%
                          </div>
                          <div className="text-xs text-red-700 dark:text-red-300">Action</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 dark:bg-green-900 rounded">
                          <div className="text-sm font-medium text-green-900 dark:text-green-100">
                            {chunk.chunk_metrics.dialogue_percentage}%
                          </div>
                          <div className="text-xs text-green-700 dark:text-green-300">Dialogue</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 dark:bg-purple-900 rounded">
                          <div className="text-sm font-medium text-purple-900 dark:text-purple-100">
                            {chunk.chunk_metrics.description_percentage}%
                          </div>
                          <div className="text-xs text-purple-700 dark:text-purple-300">Description</div>
                        </div>
                      </div>
                    )}

                    {chunk.pacing_notes && chunk.pacing_notes.length > 0 && (
                      <div className="mb-2">
                        <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes:</div>
                        <ul className="text-sm text-gray-700 dark:text-gray-300">
                          {chunk.pacing_notes.map((note: string, noteIndex: number) => (
                            <li key={noteIndex}>• {note}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {chunk.issues && chunk.issues.length > 0 && (
                      <div className="text-xs text-yellow-700 dark:text-yellow-300">
                        Issues: {chunk.issues.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'consistency':
        return (
          <div className="space-y-4">
            {/* Summary Stats */}
            {results.summary && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                    {results.summary.total_issues || 0}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">Total Issues</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-red-900 dark:text-red-100">
                    {results.summary.major_issues || 0}
                  </div>
                  <div className="text-sm text-red-700 dark:text-red-300">Major Issues</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                    {results.summary.moderate_issues || 0}
                  </div>
                  <div className="text-sm text-yellow-700 dark:text-yellow-300">Moderate Issues</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                  <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                    {results.summary.unique_characters?.length || 0}
                  </div>
                  <div className="text-sm text-green-700 dark:text-green-300">Characters Found</div>
                </div>
              </div>
            )}

            {/* Issues by Severity */}
            {results.issues_by_severity && (
              <div className="space-y-4">
                {['major', 'moderate', 'minor'].map((severity) => {
                  const issues = results.issues_by_severity[severity] || []
                  if (issues.length === 0) return null

                  const colorMap = {
                    major: 'red',
                    moderate: 'yellow',
                    minor: 'blue'
                  }
                  const color = colorMap[severity as keyof typeof colorMap]

                  return (
                    <div key={severity} className={`bg-${color}-50 dark:bg-${color}-900 p-4 rounded-lg`}>
                      <h4 className={`font-medium text-${color}-900 dark:text-${color}-100 mb-2 capitalize`}>
                        {severity} Issues ({issues.length})
                      </h4>
                      <div className="space-y-2">
                        {issues.map((issue: any, index: number) => (
                          <div key={index} className={`bg-white dark:bg-gray-800 p-3 rounded border-l-4 border-${color}-400`}>
                            <div className="flex justify-between items-start mb-1">
                              <div className={`text-sm font-medium text-${color}-900 dark:text-${color}-100 capitalize`}>
                                {issue.type}
                              </div>
                              <div className="text-xs text-gray-500">
                                {issue.location}
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                              {issue.description}
                            </div>
                            {issue.suggestion && (
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                💡 {issue.suggestion}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* Character Names Found */}
            {results.character_names && results.character_names.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Characters Detected</h4>
                <div className="flex flex-wrap gap-1">
                  {results.character_names.map((name: string, index: number) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return (
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )
    }
  }

  if (manuscriptsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600 dark:text-gray-300">Loading manuscripts...</div>
      </div>
    )
  }

  if (manuscripts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📊</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No manuscripts to analyze
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Upload a manuscript first to start AI-powered analysis
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Manuscript Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Manuscript for Analysis
        </h3>
        <div className="space-y-2">
          {manuscripts.map((manuscript) => (
            <button
              key={manuscript.id}
              onClick={() => setSelectedManuscript(manuscript)}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedManuscript?.id === manuscript.id
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900'
                  : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {manuscript.fileName}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {manuscript.wordCount?.toLocaleString()} words • {manuscript.uploadType}
                  </div>
                </div>
                <div className="text-2xl">
                  {selectedManuscript?.id === manuscript.id ? '📋' : '📄'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Analysis Controls */}
      {selectedManuscript && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            AI Analysis Tools
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { type: 'pov_distribution', label: 'POV Distribution', icon: '👁️', description: 'Identify viewpoint characters and POV shifts' },
              { type: 'character_analysis', label: 'Character Analysis', icon: '👥', description: 'Analyze character roles and development' },
              { type: 'pacing', label: 'Pacing Analysis', icon: '⚡', description: 'Examine narrative flow and tension' },
              { type: 'consistency', label: 'Consistency Check', icon: '🔍', description: 'Find plot holes and inconsistencies' },
            ].map((analysis) => (
              <button
                key={analysis.type}
                onClick={() => handleStartAnalysis(analysis.type)}
                disabled={runningAnalysis === analysis.type}
                className="p-4 text-left border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <div className="text-2xl mb-2">{analysis.icon}</div>
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {analysis.label}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-300">
                  {runningAnalysis === analysis.type ? 'Running...' : analysis.description}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {selectedManuscript && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Analysis Results
          </h3>

          {analysesLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="text-gray-600 dark:text-gray-300">Loading results...</div>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-600 dark:text-gray-300">
                No analyses completed yet. Start an analysis above.
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {analyses.map((analysis) => (
                <div
                  key={analysis.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{getAnalysisStatusIcon(analysis.status)}</span>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {getAnalysisTypeLabel(analysis.analysisType)}
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {new Date(analysis.createdAt).toLocaleDateString()} at{' '}
                          {new Date(analysis.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                        {analysis.status}
                      </div>
                      {(analysis.status === 'failed' || analysis.status === 'completed') && (
                        <button
                          onClick={() => handleDeleteAnalysis(analysis.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
                          title="Delete analysis"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {analysis.status === 'completed' && analysis.results && (
                    <div>{renderAnalysisResults(analysis)}</div>
                  )}

                  {analysis.status === 'failed' && analysis.error && (
                    <div className="bg-red-50 dark:bg-red-900 p-3 rounded-lg">
                      <div className="text-sm text-red-800 dark:text-red-200">
                        Error: {analysis.error}
                      </div>
                    </div>
                  )}

                  {analysis.status === 'in_progress' && (
                    <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg">
                      <div className="text-sm text-blue-800 dark:text-blue-200 flex items-center space-x-2">
                        <span className="animate-spin">🔄</span>
                        <span>Analysis in progress...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}