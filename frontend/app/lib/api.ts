import { DailyAction } from '../dashboard/types'

/**
 * ======================
 * Base config
 * ======================
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL is not defined')
}

/**
 * ======================
 * Daily Actions
 * ======================
 */
export async function fetchDailyActions(
  workspaceId: string
): Promise<DailyAction[]> {
  const url = `${API_BASE_URL}/workspaces/${workspaceId}/daily-actions/today`

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Failed to fetch daily actions')
  }

  const raw = await res.json()

  return raw.map((a: any): DailyAction => ({
    id: a.id,
    actionType: a.actionType ?? a.action, // ✅ safe mapping
    productId: a.productId,
    productName: a.productName,
    reason: a.reason,
    priority: a.priority,
    status: a.status ?? 'PENDING',
    createdAt: a.createdAt,
  }))
}

/**
 * ======================
 * Daily Action Control
 * ======================
 */
export async function doneDailyAction(
  dailyActionId: string
) {
  const url = `${API_BASE_URL}/daily-actions/${dailyActionId}/done`

  const res = await fetch(url, { method: 'POST' })

  if (!res.ok) {
    throw new Error('Failed to mark daily action as DONE')
  }

  return res.json()
}

export async function skipDailyAction(
  dailyActionId: string
) {
  const url = `${API_BASE_URL}/daily-actions/${dailyActionId}/skip`

  const res = await fetch(url, { method: 'POST' })

  if (!res.ok) {
    throw new Error('Failed to skip daily action')
  }

  return res.json()
}

/**
 * ======================
 * Video Projects
 * ======================
 */
export type Video = {
  id: string
  productId: string
  renderStatus: 'DONE' | 'PROCESSING' | 'FAILED'
  outputPath: string
}

export async function fetchVideosDone(): Promise<Video[]> {
  const url = `${API_BASE_URL}/videos?renderStatus=DONE`

  const res = await fetch(url, { cache: 'no-store' })

  if (!res.ok) {
    throw new Error('Failed to fetch videos')
  }

  return res.json()
}

/**
 * ======================
 * Post Schedule
 * ======================
 */
export type PostSchedule = {
  id: string
  videoId: string
  scheduledAt: string
  status: 'PENDING' | 'DONE' | 'FAILED'
}

export async function fetchPostSchedules(
  workspaceId: string
): Promise<PostSchedule[]> {
  const res = await fetch(
    `${API_BASE_URL}/post-schedules/${workspaceId}`,
    { cache: 'no-store' }
  )

  if (!res.ok) {
    throw new Error('Failed to fetch post schedules')
  }

  return res.json()
}

export async function createPostSchedule(input: {
  workspaceId: string
  videoId: string
  platform: 'TIKTOK' | 'FACEBOOK'
  scheduledAt: string
  timezone: string
}) {
  const res = await fetch(`${API_BASE_URL}/post-schedules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })

  if (!res.ok) {
    throw new Error('Failed to create post schedule')
  }

  return res.json()
}
