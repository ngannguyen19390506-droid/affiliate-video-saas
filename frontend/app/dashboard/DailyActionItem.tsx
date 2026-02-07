'use client'

import type { DailyAction } from './useDailyActions'

type Props = {
  action: DailyAction
  onDone: () => void
  disabled?: boolean
}

/**
 * MVP RULE
 * - Chỉ hiển thị
 * - Chỉ có 1 CTA: "Đã làm xong"
 * - Không redirect
 * - Không undo
 * - Không logic phụ
 */
export default function DailyActionItem({
  action,
  onDone,
  disabled = false,
}: Props) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-lg border p-3">
      {/* ===== LEFT INFO ===== */}
      <div className="flex-1">
        {/* Priority + Action */}
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
            {action.priority}
          </span>

          <span className="font-medium text-gray-900">
            {action.actionType}
          </span>
        </div>

        {/* Reason */}
        <p className="mt-1 text-sm text-gray-600">
          {action.reason}
        </p>

        {/* Product */}
        <p className="mt-1 text-xs text-gray-400">
          Sản phẩm: {action.product.name}
        </p>
      </div>

      {/* ===== CTA ===== */}
      <button
        onClick={onDone}
        disabled={disabled}
        className={`shrink-0 rounded-md px-3 py-2 text-sm font-medium
          ${
            disabled
              ? 'cursor-not-allowed bg-gray-200 text-gray-400'
              : 'bg-black text-white hover:bg-gray-800'
          }`}
      >
        Đã làm xong
      </button>
    </li>
  )
}
