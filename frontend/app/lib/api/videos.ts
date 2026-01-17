const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export async function fetchRenderingVideos() {
  const res = await fetch(
    `${API_BASE_URL}/videos?renderStatus=RENDERING`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('FAILED_TO_FETCH_RENDERING_VIDEOS')
  return res.json()
}

export async function fetchDoneVideos(limit = 3) {
  const res = await fetch(
    `${API_BASE_URL}/video-projects?status=DONE&limit=${limit}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    throw new Error('FAILED_TO_FETCH_DONE_VIDEO_PROJECTS')
  }

  return res.json()
}

