export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { VideoProject } from './types'
import { revalidatePath } from 'next/cache'
import VideoDetailClient from './components/VideoDetailClient'

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

  if (res.status === 404) return null

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `FAILED_TO_FETCH_VIDEO_PROJECT (${res.status}): ${text}`,
    )
  }

  return res.json()
}

/**
 * 🔁 Server Action: Retry render
 */
async function retryRender(id: string) {
  'use server'

  const baseUrl = process.env.NEXT_PUBLIC_API_URL
  if (!baseUrl) {
    throw new Error('NEXT_PUBLIC_API_URL is not defined')
  }

  await fetch(`${baseUrl}/video-projects/${id}/retry`, {
    method: 'POST',
  })

  revalidatePath(`/video/${id}`)
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = await fetchVideoProject(id)

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
      <VideoDetailClient
        initialVideo={video}
        videoId={id}
      />

      {/* 🔁 RETRY */}
      {video.renderStatus === 'FAILED' && (
        <form action={retryRender.bind(null, video.id)}>
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Retry render
          </button>
        </form>
      )}
    </div>
  )
}
