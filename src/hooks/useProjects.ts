import useSWR from 'swr'
import { Project } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>('/api/projects', fetcher, {
    refreshInterval: 5000, // Refresh every 5 seconds
    revalidateOnFocus: true, // Refresh when window gains focus
    revalidateOnReconnect: true, // Refresh when connection is restored
  })

  return {
    projects: data || [],
    isLoading,
    isError: error,
    mutate, // Function to manually refresh data
  }
}

export function useProject(projectId: string | number) {
  const { data, error, isLoading, mutate } = useSWR<Project>(
    projectId ? `/api/projects/${projectId}` : null,
    fetcher,
    {
      refreshInterval: 10000, // Refresh every 10 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    project: data,
    isLoading,
    isError: error,
    mutate,
  }
}