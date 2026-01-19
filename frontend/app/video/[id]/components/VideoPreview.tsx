'use client'

type VideoPreviewProps = {
  outputVideo: string | null
}

export function VideoPreview({ outputVideo }: VideoPreviewProps) {
  if (!outputVideo) return null

  const videoUrl =
    `${process.env.NEXT_PUBLIC_API_URL}${outputVideo}`

  console.log('[VideoPreview] videoUrl =', videoUrl)

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
