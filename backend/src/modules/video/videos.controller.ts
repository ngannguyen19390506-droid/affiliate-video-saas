import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common'

import { PrismaService } from '../../common/prisma/prisma.service'
import { VideoOrchestratorService } from './video-orchestrator.service'
import { RenderFromImageInput } from './dto/render-from-image.input'
import { RenderVideoOutput } from './dto/render-video.output'

@Controller('videos')
export class VideosController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly videoOrchestrator: VideoOrchestratorService,
  ) {}

  /* =====================================================
   * POST /videos/render
   * Render video end-to-end
   * ===================================================== */
  @Post('render')
  async renderVideo(
    @Body() body: RenderFromImageInput,
  ): Promise<RenderVideoOutput> {
    try {
      return await this.videoOrchestrator.renderFromImage(body)
    } catch (err: any) {
      const message =
        typeof err?.message === 'string'
          ? err.message
          : 'UNKNOWN_ERROR'

      if (
        message === 'TEXT_EMPTY' ||
        message.startsWith('IMAGE_NOT_FOUND')
      ) {
        throw new HttpException(
          message,
          HttpStatus.BAD_REQUEST,
        )
      }

      if (
        message === 'SCRIPT_GENERATION_FAILED' ||
        message.startsWith('TTS_') ||
        message.startsWith('FFMPEG_') ||
        message === 'VIDEO_RENDER_FAILED'
      ) {
        throw new HttpException(
          message,
          HttpStatus.UNPROCESSABLE_ENTITY,
        )
      }

      console.error('[VideosController] UNHANDLED ERROR', err)
      throw new HttpException(
        'INTERNAL_SERVER_ERROR',
        HttpStatus.INTERNAL_SERVER_ERROR,
      )
    }
  }

  /* =====================================================
   * GET /videos
   * Query videos for FE (dropdown)
   * ===================================================== */
  @Get()
  async getVideos(
    @Query('renderStatus') renderStatus?: string,
  ) {
    return this.prisma.video.findMany({
      where: renderStatus
        ? { renderStatus }
        : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}
