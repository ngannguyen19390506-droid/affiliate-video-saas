import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

import { PrismaService } from '../../common/prisma/prisma.service';
import { DailyActionGeneratorService } from './daily-action-generator.service';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class DailyActionCron {
  private readonly logger = new Logger(DailyActionCron.name);

  constructor(
  private readonly prisma: PrismaService,
  private readonly generator: DailyActionGeneratorService,
) {
  this.logger.log('[DAILY_ACTION_CRON] constructor loaded');
}


  /**
   * PROD: chạy 1 lần / ngày
   * ⏰ 03:00 sáng (JST)
   */
  @Cron('*/1 * * * *') 
  async handleDailyActionGeneration(): Promise<void> {
    const today = this.getToday();
    this.logger.log(`[DAILY_ACTION_CRON] started - ${today}`);

    const workspaces = await this.prisma.workspace.findMany({
      select: { id: true },
    });

    for (const ws of workspaces) {
      try {
        this.logger.log(
          `[DAILY_ACTION_CRON] run workspace=${ws.id} date=${today}`,
        );

        await this.generator.generate(ws.id, today);
      } catch (err) {
        this.logger.error(
          `[DAILY_ACTION_CRON] failed workspace=${ws.id} date=${today}`,
          err?.stack || err,
        );
      }
    }

    this.logger.log(`[DAILY_ACTION_CRON] finished - ${today}`);
  }

  private getToday(): string {
    return dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');
  }
}
