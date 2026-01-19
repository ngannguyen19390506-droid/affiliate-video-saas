'use client'

import { useEffect, useState } from 'react'
import type { VideoProject } from '../types'

import VideoProgress from './VideoProgress'
import { VideoPreview } from './VideoPreview'
import { RenderLog } from './RenderLog'

type Props = {
  initialVideo: VideoProject
  videoId: string
}

export default function VideoDetailClient({
  initialVideo,
  videoId,
}: Props) {
  const [video, setVideo] =
    useState<VideoProject>(initialVideo)

  async function refetch() {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/video-projects/${videoId}`,
      { cache: 'no-store' },
    )
    if (!res.ok) return
    const data = await res.json()
    setVideo(data)
  }

  // 🔁 POLLING KHI ĐANG RENDERING
  useEffect(() => {
    if (video.renderStatus !== 'RENDERING') return

    const timer = setInterval(refetch, 3000)
    return () => clearInterval(timer)
  }, [video.renderStatus])

  return (
    <div className="space-y-6">
      {/* STATUS + PROGRESS */}
      <VideoProgress video={video} />

      {/* PREVIEW */}
      <section className="border rounded p-4">
        <VideoPreview
          outputVideo={video.outputVideo ?? null}
        />
      </section>

      {/* LOGS */}
      <section className="border rounded p-4">
        <h2 className="font-medium mb-2">
          Render logs
        </h2>

        <RenderLog
          logs={video.renderLogs ?? []}
          isRendering={
            video.renderStatus === 'RENDERING'
          }
        />
      </section>
    </div>
  )
}
