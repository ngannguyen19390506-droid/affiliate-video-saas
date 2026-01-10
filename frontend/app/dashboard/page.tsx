'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

type DailyAction = {
  id: string
  productId: string
  actionType: string
  priority: number
  reason: string
  isDone: boolean
}

const WORKSPACE_ID = 'workspace-demo'

const ACTION_LABEL_MAP: Record<string, string> = {
  MAKE_MORE_VIDEOS: 'Tạo video',
  STOP_PRODUCT: 'Dừng sản phẩm',
  SCALE_FORMAT: 'Nhân bản format',
  RETEST_WITH_NEW_FORMAT: 'Test lại format mới',
}

export default function DashboardPage() {
  const router = useRouter()

  const [action, setAction] = useState<DailyAction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL
        if (!API_URL) {
          throw new Error('NEXT_PUBLIC_API_URL is missing')
        }

        const res = await fetch(
          `${API_URL}/workspaces/${WORKSPACE_ID}/daily-actions/today`
        )

        if (!res.ok) {
          throw new Error(`Fetch failed: ${res.status}`)
        }

        const data = await res.json()

        // API trả về array
        if (!Array.isArray(data) || data.length === 0) {
          setAction(null)
          return
        }

        // Hiện tại lấy action ưu tiên cao nhất (phần tử đầu)
        setAction(data[0])
      } catch (err) {
        console.error(err)
        setError('Không thể tải dữ liệu')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  if (!action) {
    return <div className="p-6">Không có việc hôm nay 🎉</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-500 mt-1">Hôm nay bạn nên làm gì?</p>

      <div className="mt-6 max-w-md rounded-xl border p-4 shadow-sm">
        <h2 className="font-semibold mb-2">📌 Sản phẩm B</h2>

        <p className="text-sm text-gray-600">
          <b>Action:</b> {action.actionType}
        </p>

        <p className="text-sm text-gray-600 mt-1">
          <b>Lý do:</b> {action.reason}
        </p>

        <button
          className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          onClick={() =>
            router.push(
              `/video/create?productId=${action.productId}&actionType=${action.actionType}`
            )
          }
        >
          {ACTION_LABEL_MAP[action.actionType] ?? 'Thực hiện'}
        </button>
      </div>
    </div>
  )
}
