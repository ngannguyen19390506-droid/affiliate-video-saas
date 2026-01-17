export const dynamic = 'force-dynamic'
export const revalidate = 0

import VideoProgress from '../components/VideoProgress'
import { VideoPreview } from '../components/VideoPreview'
import type { VideoProject } from '../types'

async function fetchVideoProject(
  id: string,
): Promise<VideoProject | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined')
  }

  const res = await fetch(
    `${baseUrl}/video-projects/${id}`,
    { cache: 'no-store' },
  )

  // ✅ CASE 404 → chưa có project
  if (res.status === 404) {
    console.log('[VideoDetail] project not found yet')
    return null
  }

  // ❌ các lỗi khác vẫn là lỗi thật
  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `FAILED_TO_FETCH_VIDEO_PROJECT (${res.status}): ${text}`,
    )
  }

  const text = await res.text()
  if (!text) return null

  return JSON.parse(text)
}



export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // ✅ params là Promise trong Next 15+
  const { id } = await params
  console.log('[VideoDetailPage] route param id =', id)

  const video = await fetchVideoProject(id)
  console.log('[VideoDetailPage] video result =', video)

  // ✅ Trạng thái an toàn khi BE chưa return data
  if (!video) {
    return (
      <div className="max-w-3xl mx-auto p-6 space-y-4">
        <h1 className="text-xl font-semibold">Video đang xử lý</h1>
        <p className="text-gray-500">
          ⏳ Video chưa sẵn sàng. Vui lòng chờ trong giây lát...
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <VideoProgress video={video} />
      <VideoPreview outputVideo={video.outputVideo ?? null} />
    </div>
  )
}
