export function StatusBadge({
  status,
}: {
  status: 'PENDING' | 'DONE' | 'FAILED'
}) {
  const color =
    status === 'DONE'
      ? 'bg-green-100 text-green-700'
      : status === 'FAILED'
      ? 'bg-red-100 text-red-700'
      : 'bg-yellow-100 text-yellow-700'

  return (
    <span
      className={`px-2 py-1 rounded text-sm ${color}`}
    >
      {status}
    </span>
  )
}
