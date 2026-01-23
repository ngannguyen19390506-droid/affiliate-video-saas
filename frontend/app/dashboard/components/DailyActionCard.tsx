'use client'

import { useRouter } from 'next/navigation'
import { DailyAction, DailyActionType } from '../types'

const ACTION_LABEL: Record<DailyActionType, string> = {
  MAKE_MORE_VIDEOS: 'Tạo video',
  SCALE_FORMAT: 'Nhân bản format',
  STOP_PRODUCT: 'Dừng sản phẩm',
  RETEST_WITH_NEW_FORMAT: 'Tạo video mới',
}

type Props = {
  action: DailyAction
  onDone: (id: string) => void
  onSkip: (id: string) => void
}

export default function DailyActionCard({
  action,
  onDone,
  onSkip,
}: Props) {
  const router = useRouter()

  // ✅ Guard: chỉ xử lý action PENDING
  if (action.status !== 'PENDING') {
    return null
  }

  function handlePrimaryAction() {
    if (
      action.actionType === 'MAKE_MORE_VIDEOS' ||
      action.actionType === 'RETEST_WITH_NEW_FORMAT' ||
      action.actionType === 'SCALE_FORMAT'
    ) {
      router.push(
        `/video/create?productId=${action.productId}&actionType=${action.actionType}&dailyActionId=${action.id}`
      )
      return
    }

    if (action.actionType === 'STOP_PRODUCT') {
      onDone(action.id)
    }
  }

  return (
    <div className="border rounded-lg p-4 flex justify-between items-start bg-white">
      <div>
        <h3 className="font-medium">{action.productName}</h3>
        <p className="text-sm text-gray-500 mt-1">
          {action.reason}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handlePrimaryAction}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {ACTION_LABEL[action.actionType]}
        </button>

        <button
          onClick={() => onSkip(action.id)}
          className="text-xs text-gray-400 hover:underline"
        >
          Bỏ qua hôm nay
        </button>
      </div>
    </div>
  )
}
