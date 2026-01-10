import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'

import { TtsService } from '../tts/tts.service'
import { ScriptService } from './script.service'
import { CaptionService } from './caption.service'
import { VoiceService } from './voice.service'
import { VideoRenderService } from './video-render.service'

import { RenderFromImageInput } from './dto/render-from-image.input'
import { RenderVideoOutput } from './dto/render-video.output'
import { ScriptResult } from './script.schema'
import { CaptionResult } from './caption.schema'

@Injectable()
export class VideoOrchestratorService {
  constructor(
    private readonly ttsService: TtsService,
    private readonly scriptService: ScriptService,
    private readonly captionService: CaptionService,
    private readonly voiceService: VoiceService,
    private readonly videoRenderService: VideoRenderService,
  ) {}

  /* =====================================================
   * helper: retry
   * ===================================================== */
  private async retry<T>(
    fn: () => Promise<T>,
    retries: number,
    label: string,
  ): Promise<T> {
    let lastErr: any
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn()
      } catch (err) {
        lastErr = err
        console.warn(
          `[VideoOrchestrator][Retry] ${label} failed (${i + 1}/${retries + 1})`,
        )
      }
    }
    throw lastErr
  }

  /* =====================================================
   * helper: timeout
   * ===================================================== */
  private async withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    label: string,
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${label}_TIMEOUT`)),
          ms,
        ),
      ),
    ])
  }

  /* =====================================================
   * Orchestrate full flow:
   * Script → Caption → Voice → TTS → FFmpeg render
   * ===================================================== */
  async renderFromImage(
    input: RenderFromImageInput,
  ): Promise<RenderVideoOutput> {
    console.log('[VideoOrchestrator] INPUT', {
      imagePath: input.imagePath,
      outputPath: input.outputPath,
      textLength: input.text?.length,
    })

    /* =========================
     * 1️⃣ Validate input
     * ========================= */
    if (!input.text || input.text.trim().length === 0) {
      throw new Error('TEXT_EMPTY')
    }

    if (!fs.existsSync(input.imagePath)) {
      throw new Error(`IMAGE_NOT_FOUND: ${input.imagePath}`)
    }

    /* =========================
     * Prepare temp audio path
     * ========================= */
    const tmpDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }

    const audioPath = path.join(
      tmpDir,
      `voice-${Date.now()}-${randomUUID()}.mp3`,
    )

    let script: ScriptResult
    let caption: CaptionResult

    try {
      /* =========================
       * 2️⃣ Generate script
       * ========================= */
      const scriptResult =
        await this.scriptService.generate(input.text)

      if (
        !scriptResult ||
        typeof scriptResult !== 'object' ||
        !('hook' in scriptResult) ||
        !('body' in scriptResult) ||
        !('cta' in scriptResult)
      ) {
        throw new Error('SCRIPT_GENERATION_FAILED')
      }

      script = scriptResult as ScriptResult

      /* =========================
       * 3️⃣ Generate caption
       * ========================= */
      caption =
        this.captionService.generateCaption(script)

      /* =========================
       * 4️⃣ Prepare voice script
       * ========================= */
      const voiceScript =
        this.voiceService.generateVoiceScript(script)

      const voiceText = voiceScript.sentences
        .map(s => s.text)
        .join(' ')

      /* =========================
       * 5️⃣ TTS (retry + timeout)
       * ========================= */
      await this.retry(
        () =>
          this.withTimeout(
            this.ttsService.generateVoice(
              voiceText,
              audioPath,
            ),
            20_000,
            'TTS',
          ),
        2,
        'TTS',
      )

      if (!fs.existsSync(audioPath)) {
        throw new Error('TTS_OUTPUT_NOT_FOUND')
      }

      /* =========================
       * 6️⃣ FFmpeg render
       * ========================= */
      await this.retry(
        () =>
          this.withTimeout(
            this.videoRenderService.renderFromImage({
              imagePath: input.imagePath,
              audioPath,
              outputPath: input.outputPath,
            }),
            60_000,
            'FFMPEG',
          ),
        1,
        'FFMPEG',
      )

      /* =========================
       * 7️⃣ Return result
       * ========================= */
      return {
        videoPath: input.outputPath,
        caption,
        script,
      }
    } finally {
      /* =========================
       * 8️⃣ Cleanup temp audio
       * ========================= */
      try {
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath)
          console.log(
            '[VideoOrchestrator] CLEANUP audio',
            audioPath,
          )
        }
      } catch (e) {
        console.warn(
          '[VideoOrchestrator] CLEANUP FAILED',
          e,
        )
      }
    }
  }
}
