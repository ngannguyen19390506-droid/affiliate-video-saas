'use client'

import { useEffect, useState } from 'react'
import { fetchDoneVideos } from '@/app/lib/api/videos'
import { useRouter } from 'next/navigation'

export default function RecentDoneVideos() {
  const [videos, setVideos] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
  fetchDoneVideos(3).then((data) => {
    console.log('[RecentDoneVideos] data =', data)
    setVideos(data)
  })
}, [])

  if (videos.length === 0) return null

  return (
    <div className="mt-6 rounded-lg border bg-white p-4">
      <h2 className="font-semibold mb-3">✅ Video đã xong</h2>

      <ul className="space-y-2">
        {videos.map((v) => (
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
  )
}
