import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { VideoProjectService } from './video-project.service'
import { VideoProjectStatus } from '@prisma/client'

@Controller('video-projects')
export class VideoProjectController {
  constructor(
    private readonly videoProjectService: VideoProjectService,
  ) {}

  /**
   * =========================
   * CREATE VIDEO PROJECT
   * =========================
   * Support:
   * 1️⃣ multipart upload
   * 2️⃣ raw inputMedia JSON
   */
  @Post()
  @UseInterceptors(
  FilesInterceptor('files', 1, {
    dest: 'uploads', // 🔥 BẮT BUỘC
  }),
)
  async create(
    @UploadedFiles() files: any[],
    @Body()
    body: {
      productId: string
      platform: 'TIKTOK' | 'FACEBOOK'
      type: 'SELL' | 'BUILD'
      template: string
      formatId?: string
      inputMedia?: any
    },
  ) {
    let inputMedia: any

    if (files && files.length > 0) {
      // MODE 1: multipart upload
      inputMedia = files.map((f) => ({
        path: f.path,
        mimeType: f.mimetype,
      }))
    } else if (body.inputMedia) {
      // MODE 2: JSON input
      inputMedia = body.inputMedia
    } else {
      throw new Error('INPUT_MEDIA_REQUIRED')
    }

    return this.videoProjectService.createDraft({
      productId: body.productId,
      platform: body.platform,
      type: body.type,
      template: body.template,
      formatId: body.formatId,
      inputMedia,
    })
  }

  /**
   * =========================
   * GENERATE AI CONTENT
   * =========================
   */
  @Post(':id/generate')
  async generate(
    @Param('id') id: string,
    @Body() body: { userPrompt?: string },
  ) {
    return this.videoProjectService.generateContent(
      id,
      body.userPrompt,
    )
  }

  /**
   * =========================
   * UPDATE CONTENT (manual edit)
   * =========================
   */
  @Patch(':id/content')
  async updateContent(
    @Param('id') id: string,
    @Body()
    body: {
      scriptData?: any
      voiceScript?: any
      caption?: string | null
    },
  ) {
    return this.videoProjectService.updateContent(id, body)
  }

  /**
   * =========================
   * START RENDER (ASYNC)
   * =========================
   */
  @Post(':id/render')
  async render(@Param('id') id: string) {
    await this.videoProjectService.renderAsync(id)
    return { status: 'RENDERING' }
  }

  /**
   * =========================
   * RETRY / RESUME RENDER
   * =========================
   */
  @Post(':id/retry')
  async retry(@Param('id') id: string) {
    return this.videoProjectService.retryRender(id)
  }

  /**
   * =========================
   * GET DETAIL (for FE polling)
   * =========================
   */
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.videoProjectService.getById(id)
  }

  /**
   * =========================
   * LIST
   * =========================
   */
  @Get()
  async list(@Query('status') status?: VideoProjectStatus) {
    return this.videoProjectService.list(status)
  }
}
