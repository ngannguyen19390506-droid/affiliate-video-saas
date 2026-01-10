'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

import {
  fetchVideosDone,
  createPostSchedule,
} from '@/app/lib/api'

type Video = {
  id: string
  productId: string
  outputPath: string
}

export default function CreateSchedulePage() {
  const params = useSearchParams()
  const productId = params.get('productId')

  const [videos, setVideos] = useState<Video[]>([])
  const [videoId, setVideoId] = useState('')
  const [postAt, setPostAt] = useState('')

  useEffect(() => {
    console.log('[CreateSchedulePage] useEffect fired')
    console.log('[CreateSchedulePage] productId =', productId)

    if (!productId) return

    fetchVideosDone()
      .then(v => {
        console.log('[CreateSchedulePage] all videos', v)

        // ✅ chỉ lấy video DONE của đúng product
        const filtered = v.filter(
          (video: any) => video.productId === productId
        )

        console.log('[CreateSchedulePage] filtered videos', filtered)
        setVideos(filtered)
      })
      .catch(err => {
        console.error(
          '[CreateSchedulePage] fetchVideosDone error',
          err
        )
      })
  }, [productId])

  // ❌ Không có productId → truy cập sai luồng
  if (!productId) {
    return (
      <div style={{ padding: 24 }}>
        ❌ Missing productId. Please access this page from Daily Action.
      </div>
    )
  }

  const submit = async () => {
    console.log('[submit] clicked')
    console.log('[submit] state', { videoId, postAt })

    if (!videoId || !postAt) {
      alert('Please select video and post time')
      return
    }

    try {
      await createPostSchedule({
        workspaceId: 'TEMP_WORKSPACE_ID', // TODO: lấy từ auth/context
        videoId,
        platform: 'TIKTOK',
        scheduledAt: postAt, // ✅ backend dùng field này
        timezone: 'Asia/Tokyo',
      })

      alert('Schedule created')
    } catch (err) {
      console.error('[submit] error', err)
      alert('Failed to create schedule')
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h1>Create Schedule</h1>

      <p style={{ color: '#666', fontSize: 14 }}>
        Product ID: {productId}
      </p>

      <div style={{ marginBottom: 16 }}>
        <label>Video (render DONE)</label>
        <br />
        <select
          value={videoId}
          onChange={e => setVideoId(e.target.value)}
        >
          <option value="">-- Select video --</option>

          {videos.map(v => (
            <option key={v.id} value={v.id}>
              {v.id.slice(0, 8)}…
            </option>
          ))}
        </select>

        {videos.length === 0 && (
          <p style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
            ⚠️ Chưa có video DONE cho sản phẩm này
          </p>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <label>Post At</label>
        <br />
        <input
          type="datetime-local"
          value={postAt}
          onChange={e => setPostAt(e.target.value)}
        />
      </div>

      <button onClick={submit}>Create</button>
    </div>
  )
}
