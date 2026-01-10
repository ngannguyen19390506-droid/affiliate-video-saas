import { mapDailyActionToResponse } from './daily-action.mapper';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RuleEngineService } from '../rule-engine/rule-engine.service';
import { ProductMetricsService } from '../metrics/product-metrics.service';
import { RuleConfigService } from '../rule-engine/rule-config/rule-config.service';
import { DailyAction } from './types/daily-action.type';
import { ProductStatus } from '@prisma/client';
import {
  ProductMetrics,
  RuleConfig,
} from '../rule-engine/rule.interface';

@Injectable()
export class DailyActionService {
  private readonly logger = new Logger(DailyActionService.name);

  private readonly MAX_DAILY_ACTION = 3;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ruleEngine: RuleEngineService,
    private readonly productMetrics: ProductMetricsService,
    private readonly ruleConfigService: RuleConfigService,
  ) {}

  /**
   * PURE FUNCTION
   * Không đụng DB
   */
  generateDailyActions(
    products: Array<{
      id: string;
      status: ProductStatus;
      createdAt: Date;
      videos: Array<{
        views: number;
        clicks: number;
      }>;
    }>,
    config: RuleConfig,
  ): DailyAction[] {
    const actions: DailyAction[] = [];

    for (const product of products) {
      const metrics: ProductMetrics =
        this.productMetrics.buildMetrics({
          productId: product.id,
          createdAt: product.createdAt,
          videos: product.videos,
        });

      const result = this.ruleEngine.evaluate(metrics, config);
      if (!result) continue;

      // 🔥 TÔN TRỌNG RULE ENGINE
      if (!result.allowSchedule) continue;

      actions.push({
        productId: product.id,
        action: result.action,
        reason: result.reason,
        priority: result.priority,
      });
    }

    // 🔥 priority nhỏ hơn = quan trọng hơn
    return actions
      .sort((a, b) => a.priority - b.priority)
      .slice(0, this.MAX_DAILY_ACTION);
  }

  /**
   * ⚠️ INTERNAL / DEBUG
   * DB → config → metrics → rule engine
   */
  async generateDailyActionsFromDB(workspaceId: string) {
    const products = await this.prisma.product.findMany({
      where: { workspaceId },
      include: { videos: true },
    });

    const config = await this.ruleConfigService.getConfig(workspaceId);

    const mappedProducts = products.map((product) => ({
      id: product.id,
      status: product.status,
      createdAt: product.createdAt,
      videos: product.videos.map((video) => ({
        views: video.views,
        clicks: video.clicks,
      })),
    }));

    return this.generateDailyActions(mappedProducts, config);
  }

  /**
   * ✅ READ-ONLY
   * API cho FE
   */
  async getTodayActions(workspaceId: string) {
  const todayStr = new Date().toISOString().slice(0, 10);

  const start = new Date(`${todayStr}T00:00:00`);
  const end = new Date(`${todayStr}T23:59:59`);

  const actions = await this.prisma.dailyAction.findMany({
    where: {
      workspaceId,
      isDone: false,
      actionDate: {
        gte: start,
        lt: end,
      },
    },
    include: {
      product: true, // 🔥 BẮT BUỘC để map DTO
    },
    orderBy: { priority: 'asc' },
    take: this.MAX_DAILY_ACTION,
  });

  return actions.map(mapDailyActionToResponse);
}


  /**
   * ✅ FE ACTION
   * Mark done + check workspace
   */
  async markActionAsDone(
    workspaceId: string,
    actionId: string,
  ) {
    return this.prisma.dailyAction.updateMany({
      where: {
        id: actionId,
        workspaceId,
      },
      data: {
        isDone: true,
        doneAt: new Date(),
      },
    });
  }
}
