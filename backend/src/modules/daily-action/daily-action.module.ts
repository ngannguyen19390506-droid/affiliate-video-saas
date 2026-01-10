import { Module } from '@nestjs/common';
import { DailyActionController } from './daily-action.controller';
import { DailyActionService } from './daily-action.service';
import { DailyActionGeneratorService } from './daily-action-generator.service';

import { PrismaModule } from '../../common/prisma/prisma.module';
import { RuleEngineModule } from '../rule-engine/rule-engine.module';
import { RuleConfigModule } from '../rule-engine/rule-config/rule-config.module';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [
    PrismaModule,
    RuleEngineModule,
    RuleConfigModule, // ✅ FIX CHÍNH Ở ĐÂY
    MetricsModule,
  ],
  controllers: [
    DailyActionController,
  ],
  providers: [
    DailyActionService,
    DailyActionGeneratorService,
  ],
  exports: [
    DailyActionService,
  ],
})
export class DailyActionModule {}
