import useSWR from 'swr'
import { Manuscript } from '@/lib/db/schema'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useManuscripts(projectId: string | number) {
  const { data, error, isLoading, mutate } = useSWR<Manuscript[]>(
    projectId ? `/api/projects/${projectId}/manuscripts` : null,
    fetcher,
    {
      refreshInterval: 3000, // Refresh every 3 seconds for uploads
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  )

  return {
    manuscripts: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}