import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

type RenderFromImageParams = {
  imagePath: string;
  audioPath: string;
  outputPath: string;
};

@Injectable()
export class VideoRenderService {
  /**
   * Render video from image + audio using FFmpeg
   * - resolve ONLY when ffmpeg exit code === 0
   * - reject on non-zero exit code
   * - reject on timeout
   */
  renderFromImage(params: RenderFromImageParams): Promise<void> {
    const { imagePath, audioPath, outputPath } = params;

    return new Promise((resolve, reject) => {
      /* ===========================
       * Validate input files
       * =========================== */
      if (!fs.existsSync(imagePath)) {
        return reject(new Error(`IMAGE_NOT_FOUND: ${imagePath}`));
      }

      if (!fs.existsSync(audioPath)) {
        return reject(new Error(`AUDIO_NOT_FOUND: ${audioPath}`));
      }

      /* ===========================
       * Ensure output directory
       * =========================== */
      const outputDir = path.dirname(outputPath);
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      /* ===========================
       * FFmpeg command
       * =========================== */
      const args = [
        '-y', // overwrite
        '-loop', '1',
        '-i', imagePath,
        '-i', audioPath,
        '-c:v', 'libx264',
        '-tune', 'stillimage',
        '-c:a', 'aac',
        '-b:a', '192k',
        '-pix_fmt', 'yuv420p',
        '-shortest',
        outputPath,
      ];

      console.log('[FFmpeg] spawn ffmpeg', args.join(' '));

      const ffmpeg = spawn('ffmpeg', args, {
        stdio: ['ignore', 'ignore', 'pipe'], // stderr only
      });

      let stderr = '';
      let finished = false;

      /* ===========================
       * Collect stderr
       * =========================== */
      ffmpeg.stderr.on('data', chunk => {
        stderr += chunk.toString();
      });

      /* ===========================
       * Timeout (60s)
       * =========================== */
      const TIMEOUT_MS = 60_000;

      const timeout = setTimeout(() => {
        if (finished) return;
        finished = true;

        console.error('[FFmpeg] TIMEOUT – killing process');
        ffmpeg.kill('SIGKILL');

        reject(new Error('FFMPEG_TIMEOUT'));
      }, TIMEOUT_MS);

      /* ===========================
       * Exit handling
       * =========================== */
      ffmpeg.on('close', code => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);

        if (code === 0) {
          console.log('[FFmpeg] SUCCESS', outputPath);
          return resolve();
        }

        console.error('[FFmpeg] FAILED', {
          code,
          stderr,
        });

        reject(
          new Error(
            `FFMPEG_FAILED (code=${code})\n${stderr}`,
          ),
        );
      });

      /* ===========================
       * Spawn error
       * =========================== */
      ffmpeg.on('error', err => {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);

        console.error('[FFmpeg] SPAWN ERROR', err);
        reject(new Error(`FFMPEG_SPAWN_ERROR: ${err.message}`));
      });
    });
  }
}
