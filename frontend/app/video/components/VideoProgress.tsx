'use client'

import { StatusBadge } from '@/app/components/StatusBadge'
import { ProgressBar } from './ProgressBar'
import { RenderStep } from './RenderStep'
import { RenderLog } from './RenderLog'
import type { VideoProject } from '../types'

type Props = {
  video: VideoProject
}

export default function VideoProgress({ video }: Props) {
  const logs =
    video.renderLogs
      ? Object.values(video.renderLogs)
      : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Video Render
        </h1>

        <StatusBadge
  status={
    video.renderStatus === 'IDLE'
      ? 'PENDING'
      : video.renderStatus
  }
/>

      </div>

      {/* Progress */}
      <ProgressBar value={video.renderProgress ?? 0} />

      {/* Current step */}
      <RenderStep step={video.renderStep ?? ''} />

      {/* Logs */}
      <RenderLog logs={logs} />
    </div>
  )
}
