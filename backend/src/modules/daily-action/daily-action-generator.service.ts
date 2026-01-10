import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RuleEngineService } from '../rule-engine/rule-engine.service';
import { RuleConfigService } from '../rule-engine/rule-config/rule-config.service';
import { ProductMetricsService } from '../metrics/product-metrics.service';
import { DailyActionType } from '@prisma/client';
import { RuleAction } from '../rule-engine/rule.interface';

@Injectable()
export class DailyActionGeneratorService {
  private readonly logger = new Logger(DailyActionGeneratorService.name);

  private readonly MAX_DAILY_ACTION = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: RuleEngineService,
    private readonly ruleConfigService: RuleConfigService,
    private readonly productMetricsService: ProductMetricsService,
  ) {}

  async generate(workspaceId: string, date: string): Promise<void> {
    this.logger.log(
      `[DAILY_ACTION_GENERATOR] start workspace=${workspaceId} date=${date}`,
    );

    // ===============================
    // 1️⃣ Idempotent check
    // ===============================
    const existedRun = await this.prisma.dailyActionRun.findUnique({
      where: {
        workspace_id_run_date: {
          workspace_id: workspaceId,
          run_date: date,
        },
      },
    });

    if (existedRun?.status === 'DONE') {
      this.logger.log(
        `[DAILY_ACTION_GENERATOR] skip (already DONE) workspace=${workspaceId} date=${date}`,
      );
      return;
    }

    const run =
      existedRun ??
      (await this.prisma.dailyActionRun.create({
        data: {
          workspace_id: workspaceId,
          run_date: date,
          status: 'RUNNING',
          started_at: new Date(),
        },
      }));

    if (existedRun) {
      await this.prisma.dailyActionRun.update({
        where: { id: existedRun.id },
        data: {
          status: 'RUNNING',
          started_at: new Date(),
          error_message: null,
        },
      });
    }

    try {
      // ===============================
      // 2️⃣ Load config + products
      // ===============================
      const ruleConfig = await this.ruleConfigService.getConfig(workspaceId);

      const products = await this.prisma.product.findMany({
        where: { workspaceId },
      });

      // ===============================
      // 3️⃣ Preload videos (avoid N+1)
      // ===============================
      const videosByProduct =
        await this.prisma.video.groupBy({
          by: ['productId'],
          where: { productId: { in: products.map(p => p.id) } },
          _sum: {
            views: true,
            clicks: true,
          },
          _count: {
            _all: true,
          },
        });

      const actions: {
        productId: string;
        type: DailyActionType;
        reason: string;
        priority: number;
      }[] = [];

      // ===============================
      // 4️⃣ Evaluate rules
      // ===============================
      for (const product of products) {
        const videoStat = videosByProduct.find(
          v => v.productId === product.id,
        );

        const metrics = this.productMetricsService.buildMetrics({
          productId: product.id,
          createdAt: product.createdAt,
          videos: videoStat
            ? [{
                views: videoStat._sum.views ?? 0,
                clicks: videoStat._sum.clicks ?? 0,
              }]
            : [],
        });

        const result = this.ruleEngine.evaluate(metrics, ruleConfig);
        if (!result) continue;

        // 🔥 respect allowSchedule
        if (!result.allowSchedule) continue;

        actions.push({
          productId: product.id,
          type: this.mapRuleAction(result.action),
          reason: result.reason,
          priority: result.priority,
        });
      }

      // ===============================
      // 5️⃣ Pick TOP N action
      // ===============================
      actions.sort((a, b) => a.priority - b.priority);
      const topActions = actions.slice(0, this.MAX_DAILY_ACTION);

      // ===============================
      // 6️⃣ Upsert DailyAction
      // ===============================
      for (const action of topActions) {
        const existed = await this.prisma.dailyAction.findFirst({
          where: {
            workspaceId,
            productId: action.productId,
            actionDate: date,
          },
        });

        if (existed) {
          await this.prisma.dailyAction.update({
            where: { id: existed.id },
            data: {
              actionType: action.type,
              reason: action.reason,
              priority: action.priority,
            },
          });
        } else {
          await this.prisma.dailyAction.create({
            data: {
              workspaceId,
              productId: action.productId,
              actionType: action.type,
              actionDate: date,
              reason: action.reason,
              priority: action.priority,
            },
          });
        }
      }

      // ===============================
      // 7️⃣ DONE
      // ===============================
      await this.prisma.dailyActionRun.update({
        where: { id: run.id },
        data: {
          status: 'DONE',
          finished_at: new Date(),
        },
      });

      this.logger.log(
        `[DAILY_ACTION_GENERATOR] done workspace=${workspaceId} date=${date}`,
      );
    } catch (error) {
      this.logger.error(
        `[DAILY_ACTION_GENERATOR] failed workspace=${workspaceId} date=${date}`,
        error.stack,
      );

      await this.prisma.dailyActionRun.update({
        where: { id: run.id },
        data: {
          status: 'FAILED',
          finished_at: new Date(),
          error_message: error.message,
        },
      });

      throw error;
    }
  }

  // ===============================
  // Utils
  // ===============================
  private mapRuleAction(action: RuleAction): DailyActionType {
  switch (action) {
    case RuleAction.MAKE_MORE_VIDEOS:
      return DailyActionType.MAKE_MORE_VIDEOS;

    case RuleAction.CONTINUE_PRODUCT:
      // CONTINUE = nhân bản format tốt
      return DailyActionType.SCALE_FORMAT;

    case RuleAction.STOP_PRODUCT:
    case RuleAction.STOP_LOSS:
      return DailyActionType.STOP_PRODUCT;

    default:
      throw new Error(`Unsupported RuleAction: ${action}`);
  }
}
}
