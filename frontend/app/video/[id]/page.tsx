export const dynamic = 'force-dynamic'
export const revalidate = 0
import VideoProgress from '../components/VideoProgress'
import { VideoPreview } from '../components/VideoPreview'

type VideoProject = {
  id: string
  renderStatus: 'PENDING' | 'RENDERING' | 'DONE' | 'FAILED'
  outputVideo?: string | null
}

async function fetchVideoProject(id: string): Promise<VideoProject> {
  const baseUrl = process.env.API_BASE_URL

  if (!baseUrl) {
    throw new Error('API_BASE_URL is not defined')
  }

  const res = await fetch(
    `${baseUrl}/video-projects/${id}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    throw new Error(`FAILED_TO_FETCH_VIDEO_PROJECT (${res.status})`)
  }

  return res.json()
}

export default async function VideoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const video = await fetchVideoProject(id)

 const previewUrl =
  video.renderStatus === 'DONE' && video.outputVideo
    ? `http://localhost:3000${video.outputVideo}`
    : null

  // 🔥 SERVER LOG
  console.log('[VideoDetailPage] previewUrl =', previewUrl)

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <VideoProgress videoId={id} />

      {previewUrl && <VideoPreview videoUrl={previewUrl} />}
    </div>
  )
}
