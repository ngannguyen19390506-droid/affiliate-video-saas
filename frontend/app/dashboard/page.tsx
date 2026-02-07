'use client'

import DailyActions from './DailyActions'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/* ======================
   TYPES (GIỮ CHO VIDEO)
====================== */
type VideoProject = {
  id: string
  productId: string
  template: string
  renderStatus: string
}

/* ======================
   PAGE
====================== */
export default function DashboardPage() {
  const router = useRouter()

  // ===== VIDEOS =====
  const [renderingVideos, setRenderingVideos] = useState<VideoProject[]>([])
  const [doneVideos, setDoneVideos] = useState<VideoProject[]>([])

  /* ======================
     FETCH VIDEOS (POLLING)
     👉 GIỮ NGUYÊN LOGIC CŨ
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
    const timer = setInterval(fetchVideos, 5000)
    return () => clearInterval(timer)
  }, [])

  /* ======================
     UI
  ====================== */
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-gray-500 mt-1">
        Hôm nay bạn nên làm gì?
      </p>

      {/* ======================
          DAILY ACTIONS (NEW)
          👉 MVP – ĐỘC LẬP
      ====================== */}
      <DailyActions />

      {/* ======================
          RENDERING VIDEOS
      ====================== */}
      {renderingVideos.length > 0 && (
        <div className="mt-10 rounded-xl border p-4 bg-white">
          <h2 className="font-semibold mb-3">
            🎬 Video đang render
          </h2>

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
          <h2 className="font-semibold mb-3">
            ✅ Video đã xong
          </h2>

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
