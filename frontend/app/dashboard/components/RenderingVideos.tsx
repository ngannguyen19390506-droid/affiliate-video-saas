'use client'

import { useEffect, useState } from 'react'
import { fetchRenderingVideos } from '@/app/lib/api/videos'

export default function RenderingVideos() {
  const [videos, setVideos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    try {
      const data = await fetchRenderingVideos()
      setVideos(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const timer = setInterval(load, 5000) // auto refresh
    return () => clearInterval(timer)
  }, [])

  if (loading) {
    return <p className="text-sm text-gray-500">Đang tải video...</p>
  }

  if (videos.length === 0) return null

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      <h2 className="font-semibold mb-3">🎬 Video đang render</h2>

      <ul className="space-y-2">
        {videos.map((v) => (
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
  )
}
