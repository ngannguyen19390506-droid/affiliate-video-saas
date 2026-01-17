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
   * CREATE VIDEO PROJECT (DRAFT + AI CONTENT)
   * =========================
   */
  @Post()
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      dest: 'uploads',
    }),
  )
  async create(
    @UploadedFiles() files: any[],
    @Body()
    body: {
      workspaceId?: string
      productId: string
      platform: 'TIKTOK' | 'FACEBOOK'
      type: 'SELL' | 'BUILD'
      template: string
      formatId?: string
      inputMedia?: any
      userPrompt?: string
    },
  ) {
    const workspaceId = body.workspaceId ?? 'TEMP_WORKSPACE_ID'

    let inputMedia: any[]

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

    // 1️⃣ Create DRAFT project
    const project = await this.videoProjectService.createDraft({
      workspaceId, // ✅ FIX
      productId: body.productId,
      platform: body.platform,
      type: body.type,
      template: body.template,
      formatId: body.formatId,
      inputMedia,
    })

    // 2️⃣ Generate AI content
    await this.videoProjectService.generateContent(
      project.id,
      body.userPrompt,
    )

    // 3️⃣ Return FULL draft
    return this.videoProjectService.getById(project.id)
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
   * GET DETAIL
   * =========================
   */
  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.videoProjectService.getById(id)
  }

  /**
   * =========================
   * LIST (workspace-aware)
   * =========================
   */
  @Get()
  async list(
    @Query('status') status?: VideoProjectStatus,
    @Query('workspaceId') workspaceId?: string,
  ) {
    return this.videoProjectService.list({
      workspaceId: workspaceId ?? 'TEMP_WORKSPACE_ID', // ✅ FIX
      status,
    })
  }
}
