export enum DailyActionType {
  MAKE_MORE_VIDEOS = 'MAKE_MORE_VIDEOS',
  SCALE_FORMAT = 'SCALE_FORMAT',
  STOP_PRODUCT = 'STOP_PRODUCT',
  RETEST_WITH_NEW_FORMAT = 'RETEST_WITH_NEW_FORMAT',
}

export interface GeneratedAction {
  productId?: string;
  actionType: DailyActionType;
  priority: number;
  reason: string;
  metadata?: Record<string, any>;
}
