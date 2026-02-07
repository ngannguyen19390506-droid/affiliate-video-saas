import { Module } from '@nestjs/common';
import { DailyActionController } from './daily-action.controller';
import { DailyActionService } from './daily-action.service';
import { DailyActionGeneratorService } from './daily-action-generator.service';
import { DailyActionRunner } from './daily-action.runner';
import { DailyActionCron } from './daily-action.cron'; // ✅ ADD

import { PrismaModule } from '../../common/prisma/prisma.module';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';
import { RuleConfigModule } from '../rule-engine/rule-config/rule-config.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    PrismaModule,
    RuleEngineModule,
    RuleConfigModule, // threshold / config theo workspace
    MetricsModule,
  ],
  controllers: [
    DailyActionController,
  ],
  providers: [
    DailyActionService,
    DailyActionGeneratorService,
    DailyActionRunner, // execution (manual/debug)
    DailyActionCron,   // ⏰ PROD cron (BẮT BUỘC)
  ],
  exports: [
    DailyActionService,
    DailyActionRunner, // cho cron / module khác gọi
  ],
})
export class DailyActionModule {}
