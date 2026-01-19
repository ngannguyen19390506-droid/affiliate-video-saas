// ==============================
// Video render log
// ==============================
export type RenderLogItem = {
  /** Render step, ex: SCRIPT | TTS | RENDER | UPLOAD */
  step: string

  /** Log message (raw text, FFmpeg log, error, info, ...) */
  message: string

  /** ISO timestamp */
  at: string
}

// ==============================
// Video project (detail page)
// ==============================
export type VideoProject = {
  id: string

  // ===== render job status =====
  renderStatus: 'PENDING' | 'RENDERING' | 'DONE' | 'FAILED'
  renderProgress: number
  renderStep?: string | null

  /** Append-only render logs */
  renderLogs?: RenderLogItem[]

  // ===== output =====
  outputVideo?: string | null
  errorMessage?: string | null

  // ===== content (for preview / debug) =====
  scriptData?: {
    hook: string
    body: string[]
    cta: string
  }
  caption?: string | null
}
