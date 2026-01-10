import {
  Rule,
  ProductMetrics,
  RuleConfig,
  RuleResult,
  RuleAction,
} from '../rule.interface';

export class StopLossRule implements Rule {
  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig
  ): RuleResult | null {

    if (
      metrics.postedVideos >= config.STOP_LOSS_VIDEO &&
      metrics.totalClicks === 0
    ) {
      return {
        action: RuleAction.STOP_LOSS,
        reason: 'Cắt lỗ: quá nhiều video nhưng không mang lại click',
        priority: 0,

        // 🔽 BẮT BUỘC THÊM
        allowSchedule: false,
        nextProductStatus: 'STOP',
      };
    }

    return null;
  }
}
