export function RenderLog({
  logs,
}: {
  logs: { step: string; message: string; at: string }[]
}) {
  return (
    <div className="bg-gray-50 border rounded p-3 text-sm max-h-64 overflow-auto space-y-2">
      {logs.map((log, idx) => (
        <div key={idx}>
          <div className="text-gray-500 text-xs">
            [{log.step}] {new Date(log.at).toLocaleTimeString()}
          </div>
          <div className="text-gray-800">
            {log.message}
          </div>
        </div>
      ))}
    </div>
  )
}
