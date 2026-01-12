import { Injectable } from '@nestjs/common'
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
    productId: string
    platform: 'TIKTOK' | 'FACEBOOK'
    type: 'SELL' | 'BUILD'
    template: string
    formatId?: string
    inputMedia: any
  }) {
    return this.prisma.videoProject.create({
      data: {
        productId: input.productId,
        platform: input.platform,
        type: input.type,
        template: input.template,
        formatId: input.formatId ?? null,
        inputMedia: input.inputMedia,
        status: VideoProjectStatus.DRAFT,
        renderStatus: RenderStatus.PENDING,
        renderProgress: 0,
      },
    })
  }

  /* =========================
   * GENERATE CONTENT (AI ONLY)
   * ========================= */
  async generateContent(id: string, userPrompt?: string) {
  try {
    const project = await this.prisma.videoProject.findUnique({
      where: { id },
    })
    if (!project) {
      throw new Error('VIDEO_PROJECT_NOT_FOUND')
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
  } catch (e: any) {
    console.error('[generateContent]', e)
    throw e
  }
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
      throw new Error('VIDEO_PROJECT_NOT_FOUND')
    }

    if (project.status === VideoProjectStatus.RENDERING) {
      throw new Error('ALREADY_RENDERING')
    }

    await this.prisma.videoProject.update({
      where: { id },
      data: {
        status: VideoProjectStatus.RENDERING,
        renderStatus: RenderStatus.PENDING,
        renderStep: RenderStep.ANALYZING,
        renderProgress: 0,
        errorMessage: null,
      },
    })

    this.runPipeline(project).catch(console.error)

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
      throw new Error('VIDEO_PROJECT_NOT_FOUND')
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

    await this.prisma.videoProject.update({
      where: { id },
      data: {
        status: VideoProjectStatus.RENDERING,
        renderStatus: RenderStatus.PENDING,
        errorMessage: null,
      },
    })

    this.runPipeline(project, resumeFrom).catch(console.error)

    return { status: 'RETRYING', resumeFrom }
  }

  /* =========================
   * INTERNAL RENDER PIPELINE
   * ========================= */
  private async runPipeline(
    project: any,
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
          outputVideo: result.outputVideo,
        },
      })
    } catch (e: any) {
      await this.prisma.videoProject.update({
        where: { id: project.id },
        data: {
          status: VideoProjectStatus.FAILED,
          renderStatus: RenderStatus.FAIL,
          errorMessage: e.message,
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

    await this.prisma.videoProject.update({
      where: { id: videoProjectId },
      data: {
        renderStep: step,
        renderProgress: progress,
        renderLogs: message
          ? {
              push: {
                step,
                message,
                at: new Date().toISOString(),
              },
            }
          : undefined,
      },
    })
  }

  /* =========================
   * QUERY
   * ========================= */
  async getById(id: string) {
    return this.prisma.videoProject.findUnique({
      where: { id },
    })
  }

  async list(status?: VideoProjectStatus) {
    return this.prisma.videoProject.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }
}
