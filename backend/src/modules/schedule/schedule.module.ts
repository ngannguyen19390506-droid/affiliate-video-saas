import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

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
    // cron
    NestScheduleModule.forRoot(),

    // infra
    PrismaModule,

    // facebook
    FacebookPublisherModule,

    // rule + metrics (🔥 BẮT BUỘC)
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
