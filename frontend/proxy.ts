import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const url = req.nextUrl

  // Chỉ proxy cho /video/*.mp4
  if (!url.pathname.startsWith('/video/')) {
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
