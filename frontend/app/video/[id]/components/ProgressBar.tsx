export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm text-gray-600">
        <span>Progress</span>
        <span>{value}%</span>
      </div>

      <div className="w-full h-3 bg-gray-200 rounded overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-500"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
