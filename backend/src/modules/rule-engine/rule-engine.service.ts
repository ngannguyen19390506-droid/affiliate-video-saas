import { Injectable } from '@nestjs/common';

import {
  Rule,
  ProductMetrics,
  RuleConfig,
  RuleResult,
  RuleAction,
} from './rule.interface';

import { StopLossRule } from './rules/stop-loss.rule';
import { TestNotEnoughRule } from './rules/test-not-enough.rule';
import { ShouldContinueRule } from './rules/should-continue.rule';
import { ShouldStopRule } from './rules/should-stop.rule';

@Injectable()
export class RuleEngineService {
  private readonly rules: Rule[];

  constructor() {
    /**
     * Thứ tự chỉ để đọc dễ hiểu
     * Quyết định cuối cùng dựa vào:
     * - HARD STOP (STOP_LOSS)
     * - priority
     */
    this.rules = [
      new StopLossRule(),        // HARD RULE
      new TestNotEnoughRule(),   // SOFT RULE
      new ShouldContinueRule(),  // SOFT RULE
      new ShouldStopRule(),      // SOFT RULE
    ];
  }

  evaluate(
    metrics: ProductMetrics,
    config: RuleConfig,
  ): RuleResult | null {

    const softResults: RuleResult[] = [];

    for (const rule of this.rules) {
      const result = rule.evaluate(metrics, config);

      if (!result) {
        continue;
      }

      /**
       * 🔥 HARD STOP RULE
       * STOP_LOSS = match là return ngay
       */
      if (result.action === RuleAction.STOP_LOSS) {
        return result;
      }

      softResults.push(result);
    }

    if (softResults.length === 0) {
      return null;
    }

    /**
     * priority càng nhỏ càng quan trọng
     */
    softResults.sort((a, b) => a.priority - b.priority);

    return softResults[0];
  }
}
