'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/* ======================
   TYPES
====================== */
type DailyAction = {
  id: string
  product: {
    id: string
    status: string
  }
  action: {
    type: string
    label: string
  }
  reason: string
  priority: number
  meta: {
    canMarkDone: boolean
  }
}


type VideoProject = {
  id: string
  productId: string
  template: string
  renderStatus: string
}

/* ======================
   CONST
====================== */
const WORKSPACE_ID = 'workspace-demo'

const ACTION_LABEL_MAP: Record<string, string> = {
  MAKE_MORE_VIDEOS: 'Tạo video',
  STOP_PRODUCT: 'Dừng sản phẩm',
  SCALE_FORMAT: 'Nhân bản format',
  RETEST_WITH_NEW_FORMAT: 'Test lại format mới',
}

/* ======================
   PAGE
====================== */
export default function DashboardPage() {
  const router = useRouter()

  // ===== DAILY ACTION =====
  const [action, setAction] = useState<DailyAction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ===== VIDEOS =====
  const [renderingVideos, setRenderingVideos] = useState<VideoProject[]>([])
  const [doneVideos, setDoneVideos] = useState<VideoProject[]>([])

  /* ======================
     FETCH DAILY ACTION
  ====================== */
  useEffect(() => {
    const fetchDailyAction = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL
        if (!API_URL) throw new Error('NEXT_PUBLIC_API_URL is missing')

        const res = await fetch(
          `${API_URL}/workspaces/${WORKSPACE_ID}/daily-actions/today`,
          { cache: 'no-store' }
        )

        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)

        const data = await res.json()

        if (!Array.isArray(data) || data.length === 0) {
          setAction(null)
          return
        }

        setAction(data[0]) // ưu tiên cao nhất
      } catch (err) {
        console.error(err)
        setError('Không thể tải Daily Action')
      } finally {
        setLoading(false)
      }
    }

    fetchDailyAction()
  }, [])

  /* ======================
     FETCH VIDEOS (POLLING)
  ====================== */
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL
        if (!API_URL) return

        const [renderingRes, doneRes] = await Promise.all([
          fetch(`${API_URL}/videos?renderStatus=RENDERING`, {
            cache: 'no-store',
          }),
          fetch(`${API_URL}/videos?renderStatus=DONE&limit=3`, {
            cache: 'no-store',
          }),
        ])

        if (renderingRes.ok) {
          setRenderingVideos(await renderingRes.json())
        }

        if (doneRes.ok) {
          setDoneVideos(await doneRes.json())
        }
      } catch (e) {
        console.error('Fetch videos failed', e)
      }
    }

    fetchVideos()
    const timer = setInterval(fetchVideos, 5000) // auto refresh
    return () => clearInterval(timer)
  }, [])

  /* ======================
     UI STATES
  ====================== */
  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-500 mt-1">Hôm nay bạn nên làm gì?</p>

      {/* ======================
          DAILY ACTION
      ====================== */}
      {action ? (
  <div className="mt-6 max-w-md rounded-xl border p-4 shadow-sm bg-white">
    <h2 className="font-semibold mb-2">
      📌 Sản phẩm: {action.product.id}
    </h2>

    <p className="text-sm text-gray-600">
      <b>Action:</b> {action.action.label}
    </p>

    <p className="text-sm text-gray-600 mt-1">
      <b>Lý do:</b> {action.reason}
    </p>

    <button
      className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
      onClick={async () => {
  try {
    // 1️⃣ Mark DailyAction DONE ngay
    await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/workspaces/workspace-demo/daily-actions/${action.id}/done`,
  {
    method: 'PATCH',
  }
)


    // 2️⃣ Chuyển sang màn Create Video
    router.push(
      `/video/create?productId=${action.product.id}` +
      `&actionType=${action.action.type}` +
      `&dailyActionId=${action.id}`
    )
  } catch (err) {
    console.error('Failed to mark DailyAction done', err)

    // fallback: vẫn cho đi tiếp
    router.push(
      `/video/create?productId=${action.product.id}` +
      `&actionType=${action.action.type}` +
      `&dailyActionId=${action.id}`
    )
  }
}}
    >
      {action.action.label ?? 'Thực hiện'}
    </button>
  </div>
) : (
  <div className="mt-6 text-green-600">
    🎉 Không có việc hôm nay
  </div>
)}


      {/* ======================
          RENDERING VIDEOS
      ====================== */}
      {renderingVideos.length > 0 && (
        <div className="mt-10 rounded-xl border p-4 bg-white">
          <h2 className="font-semibold mb-3">🎬 Video đang render</h2>

          <ul className="space-y-2">
            {renderingVideos.map((v) => (
              <li
                key={v.id}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  <b>{v.productId}</b> – {v.template}
                </span>
                <span className="text-orange-600 animate-pulse">
                  Đang render...
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ======================
          DONE VIDEOS
      ====================== */}
      {doneVideos.length > 0 && (
        <div className="mt-10 rounded-xl border p-4 bg-white">
          <h2 className="font-semibold mb-3">✅ Video đã xong</h2>

          <ul className="space-y-2">
            {doneVideos.map((v) => (
              <li
                key={v.id}
                className="flex justify-between items-center text-sm"
              >
                <span>
                  <b>{v.productId}</b> – {v.template}
                </span>
                <button
                  onClick={() => router.push(`/video/${v.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  Xem
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
