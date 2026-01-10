import { Injectable } from '@nestjs/common';
import { ProductMetrics } from '../rule-engine/rule.interface';

@Injectable()
export class ProductMetricsService {
  /**
   * Convert product + videos data to ProductMetrics
   * PURE FUNCTION – không query DB
   */
  buildMetrics(input: {
    productId: string;
    createdAt: Date;
    videos: Array<{
      views: number;
      clicks: number;
    }>;
  }): ProductMetrics {
    const postedVideos = input.videos.length;

    const totalClicks = input.videos.reduce(
      (sum, video) => sum + (video.clicks || 0),
      0,
    );

    const totalViews = input.videos.reduce(
      (sum, video) => sum + (video.views || 0),
      0,
    );

    const avgViews =
      postedVideos === 0
        ? 0
        : Math.round(totalViews / postedVideos);

    const testDays = Math.ceil(
      (Date.now() - input.createdAt.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return {
      productId: input.productId,
      postedVideos,
      testDays,
      avgViews,
      totalClicks,
      hasOrder: false, // MVP: chưa tracking order
    };
  }
}
