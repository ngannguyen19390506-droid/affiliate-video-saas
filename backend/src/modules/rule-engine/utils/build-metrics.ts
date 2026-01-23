// backend/src/rule-engine/utils/build-metrics.ts

import dayjs from 'dayjs'
import { Product, Video } from '@prisma/client'

export interface ProductMetrics {
  productId: string
  postedVideos: number
  avgViews: number
  totalClicks: number
  testDays: number
}

export function buildMetrics(
  product: Product & { videos: Video[] }
): ProductMetrics {
  const videos = product.videos ?? []

  const postedVideos = videos.length

  const totalViews = videos.reduce(
    (sum, v) => sum + (v.views ?? 0),
    0
  )

  const totalClicks = videos.reduce(
    (sum, v) => sum + (v.clicks ?? 0),
    0
  )

  const avgViews =
    postedVideos > 0
      ? Math.round(totalViews / postedVideos)
      : 0

  // số ngày test = từ ngày tạo product → hôm nay
  const testDays = dayjs().diff(
    dayjs(product.createdAt),
    'day'
  )

  return {
    productId: product.id,
    postedVideos,
    avgViews,
    totalClicks,
    testDays,
  }
}
