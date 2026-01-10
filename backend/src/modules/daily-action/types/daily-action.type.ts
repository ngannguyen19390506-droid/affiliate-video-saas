import { RuleAction } from '../../rule-engine/rule.interface';

export interface DailyAction {
  productId: string;
  action: RuleAction;
  reason: string;
  priority: number;
}
