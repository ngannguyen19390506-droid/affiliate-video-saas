'use client'

import { useCallback, useEffect, useState } from 'react'

/* ======================
   TYPES – ĐÚNG SPEC BACKEND
====================== */
export type DailyAction = {
  id: string
  actionType: string
  reason: string
  priority: number
  product: {
    id: string
    name: string
  }
}

/* ======================
   HOOK
====================== */
export function useDailyActions(workspaceId: string) {
  const [actions, setActions] = useState<DailyAction[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  /* ======================
     FETCH LIST
  ====================== */
  const fetchActions = useCallback(async () => {
    if (!API_URL) {
      setError('NEXT_PUBLIC_API_URL is missing')
      setLoading(false)
      return
    }

    try {
      setError(null)

      const res = await fetch(
        `${API_URL}/workspaces/${workspaceId}/daily-actions/today`,
        { cache: 'no-store' }
      )

      if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status}`)
      }

      const data = await res.json()

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format')
      }

      setActions(data)
    } catch (err: any) {
      console.error('[useDailyActions] fetch failed', err)
      setError(err.message ?? 'Failed to fetch daily actions')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [API_URL, workspaceId])

  /* ======================
     MARK DONE
  ====================== */
  const markDone = useCallback(
    async (actionId: string) => {
      if (!API_URL) return

      try {
        setRefreshing(true)

        const res = await fetch(
          `${API_URL}/workspaces/${workspaceId}/daily-actions/${actionId}/done`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )

        if (!res.ok) {
          throw new Error(`Mark done failed: ${res.status}`)
        }

        // Backend trả { count: 1 } → không cần dùng
        await fetchActions()
      } catch (err) {
        console.error('[useDailyActions] markDone failed', err)
        setError('Không thể cập nhật trạng thái')
        setRefreshing(false)
      }
    },
    [API_URL, workspaceId, fetchActions]
  )

  const regenerateToday = async () => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL
    if (!API_URL) throw new Error('API_URL missing')

    await fetch(
      `${API_URL}/workspaces/${workspaceId}/daily-actions/_debug/run`,
      { method: 'POST' }
    )

    // sau khi generate xong → refetch
    await fetchActions()
  }

  /* ======================
     INIT
  ====================== */
  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  return {
    actions,
    loading,
    refreshing,
    error,
    markDone,
    refetch: fetchActions,
    regenerateToday,
  }
}
