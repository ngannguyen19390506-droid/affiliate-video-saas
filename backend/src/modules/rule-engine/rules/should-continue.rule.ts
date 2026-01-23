import {
  Rule,
  ProductMetrics,
  RuleConfig,
  RuleResult,
  RuleAction,
} from '../rule.interface';

export class ShouldContinueRule implements Rule {
  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig
  ): RuleResult | null {

    const hasEnoughVideos =
      metrics.postedVideos >= config.MIN_VIDEO_TEST;

    const hasPositiveSignal =
      metrics.avgViews >= config.VIEW_THRESHOLD ||
      metrics.totalClicks > 0;

    if (hasEnoughVideos && hasPositiveSignal) {
      return {
        action: RuleAction.SCALE_FORMAT,
        reason: 'Có tín hiệu tốt (view hoặc click)',
        priority: 2,

        /**
         * CONTINUE ≠ spam video ngay
         * Quyết định schedule cụ thể để Daily Action xử lý
         */
        nextProductStatus: 'CONTINUE',
      };
    }

    return null;
  }
}
