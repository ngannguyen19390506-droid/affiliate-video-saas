import {
  Rule,
  ProductMetrics,
  RuleConfig,
  RuleResult,
  RuleAction,
} from '../rule.interface';

export class TestNotEnoughRule implements Rule {
  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig
  ): RuleResult | null {

    if (metrics.postedVideos < config.MIN_VIDEO_TEST) {
      return {
        action: RuleAction.MAKE_MORE_VIDEOS,
        reason: 'Chưa đủ số video để đánh giá sản phẩm',
        priority: 1,
        nextProductStatus: 'TEST',
      };
    }

    return null;
  }
}
