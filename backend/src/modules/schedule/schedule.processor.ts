import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../common/prisma/prisma.service'

import { FacebookPublisher } from '../publisher/facebook/facebook.publisher'
import { FacebookPageRepository } from '../publisher/facebook/facebook-page/facebook-page.repository'

import { RuleEngineService } from '../rule-engine/rule-engine.service'
import { RuleConfigService } from '../rule-engine/rule-config/rule-config.service'
import { ProductMetricsService } from '../metrics/product-metrics.service'

@Injectable()
export class ScheduleProcessor {
  private readonly logger = new Logger(ScheduleProcessor.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookPublisher: FacebookPublisher,
    private readonly facebookPageRepo: FacebookPageRepository,
    private readonly ruleEngine: RuleEngineService,
    private readonly ruleConfigService: RuleConfigService,
    private readonly productMetricsService: ProductMetricsService,
  ) {}

  // ⏱ chạy mỗi 1 phút
  @Cron('* * * * *')
  async handleSchedules() {
    const schedules = await this.prisma.postSchedule.findMany({
      where: {
        status: 'PENDING',
        scheduledAt: { lte: new Date() },
      },
    })

    for (const schedule of schedules) {
      await this.processOne(schedule)
    }
  }

  private async processOne(schedule: any) {
    try {
      this.logger.log(`Processing schedule ${schedule.id}`)

      // ================= RULE ENGINE =================

      // 1️⃣ Load product
      const product = await this.prisma.product.findUnique({
        where: { id: schedule.productId },
      })

      if (!product) {
        throw new Error('PRODUCT_NOT_FOUND')
      }

      // 2️⃣ Load videos of product
      const videos = await this.prisma.video.findMany({
        where: { productId: product.id },
        select: {
          views: true,
          clicks: true,
        },
      })

      // 3️⃣ Build metrics (PURE)
      const metrics = this.productMetricsService.buildMetrics({
        productId: product.id,
        createdAt: product.createdAt,
        videos,
      })

      // 4️⃣ Load rule config
      const ruleConfig = await this.ruleConfigService.getConfig(
        schedule.workspaceId,
      )

      // 5️⃣ Evaluate rule
      const ruleResult = this.ruleEngine.evaluate(metrics, ruleConfig)

      /**
       * ⛔ HARD RULE
       * → STOP_PRODUCT (stop-loss)
       * → block schedule + update product
       */
      if (ruleResult?.hard) {
        this.logger.log(
          `[RULE BLOCK] Schedule ${schedule.id} – ${ruleResult.reason}`,
        )

        // update product status
        await this.prisma.product.update({
          where: { id: product.id },
          data: { status: ruleResult.nextProductStatus },
        })

        // mark schedule as SKIPPED
        await this.prisma.postSchedule.update({
          where: { id: schedule.id },
          data: {
            status: 'SKIPPED',
            resultMessage: ruleResult.reason,
          },
        })

        return // ⛔ DỪNG FLOW, KHÔNG POST
      }

      /**
       * 🟡 SOFT RULE
       * → chỉ update product status
       * → vẫn cho post
       */
      if (ruleResult) {
        await this.prisma.product.update({
          where: { id: product.id },
          data: { status: ruleResult.nextProductStatus },
        })
      }

      // ================= END RULE ENGINE =================

      // 👉 hiện tại chỉ support FACEBOOK
      if (schedule.platform === 'FACEBOOK') {
        await this.postToFacebook(schedule)
      } else {
        throw new Error('PLATFORM_NOT_SUPPORTED')
      }

      // ✅ FINAL STATE
      await this.prisma.postSchedule.update({
        where: { id: schedule.id },
        data: {
          status: 'DONE',
        },
      })
    } catch (err: any) {
      const retry = (schedule.retryCount ?? 0) + 1

      await this.prisma.postSchedule.update({
        where: { id: schedule.id },
        data: {
          status: 'FAILED',
          retryCount: retry,
          resultMessage: this.mapError(err),
        },
      })

      this.logger.error(
        `Schedule ${schedule.id} failed`,
        err?.stack,
      )
    }
  }

  // 🔽 giữ gần nguyên code cũ
  private async postToFacebook(schedule: any) {
    const page = await this.facebookPageRepo.findByWorkspace(
      schedule.workspaceId,
    )

    if (!page) {
      throw new Error('FACEBOOK_PAGE_NOT_FOUND')
    }

    await this.facebookPublisher.publish({
      pageId: page.pageId,
      pageAccessToken: page.pageAccessToken,
      videoPath: schedule.videoPath,
      caption: schedule.caption ?? '',
    })
  }

  private mapError(err: Error): string {
    switch (err.message) {
      case 'FACEBOOK_PAGE_NOT_FOUND':
        return 'Facebook Page not configured'
      case 'PLATFORM_NOT_SUPPORTED':
        return 'Platform not supported'
      case 'PRODUCT_NOT_FOUNpD':
        return 'Product not found'
      default:
        return 'Publish failed'
    }
  }
}
