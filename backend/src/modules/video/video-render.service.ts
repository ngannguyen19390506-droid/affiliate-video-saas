import { Injectable } from '@nestjs/common'
import { spawn } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

type RenderFromImageParams = {
  imagePath: string
  audioPath: string
  outputPath: string
}

@Injectable()
export class VideoRenderService {
  renderFromImage(params: RenderFromImageParams): Promise<void> {
    const { imagePath, audioPath, outputPath } = params

    return new Promise((resolve, reject) => {
      if (!fs.existsSync(imagePath)) {
        return reject(new Error(`IMAGE_NOT_FOUND: ${imagePath}`))
      }
      if (!fs.existsSync(audioPath)) {
        return reject(new Error(`AUDIO_NOT_FOUND: ${audioPath}`))
      }

      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      const args = [
        '-y',
        '-loop', '1',
        '-i', imagePath,
        '-i', audioPath,
        '-r', '30',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-tune', 'stillimage',
        '-vf',
        'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-shortest',
        '-movflags', '+faststart',
        outputPath,
      ]

      const ffmpeg = spawn('ffmpeg', args, {
        stdio: ['ignore', 'ignore', 'pipe'],
      })

      let stderr = ''
      let finished = false

      ffmpeg.stderr.on('data', d => {
        stderr += d.toString()
        if (stderr.length > 8000) stderr = stderr.slice(-8000)
      })

      const timeout = setTimeout(() => {
        if (finished) return
        finished = true
        ffmpeg.kill('SIGKILL')
        reject(new Error('FFMPEG_TIMEOUT'))
      }, 60_000)

      ffmpeg.on('close', code => {
        if (finished) return
        finished = true
        clearTimeout(timeout)

        if (code === 0) return resolve()
        reject(new Error(`FFMPEG_FAILED (${code})\n${stderr}`))
      })

      ffmpeg.on('error', err => {
        if (finished) return
        finished = true
        clearTimeout(timeout)
        reject(err)
      })
    })
  }
}
