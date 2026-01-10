'use client'

import { useEffect, useState } from 'react'

type ScheduleStatus = 'PENDING' | 'DONE' | 'FAILED'

type Schedule = {
  id: string
  videoId: string
  scheduledAt: string
  status: ScheduleStatus
}

const WORKSPACE_ID = 'workspace-demo'

const STATUS_BADGE: Record<ScheduleStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  DONE: 'bg-green-100 text-green-700',
  FAILED: 'bg-red-100 text-red-700',
}

export default function SchedulePage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSchedules = async () => {
    if (!API_URL) return
    setLoading(true)

    try {
      const res = await fetch(
        `${API_URL}/post-schedules/${WORKSPACE_ID}`
      )
      if (!res.ok) throw new Error('Fetch failed')

      const data = await res.json()
      setSchedules(data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedules()
  }, [])

  return (
    <div className="p-6 max-w-5xl">
      <h1 className="text-2xl font-semibold">
        Schedule List
      </h1>
      <p className="text-gray-500 mt-1">
        Danh sách lịch đăng video (read-only)
      </p>

      <div className="mt-6">
        <button
          onClick={fetchSchedules}
          className="mb-3 text-sm text-blue-600 hover:underline"
        >
          Refresh
        </button>

        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-50 text-left text-sm">
            <tr>
              <th className="p-3">Video ID</th>
              <th className="p-3">Scheduled At</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center text-gray-500"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              schedules.map((s) => (
                <tr key={s.id} className="border-t text-sm">
                  <td className="p-3 font-mono">
                    {s.videoId}
                  </td>
                  <td className="p-3">
                    {new Date(s.scheduledAt).toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs ${STATUS_BADGE[s.status]}`}
                    >
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}

            {!loading && schedules.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-6 text-center text-gray-500"
                >
                  Chưa có schedule nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
