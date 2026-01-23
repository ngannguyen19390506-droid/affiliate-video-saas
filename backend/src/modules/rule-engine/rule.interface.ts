// src/modules/rule-engine/rule.interface.ts

export interface Rule {
  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig
  ): RuleResult | null;
}

/**
 * Metrics đầu vào cho Rule Engine
 * → build từ Product + Video[]
 */
export interface ProductMetrics {
  productId: string;
  postedVideos: number;
  testDays: number;
  avgViews: number;
  totalClicks: number;
}

/**
 * Config rule theo workspace
 * → map trực tiếp từ bảng RuleConfig
 */
export interface RuleConfig {
  MIN_VIDEO_TEST: number;
  MAX_TEST_DAYS: number;
  STOP_LOSS_VIDEO: number;
  VIEW_THRESHOLD: number;
}

/**
 * Đồng bộ với Prisma ProductStatus
 */
export type ProductStatus =
  | 'TEST'
  | 'CONTINUE'
  | 'STOP'
  | 'REVISIT';

/**
 * Kết quả đánh giá của 1 rule
 */
export interface RuleResult {
  action: RuleAction;
  reason: string;
  priority: number;

  /**
   * HARD RULE (ví dụ stop loss)
   * → match là return ngay
   */
  hard?: boolean;

  /**
   * Trạng thái product sau khi áp rule
   */
  nextProductStatus: ProductStatus;
}

/**
 * Đồng bộ với DailyActionType (Prisma)
 */
export enum RuleAction {
  MAKE_MORE_VIDEOS = 'MAKE_MORE_VIDEOS',
  SCALE_FORMAT = 'SCALE_FORMAT',
  STOP_PRODUCT = 'STOP_PRODUCT',
  RETEST_WITH_NEW_FORMAT = 'RETEST_WITH_NEW_FORMAT',
}
