import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DailyActionGeneratorService } from './daily-action-generator.service';

@Injectable()
export class DailyActionCron {
  private readonly logger = new Logger(DailyActionCron.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly generator: DailyActionGeneratorService,
  ) {}

  /**
   * PROD: chạy 1 lần / ngày
   * ⏰ 03:00 sáng (server time)
   *
   * Cron CHỈ gọi generator
   * Generator chịu trách nhiệm:
   * - idempotent
   * - DailyActionRun lifecycle
   */
  @Cron('0 3 * * *')
  async handleDailyActionGeneration(): Promise<void> {
    const today = this.getToday(); // YYYY-MM-DD
    this.logger.log(`[DAILY_ACTION_CRON] started - ${today}`);

    // 🔹 Lấy TẤT CẢ workspace (schema hiện tại)
    const workspaces = await this.prisma.workspace.findMany({
      select: {
        id: true,
      },
    });

    for (const ws of workspaces) {
      try {
        this.logger.log(
          `[DAILY_ACTION_CRON] run workspace=${ws.id} date=${today}`,
        );

        await this.generator.generate(ws.id, today);
      } catch (err) {
        // ❗ Không throw để workspace khác vẫn chạy
        this.logger.error(
          `[DAILY_ACTION_CRON] failed workspace=${ws.id} date=${today}`,
          err?.stack || err,
        );
      }
    }

    this.logger.log(`[DAILY_ACTION_CRON] finished - ${today}`);
  }

  /**
   * Hiện tại dùng server date (UTC/JST)
   * MVP chưa cần timezone per workspace
   */
  private getToday(): string {
    return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  }
}
