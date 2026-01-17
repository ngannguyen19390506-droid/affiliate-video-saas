import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const url = req.nextUrl

  /**
   * =========================
   * CHỈ proxy file video .mp4
   * =========================
   * ✅ /video/abc.mp4  → backend
   * ❌ /video/create   → bỏ qua (Next.js page)
   * ❌ /video/123      → bỏ qua (Next.js page)
   */
  if (
    !url.pathname.startsWith('/video/') ||
    !url.pathname.endsWith('.mp4')
  ) {
    return
  }

  // /video/abc.mp4 → /outputs/abc.mp4
  const targetPath = url.pathname.replace(
    /^\/video\//,
    '/outputs/',
  )

  const targetUrl = `http://localhost:3000${targetPath}`

  return fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
  })
}

export default proxy
