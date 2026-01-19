'use client'

import { useEffect, useRef } from 'react'

type RenderLogItem = {
  step: string
  message: string
  at: string
}

export function RenderLog({
  logs,
  isRendering,
}: {
  logs: RenderLogItem[]
  isRendering: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const lastCountRef = useRef<number>(0)

  useEffect(() => {
    if (!isRendering) return
    if (logs.length <= lastCountRef.current) return

    const el = containerRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }

    lastCountRef.current = logs.length
  }, [logs, isRendering])

  return (
    <div
      ref={containerRef}
      className="bg-gray-50 border rounded p-3 text-sm max-h-64 overflow-auto space-y-2"
    >
      {logs.map((log, idx) => (
        <div key={idx}>
          <div className="text-gray-500 text-xs">
            [{log.step}]{' '}
            {new Date(log.at).toLocaleTimeString()}
          </div>
          <div className="text-gray-800">
            {log.message}
          </div>
        </div>
      ))}
    </div>
  )
}
