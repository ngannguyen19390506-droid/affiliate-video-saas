import { Injectable, NotFoundException } from '@nestjs/common'
import {
  VideoProjectStatus,
  RenderStatus,
  RenderStep,
} from '@prisma/client'
import { PrismaService } from '../../common/prisma/prisma.service'
import {
  VideoOrchestratorService,
  ResumeFrom,
} from '../video/video-orchestrator.service'

@Injectable()
export class VideoProjectService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly orchestrator: VideoOrchestratorService,
  ) {}

  /* =========================
   * CREATE DRAFT
   * ========================= */
  async createDraft(input: {
    workspaceId: string
    productId: string
    platform: 'TIKTOK' | 'FACEBOOK'
    type: 'SELL' | 'BUILD'
    template: string
    formatId?: string
    inputMedia: any
  }) {
    return this.prisma.videoProject.create({
      data: {
        workspaceId: input.workspaceId, // ✅ FIX
        productId: input.productId,
        platform: input.platform,
        type: input.type,
        template: input.template,
        formatId: input.formatId ?? null,
        inputMedia: input.inputMedia,

        status: VideoProjectStatus.DRAFT,
        renderStatus: RenderStatus.PENDING,
        renderProgress: 0,
        priority: 0,
      },
    })
  }

  /* =========================
   * GENERATE CONTENT (AI ONLY)
   * ========================= */
  async generateContent(id: string, userPrompt?: string) {
    const project = await this.prisma.videoProject.findUnique({
      where: { id },
    })

    if (!project) {
      throw new NotFoundException('VIDEO_PROJECT_NOT_FOUND')
    }

    const result =
      await this.orchestrator.generateContentOnly({
        inputMedia: project.inputMedia,
        userPrompt: userPrompt ?? project.userPrompt,
      })

    return this.prisma.videoProject.update({
      where: { id },
      data: {
        status: VideoProjectStatus.GENERATED,
        userPrompt: userPrompt ?? project.userPrompt,
        scriptData: result.script,
        caption: result.caption.text,
      },
    })
  }

  /* =========================
   * UPDATE CONTENT (MANUAL)
   * ========================= */
  async updateContent(
    id: string,
    input: {
      scriptData?: any
      voiceScript?: any
      caption?: string | null
    },
  ) {
    return this.prisma.videoProject.update({
      where: { id },
      data: {
        scriptData: input.scriptData,
        voiceScript: input.voiceScript,
        caption: input.caption ?? null,
      },
    })
  }

  /* =========================
   * START RENDER (ASYNC)
   * ========================= */
  async renderAsync(id: string) {
    const project = await this.prisma.videoProject.findUnique({
      where: { id },
    })

    if (!project) {
      throw new NotFoundException('VIDEO_PROJECT_NOT_FOUND')
    }

    if (project.status === VideoProjectStatus.RENDERING) {
  throw new Error('ALREADY_RENDERING')
}


    const updated = await this.prisma.videoProject.update({
      where: { id },
      data: {
        status: VideoProjectStatus.RENDERING,
        renderStatus: RenderStatus.PENDING,
        renderStep: RenderStep.ANALYZING,
        renderProgress: 0,
        errorMessage: null,
      },
    })

    this.runPipeline(updated).catch(console.error)

    return { status: 'RENDERING' }
  }

  /* =========================
   * RETRY / RESUME RENDER
   * ========================= */
  async retryRender(id: string) {
    const project = await this.prisma.videoProject.findUnique({
      where: { id },
    })

    if (!project) {
      throw new NotFoundException('VIDEO_PROJECT_NOT_FOUND')
    }

    if (project.status !== VideoProjectStatus.FAILED) {
      throw new Error('ONLY_FAILED_CAN_RETRY')
    }

    const resumeFrom =
      project.renderStep === RenderStep.SCRIPTING
        ? ResumeFrom.SCRIPT
        : project.renderStep === RenderStep.TTS
        ? ResumeFrom.TTS
        : ResumeFrom.RENDER

    const updated = await this.prisma.videoProject.update({
      where: { id },
      data: {
        status: VideoProjectStatus.RENDERING,
        renderStatus: RenderStatus.PENDING,
        errorMessage: null,
      },
    })

    this.runPipeline(updated, resumeFrom).catch(console.error)

    return { status: 'RETRYING', resumeFrom }
  }

  /* =========================
   * INTERNAL RENDER PIPELINE
   * ========================= */
  private async runPipeline(
    project: {
      id: string
      inputMedia: any
      userPrompt?: string | null
      scriptData?: any
      caption?: string | null
    },
    resumeFrom?: ResumeFrom,
  ) {
    try {
      const result =
        await this.orchestrator.renderVideoProject({
          id: project.id,
          inputMedia: project.inputMedia,
          userPrompt: project.userPrompt,
          resumeFrom,
          cachedScript: project.scriptData,
          cachedCaption: project.caption,
          onProgress: async ({ step, progress, message }) => {
            await this.updateRenderProgress({
              videoProjectId: project.id,
              step,
              progress,
              message,
            })
          },
        })

      await this.prisma.videoProject.update({
        where: { id: project.id },
        data: {
          status: VideoProjectStatus.DONE,
          renderStatus: RenderStatus.DONE,
          renderStep: RenderStep.DONE,
          renderProgress: 100,
          outputVideo: result.outputVideo,
        },
      })
    } catch (e: any) {
      await this.prisma.videoProject.update({
        where: { id: project.id },
        data: {
          status: VideoProjectStatus.FAILED,
          renderStatus: RenderStatus.FAIL,
          errorMessage: e.message ?? 'UNKNOWN_RENDER_ERROR',
        },
      })
    }
  }

  /* =========================
   * PROGRESS HELPER
   * ========================= */
  async updateRenderProgress(params: {
    videoProjectId: string
    step: RenderStep
    progress: number
    message?: string
  }) {
    const { videoProjectId, step, progress, message } = params

    const project = await this.prisma.videoProject.findUnique({
      where: { id: videoProjectId },
      select: { renderLogs: true },
    })

    const logs = Array.isArray(project?.renderLogs)
      ? project.renderLogs
      : []

    await this.prisma.videoProject.update({
      where: { id: videoProjectId },
      data: {
        renderStep: step,
        renderProgress: progress,
        renderLogs: message
          ? [
              ...logs,
              {
                step,
                message,
                at: new Date().toISOString(),
              },
            ]
          : logs,
      },
    })
  }

  /* =========================
   * QUERY
   * ========================= */
  async getById(id: string) {
    const project = await this.prisma.videoProject.findUnique({
      where: { id },
    })

    if (!project) {
      throw new NotFoundException('VIDEO_PROJECT_NOT_FOUND')
    }

    return project
  }

  async list(params: {
    workspaceId: string
    status?: VideoProjectStatus
  }) {
    return this.prisma.videoProject.findMany({
      where: {
        workspaceId: params.workspaceId, // ✅ FIX
        ...(params.status && { status: params.status }),
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    })
  }
}
