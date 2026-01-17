export type RenderLogItem = {
  step: string
  message: string
  at: string
}

export type VideoProject = {
  id: string

  // ===== render status =====
  renderStatus: 'IDLE' | 'PENDING' | 'RENDERING' | 'DONE' | 'FAILED'
  renderProgress: number
  renderStep?: string | null
  renderLogs?: Record<string, RenderLogItem>

  // ===== output =====
  outputVideo?: string | null
  errorMessage?: string | null

  // ===== content =====
  scriptData?: {
    hook: string
    body: string[]
    cta: string
  }
  caption?: string | null
}
