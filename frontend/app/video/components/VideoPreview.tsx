'use client'

type VideoPreviewProps = {
  videoUrl: string
}

export function VideoPreview({ videoUrl }: VideoPreviewProps) {
  // 🔥 LOG QUAN TRỌNG – NHÌN VÀO ĐÂY
  console.log('[VideoPreview] videoUrl =', videoUrl)

  // ❗ Guard: tuyệt đối KHÔNG render nếu URL sai
  if (!videoUrl.startsWith('http')) {
    console.error('[VideoPreview] INVALID videoUrl:', videoUrl)
    return (
      <div className="text-red-600 text-sm">
        ❌ Invalid video URL
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-3">
      <video
        src={videoUrl}
        controls
        preload="metadata"
        className="w-full rounded-lg border"
      />

      <a
        href={videoUrl}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block text-sm text-blue-600 underline"
      >
        ⬇️ Tải video
      </a>
    </div>
  )
}
