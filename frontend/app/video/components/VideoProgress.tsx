'use client'

import { useEffect, useState } from 'react'
import { StatusBadge } from '@/app/components/StatusBadge'
import { ProgressBar } from './ProgressBar'
import { RenderStep } from './RenderStep'
import { RenderLog } from './RenderLog'

type VideoProject = {
  id: string
  renderStatus: 'PENDING' | 'RENDERING' | 'DONE' | 'FAILED'
  progress: number
  renderStep: string
  logs: {
    step: string
    message: string
    at: string
  }[]
  errorMessage?: string
}

export default function VideoProgress({ videoId }: { videoId: string }) {
  const [data, setData] = useState<VideoProject | null>(null)

  async function fetchData() {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/video-projects/${videoId}`,
        { cache: 'no-store' }
      )

      if (!res.ok) {
        console.warn('Fetch failed:', res.status)
        return
      }

      const contentType = res.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        console.warn('Response is not JSON:', contentType)
        return
      }

      const json = await res.json()

      setData({
        ...json,
        progress: json.renderProgress ?? 0,
        logs: json.renderLogs
          ? Object.values(json.renderLogs)
          : [],
      })
    } catch (err) {
      console.error('fetchData error:', err)
    }
  }

  useEffect(() => {
    fetchData()
    const timer = setInterval(fetchData, 2000)
    return () => clearInterval(timer)
  }, [videoId])

  if (!data) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Video Render</h1>
        <StatusBadge status={data.renderStatus} />
      </div>

      {/* Progress */}
      <ProgressBar value={data.progress} />

      {/* Current step */}
      <RenderStep step={data.renderStep} />

      {/* Logs */}
      <RenderLog logs={data.logs ?? []} />
    </div>
  )
}

