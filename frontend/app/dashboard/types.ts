export type DailyActionType =
  | 'MAKE_MORE_VIDEOS'
  | 'SCALE_FORMAT'
  | 'STOP_PRODUCT'
  | 'RETEST_WITH_NEW_FORMAT'

export type DailyActionStatus =
  | 'PENDING'
  | 'DONE'
  | 'SKIPPED'

export interface DailyAction {
  id: string                // ⭐ BẮT BUỘC
  actionType: DailyActionType // ⭐ đổi từ `action`
  productId: string
  productName: string
  reason: string
  priority: number
  status: DailyActionStatus  // ⭐ để sau này mở rộng
  createdAt?: string
}
