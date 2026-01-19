'use client'

import { StatusBadge } from '@/app/components/StatusBadge'
import { ProgressBar } from './ProgressBar'
import { RenderStep } from './RenderStep'
import type { VideoProject } from '../types'

type Props = {
  video: VideoProject
}

export default function VideoProgress({ video }: Props) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">
          Video Render
        </h1>

        <StatusBadge status={video.renderStatus} />
      </div>

      {/* Progress */}
      <ProgressBar value={video.renderProgress ?? 0} />

      {/* Current step */}
      <RenderStep step={video.renderStep ?? ''} />

      {/* Error */}
      {video.renderStatus === 'FAILED' && (
        <div className="text-red-600 text-sm">
          ❌ {video.errorMessage ?? 'Render failed'}
        </div>
      )}
    </div>
  )
}
