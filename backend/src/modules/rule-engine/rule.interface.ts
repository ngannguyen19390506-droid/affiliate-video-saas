// src/modules/rule-engine/rule.interface.ts

export interface Rule {
  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig
  ): RuleResult | null;
}

export interface ProductMetrics {
  productId: string;
  postedVideos: number;
  testDays: number;
  avgViews: number;
  totalClicks: number;
  hasOrder: boolean;
}

export interface RuleConfig {
  MIN_VIDEO_TEST: number;
  MAX_TEST_DAYS: number;
  STOP_LOSS_VIDEO: number;
  VIEW_THRESHOLD: number;
}

export type ProductStatus = 'TEST' | 'CONTINUE' | 'STOP';

export interface RuleResult {
  action: RuleAction;
  reason: string;
  priority: number;

  // 🔽 THÊM 2 FIELD NÀY
  allowSchedule: boolean;
  nextProductStatus: ProductStatus;
}


export enum RuleAction {
  MAKE_MORE_VIDEOS = 'MAKE_MORE_VIDEOS',
  CONTINUE_PRODUCT = 'CONTINUE_PRODUCT',
  STOP_PRODUCT = 'STOP_PRODUCT',
  STOP_LOSS = 'STOP_LOSS',
}
