import { Module } from '@nestjs/common'

import { ScheduleController } from './schedule.controller'
import { ScheduleService } from './schedule.service'
import { ScheduleProcessor } from './schedule.processor'

import { PrismaModule } from '../../common/prisma/prisma.module'
import { FacebookPublisherModule } from '../publisher/facebook/facebook.publisher.module'
import { RuleEngineModule } from '../rule-engine/rule-engine.module'
import { RuleConfigModule } from '../rule-engine/rule-config/rule-config.module'
import { MetricsModule } from '../metrics/metrics.module'

@Module({
  imports: [
    PrismaModule,
    FacebookPublisherModule,
    RuleEngineModule,
    RuleConfigModule,
    MetricsModule,
  ],
  controllers: [
    ScheduleController,
  ],
  providers: [
    ScheduleService,
    ScheduleProcessor,
  ],
})
export class ScheduleModule {}
