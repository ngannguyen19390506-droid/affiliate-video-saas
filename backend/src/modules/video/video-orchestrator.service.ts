import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import * as path from 'path'
import { randomUUID } from 'crypto'
import { RenderStep } from '@prisma/client'

import { TtsService } from '../tts/tts.service'
import { ScriptService } from './script.service'
import { CaptionService } from './caption.service'
import { VoiceService } from './voice.service'
import { VideoRenderService } from './video-render.service'

import { RenderFromImageInput } from './dto/render-from-image.input'
import { RenderVideoOutput } from './dto/render-video.output'
import { ScriptResult } from './script.schema'
import { CaptionResult } from './caption.schema'

/* =====================================================
 * Resume enum (EXPORT BẮT BUỘC)
 * ===================================================== */
export enum ResumeFrom {
  SCRIPT = 'SCRIPT',
  TTS = 'TTS',
  RENDER = 'RENDER',
}

/* =====================================================
 * Progress callback type
 * ===================================================== */
export type RenderProgressFn = (params: {
  step: RenderStep
  progress: number
  message?: string
}) => Promise<void>

function isScriptResult(data: any): data is ScriptResult {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as any).body)
  )
}

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
   * helpers
   * ===================================================== */
  private async retry<T>(
    fn: () => Promise<T>,
    retries: number,
    label: string,
  ): Promise<T> {
    let lastErr: any
    for (let i = 1; i <= retries; i++) {
      try {
        return await fn()
      } catch (e: any) {
        lastErr = e
        console.warn(
          `[VideoOrchestrator][Retry][${label}] ${i}/${retries}`,
          e?.message,
        )
      }
    }
    throw lastErr
  }

  private async withTimeout<T>(
    fn: () => Promise<T>,
    ms: number,
    label: string,
  ): Promise<T> {
    return Promise.race([
      fn(),
      new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${label}_TIMEOUT`)),
          ms,
        ),
      ),
    ])
  }

  /* =====================================================
   * GENERATE CONTENT ONLY (SCRIPT + CAPTION)
   * ===================================================== */
  async generateContentOnly(input: {
    inputMedia: any
    userPrompt?: string | null
  }): Promise<{
    script: ScriptResult
    caption: CaptionResult
  }> {
    const imagePath = Array.isArray(input.inputMedia)
      ? input.inputMedia[0]?.path
      : input.inputMedia?.imagePath

    if (!imagePath) {
      throw new Error('INPUT_MEDIA_INVALID')
    }

    const scriptResult =
      await this.scriptService.generate(
        input.userPrompt || '',
      )

    if (!isScriptResult(scriptResult)) {
      throw new Error('SCRIPT_GENERATION_FAILED')
    }

    const caption =
      this.captionService.generateCaption(scriptResult)

    return {
      script: scriptResult,
      caption,
    }
  }

  /* =====================================================
   * FULL RENDER PIPELINE (RESUME + PROGRESS)
   * ===================================================== */
  async renderVideoProject(input: {
    id: string
    inputMedia: any
    userPrompt?: string | null
    resumeFrom?: ResumeFrom
    cachedScript?: ScriptResult | null
    cachedCaption?: string | null
    onProgress?: RenderProgressFn
  }): Promise<{
    script: ScriptResult
    caption: CaptionResult
    outputVideo: string
  }> {
    const emit = async (
      step: RenderStep,
      progress: number,
      message?: string,
    ) => {
      if (input.onProgress) {
        await input.onProgress({ step, progress, message })
      }
    }

    const imagePath = Array.isArray(input.inputMedia)
      ? input.inputMedia[0]?.path
      : input.inputMedia?.imagePath

    if (!imagePath) {
      throw new Error('INPUT_MEDIA_INVALID')
    }

  /* ======================
 * OUTPUT PATHS (FIXED)
 * ====================== */

// 🔹 TÊN FILE
const outputFilename = `${input.id}.mp4`

// 🔹 PATH LOCAL (CHO FFMPEG + FS)
const localOutputPath = path.join(
  process.cwd(),
  'outputs',
  outputFilename,
)

// 🔹 ENSURE DIR LOCAL (❗ DÙNG LOCAL PATH, KHÔNG DÙNG PUBLIC PATH)
const outputDir = path.dirname(localOutputPath)
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// 🔹 URL PUBLIC (TRẢ CHO FE / DB)
const publicOutputVideo = `/outputs/${outputFilename}`

/* ======================
 * TMP + AUDIO
 * ====================== */

const tmpDir = path.join(process.cwd(), 'tmp')
if (!fs.existsSync(tmpDir)) {
  fs.mkdirSync(tmpDir, { recursive: true })
}

const audioPath = path.join(
  tmpDir,
  `voice-${Date.now()}-${randomUUID()}.mp3`,
)

let script!: ScriptResult
let caption!: CaptionResult

try {
  /* ======================
   * SCRIPT
   * ====================== */
  if (
    input.resumeFrom &&
    input.resumeFrom !== ResumeFrom.SCRIPT &&
    input.cachedScript
  ) {
    script = input.cachedScript
  } else {
    await emit(
      RenderStep.SCRIPTING,
      25,
      'Đang tạo kịch bản',
    )

    const scriptResult =
      await this.scriptService.generate(
        input.userPrompt || '',
      )

    if (!isScriptResult(scriptResult)) {
      throw new Error('SCRIPT_GENERATION_FAILED')
    }

    script = scriptResult
  }


      /* ======================
       * CAPTION
       * ====================== */
      caption =
        input.cachedCaption && input.resumeFrom
          ? {
              text: input.cachedCaption,
              hashtags: [],
            }
          : this.captionService.generateCaption(script)

      /* ======================
       * TTS
       * ====================== */
      if (input.resumeFrom !== ResumeFrom.RENDER) {
        await emit(
          RenderStep.TTS,
          60,
          'Đang tạo giọng đọc',
        )

        const voiceScript =
          this.voiceService.generateVoiceScript(script)

        const voiceText = voiceScript.sentences
          .map(s => s.text)
          .join(' ')

        await this.retry(
          () =>
            this.withTimeout(
              () =>
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
      }

      /* ======================
       * RENDER VIDEO
       * ====================== */
      await emit(
        RenderStep.RENDERING,
        85,
        'Đang render video',
      )

      await this.retry(
        () =>
          this.withTimeout(
            () =>
              this.videoRenderService.renderFromImage({
                imagePath,
                audioPath,
                outputPath: localOutputPath,
              }),
            60_000,
            'FFMPEG',
          ),
        2,
        'FFMPEG',
      )

      await emit(
        RenderStep.DONE,
        100,
        'Render hoàn tất',
      )

      return {
        script,
        caption,
        outputVideo: publicOutputVideo,
      }
    } finally {
      try {
        if (fs.existsSync(audioPath)) {
          fs.unlinkSync(audioPath)
        }
      } catch {}
    }
  }
    /* =====================================================
   * LEGACY SUPPORT (for videos.controller & tests)
   * ===================================================== */
  async renderFromImage(input: {
    imagePath: string
    outputPath: string
    text: string
  }): Promise<{
    videoPath: string
    caption: CaptionResult
    script: ScriptResult
  }> {
    const result = await this.renderVideoProject({
      id: `legacy-${Date.now()}`,
      inputMedia: [{ path: input.imagePath }],
      userPrompt: input.text,
    })

    return {
      videoPath: result.outputVideo,
      caption: result.caption,
      script: result.script,
    }
  }

}
