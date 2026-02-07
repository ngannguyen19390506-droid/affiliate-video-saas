'use client'

import DailyActionItem from './DailyActionItem'
import { useDailyActions } from './useDailyActions'

/**
 * MVP NOTE
 * - Không xử lý onboarding
 * - Không redirect
 * - Không video logic
 * - Chỉ: fetch → render → mark done → refresh
 */

const WORKSPACE_ID = 'workspace-demo' // MVP: hardcode, thay sau

export default function DailyActions() {
  const {
    actions,
    loading,
    error,
    markDone,
    refreshing,
  } = useDailyActions(WORKSPACE_ID)

  /* ======================
     LOADING
  ====================== */
  if (loading) {
    return (
      <div className="mt-6 rounded-xl border p-4 bg-white">
        <p className="text-sm text-gray-500">Đang tải việc hôm nay...</p>
      </div>
    )
  }

  /* ======================
     ERROR
  ====================== */
  if (error) {
    return (
      <div className="mt-6 rounded-xl border p-4 bg-red-50">
        <p className="text-sm text-red-600">
          ❌ Không thể tải Daily Actions
        </p>
        <p className="text-xs text-red-500 mt-1">{error}</p>
      </div>
    )
  }

  /* ======================
     EMPTY STATE
  ====================== */
  if (actions.length === 0) {
    return (
      <div className="mt-6 rounded-xl border p-4 bg-green-50">
        <p className="text-green-700 font-medium">
          🎉 Hôm nay không có việc cần làm
        </p>
        <p className="text-sm text-green-600 mt-1">
          Bạn đang đi đúng hướng rồi đó.
        </p>
      </div>
    )
  }

  /* ======================
     LIST
  ====================== */
  return (
    <div className="mt-6 rounded-xl border p-4 bg-white">
      <h2 className="font-semibold mb-3">
        📋 Việc cần làm hôm nay
      </h2>

      <ul className="space-y-3">
        {actions.map((action) => (
          <DailyActionItem
            key={action.id}
            action={action}
            onDone={() => markDone(action.id)}
            disabled={refreshing}
          />
        ))}
      </ul>

      {refreshing && (
        <p className="mt-3 text-xs text-gray-400">
          Đang cập nhật danh sách...
        </p>
      )}
    </div>
  )
}
