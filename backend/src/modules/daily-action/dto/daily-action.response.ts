export type ProductStatus = 'TEST' | 'CONTINUE' | 'STOP';

export type DailyActionType =
  | 'MAKE_MORE_VIDEOS'
  | 'SCALE_FORMAT'
  | 'STOP_PRODUCT';

export interface DailyActionResponse {
  id: string;

  product: {
  id: string;
  status: ProductStatus;
};


  action: {
    type: DailyActionType;
    label: string;
  };

  reason: string;
  priority: number;

  meta: {
    canMarkDone: boolean;
  };
}
