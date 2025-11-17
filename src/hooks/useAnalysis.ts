import useSWR from 'swr'
import { ManuscriptAnalysis } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface AnalysisResponse {
  analyses: ManuscriptAnalysis[]
}

export function useManuscriptAnalyses(projectId: string, manuscriptId: string) {
  const { data, error, isLoading, mutate } = useSWR<AnalysisResponse>(
    projectId && manuscriptId ? `/api/projects/${projectId}/manuscripts/${manuscriptId}/analyze` : null,
    fetcher,
    {
      refreshInterval: 3000, // Poll every 3 seconds for analysis updates
      revalidateOnFocus: true,
    }
  )

  return {
    analyses: data?.analyses || [],
    isLoading,
    isError: error,
    mutate,
  }
}

export async function startAnalysis(
  projectId: string,
  manuscriptId: string,
  analysisType: 'pov_distribution' | 'character_analysis' | 'pacing' | 'consistency'
): Promise<any> {
  const response = await fetch(`/api/projects/${projectId}/manuscripts/${manuscriptId}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ analysisType }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Analysis failed')
  }

  return response.json()
}