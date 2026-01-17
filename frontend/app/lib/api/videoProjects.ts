const API_BASE = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

/**
 * =========================
 * CREATE VIDEO PROJECT
 * =========================
 * multipart/form-data
 * → tạo draft + generate AI content
 */
export async function createVideoProject(formData: FormData) {
  const res = await fetch(`${API_BASE}/video-projects`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Create video project failed: ${text}`)
  }

  return res.json()
}

/**
 * =========================
 * UPDATE CONTENT (manual edit)
 * =========================
 */
export async function updateVideoProjectContent(
  id: string,
  payload: {
    scriptData?: any
    voiceScript?: any
    caption?: string | null
  },
) {
  const res = await fetch(`${API_BASE}/video-projects/${id}/content`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Update content failed: ${text}`)
  }

  return res.json()
}

/**
 * =========================
 * START RENDER (ASYNC)
 * =========================
 */
export async function renderVideoProject(id: string) {
  const res = await fetch(`${API_BASE}/video-projects/${id}/render`, {
    method: 'POST',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Render failed: ${text}`)
  }

  return res.json()
}

/**
 * =========================
 * RETRY RENDER
 * =========================
 */
export async function retryVideoProject(id: string) {
  const res = await fetch(`${API_BASE}/video-projects/${id}/retry`, {
    method: 'POST',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Retry render failed: ${text}`)
  }

  return res.json()
}

/**
 * =========================
 * GET VIDEO PROJECT DETAIL
 * =========================
 * dùng cho:
 * - Video detail page
 * - Progress polling
 */
export async function getVideoProject(id: string) {
  const res = await fetch(`${API_BASE}/video-projects/${id}`, {
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Get video project failed: ${text}`)
  }

  return res.json()
}

/**
 * =========================
 * LIST VIDEO PROJECTS
 * =========================
 */
export async function listVideoProjects(status?: string) {
  const url = status
    ? `${API_BASE}/video-projects?status=${status}`
    : `${API_BASE}/video-projects`

  const res = await fetch(url, {
    cache: 'no-store',
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`List video projects failed: ${text}`)
  }

  return res.json()
}
