import { Injectable, Logger } from '@nestjs/common'
import dayjs from 'dayjs'
import { PrismaService } from '../../common/prisma/prisma.service'
import { DailyActionService } from './daily-action.service'
import { ProductStatus } from '@prisma/client'

@Injectable()
export class DailyActionRunner {
  private readonly logger = new Logger(DailyActionRunner.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly dailyActionService: DailyActionService,
  ) {}

  /**
   * RUN 1 LẦN / NGÀY / WORKSPACE
   * @param workspaceId
   * @param force  true = bỏ qua check existedRun (dùng cho _debug/run)
   */
  async runDaily(workspaceId: string, force = false) {
    const today = dayjs().format('YYYY-MM-DD')

    this.logger.log(
      `[RUN] workspace=${workspaceId}, date=${today}, force=${force}`,
    )

    /* =========================
       1️⃣ Chống chạy trùng
    ========================= */
    const existedRun = await this.prisma.dailyActionRun.findUnique({
      where: {
        workspace_id_run_date: {
          workspace_id: workspaceId,
          run_date: today,
        },
      },
    })

    if (existedRun && !force) {
      this.logger.warn(
        `[SKIP] DailyAction already generated for workspace=${workspaceId}, date=${today}`,
      )
      return { skipped: true }
    }

    /* =========================
       2️⃣ Nếu force → xoá run cũ
    ========================= */
    if (existedRun && force) {
      this.logger.warn(
        `[FORCE] Remove existed DailyActionRun workspace=${workspaceId}, date=${today}`,
      )

      await this.prisma.dailyActionRun.delete({
        where: {
          workspace_id_run_date: {
            workspace_id: workspaceId,
            run_date: today,
          },
        },
      })
    }

    /* =========================
       3️⃣ Create RUNNING
    ========================= */
    await this.prisma.dailyActionRun.create({
      data: {
        workspace_id: workspaceId,
        run_date: today,
        status: 'RUNNING',
        started_at: new Date(),
      },
    })

    try {
      /* =========================
         4️⃣ Generate actions
      ========================= */
      const actions =
        await this.dailyActionService.generateDailyActionsFromDB(workspaceId)

      this.logger.log(
        `[GENERATE] ${actions.length} actions for workspace=${workspaceId}`,
      )

      /* =========================
         5️⃣ Persist actions
      ========================= */
      for (const action of actions) {
        await this.prisma.$transaction(async (tx) => {
          // 5.1 Create DailyAction
          await tx.dailyAction.create({
            data: {
              workspaceId: workspaceId,
              productId: action.productId,
              actionType: action.action,
              priority: action.priority,
              reason: action.reason,
              // ⚠️ FIX QUAN TRỌNG: dùng thời gian thực
              actionDate: new Date(),
            },
          })

          // 5.2 Update Product.status
          const nextStatus = this.mapActionToProductStatus(action.action)
          if (nextStatus) {
            await tx.product.update({
              where: { id: action.productId },
              data: { status: nextStatus },
            })
          }
        })
      }

      /* =========================
         6️⃣ DONE
      ========================= */
      await this.prisma.dailyActionRun.update({
        where: {
          workspace_id_run_date: {
            workspace_id: workspaceId,
            run_date: today,
          },
        },
        data: {
          status: 'DONE',
          finished_at: new Date(),
        },
      })

      this.logger.log(
        `[DONE] DailyActionRunner finished workspace=${workspaceId}`,
      )

      return { ok: true, count: actions.length }
    } catch (err) {
      this.logger.error(err)

      await this.prisma.dailyActionRun.update({
        where: {
          workspace_id_run_date: {
            workspace_id: workspaceId,
            run_date: today,
          },
        },
        data: {
          status: 'FAILED',
          finished_at: new Date(),
        },
      })

      throw err
    }
  }

  /**
   * MAP rule action → ProductStatus
   */
  private mapActionToProductStatus(
    action: string,
  ): ProductStatus | null {
    switch (action) {
      case 'MAKE_MORE_VIDEOS':
        return ProductStatus.TEST

      case 'SCALE_FORMAT':
        return ProductStatus.CONTINUE

      case 'STOP_PRODUCT':
        return ProductStatus.STOP

      case 'RETEST_WITH_NEW_FORMAT':
        return ProductStatus.REVISIT

      default:
        return null
    }
  }
}
