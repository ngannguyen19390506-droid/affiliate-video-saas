import {
  Rule,
  ProductMetrics,
  RuleConfig,
  RuleResult,
  RuleAction,
} from '../rule.interface';

export class ShouldStopRule implements Rule {
  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig
  ): RuleResult | null {

    if (
      metrics.postedVideos >= config.MIN_VIDEO_TEST &&
      metrics.testDays >= config.MAX_TEST_DAYS &&
      metrics.totalClicks === 0
    ) {
      return {
        action: RuleAction.STOP_PRODUCT,
        reason: 'Test đủ số video và thời gian nhưng không có click',
        priority: 3,
        nextProductStatus: 'STOP',
      };
    }

    return null;
  }
}
