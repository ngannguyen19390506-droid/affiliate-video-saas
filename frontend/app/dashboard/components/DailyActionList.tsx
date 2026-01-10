import { DailyAction } from '../types'
import DailyActionCard from './DailyActionCard'

export default function DailyActionList({
  actions,
  onDone,
  onSkip,
}: {
  actions: DailyAction[]
  onDone: (id: string) => void
  onSkip: (id: string) => void
}) {
  if (actions.length === 0) {
    return (
      <div className="mt-6 text-gray-500">
        🎉 Hôm nay không có action nào
      </div>
    )
  }

  return (
    <div className="space-y-4 mt-6">
      {actions.map((action) => (
        <DailyActionCard
          key={action.id}                // ⭐ BẮT BUỘC
          action={action}                // ⭐ explicit
          onDone={onDone}
          onSkip={onSkip}
        />
      ))}
    </div>
  )
}
