import { Module } from '@nestjs/common'
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule'

import { PrismaModule } from './common/prisma/prisma.module'
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module'
import { DailyActionModule } from './modules/daily-action/daily-action.module'
import { VisionModule } from './modules/vision/vision.module'
import { VideoModule } from './modules/video/video.module'
import { VideoProjectModule } from './modules/video-project/video-project.module'

// ✅ ĐỔI TÊN CHO RÕ NGHĨA
import { ScheduleModule } from './modules/schedule/schedule.module'

// CORE
import { ProductModule } from './modules/product/product.module'

@Module({
  imports: [
    NestScheduleModule.forRoot(), // ✅ CHỈ Ở ĐÂY
    PrismaModule,
    ProductModule,
    RuleEngineModule,
    DailyActionModule,
    VisionModule,
    VideoModule,
    VideoProjectModule,
    ScheduleModule,
  ],
})
export class AppModule {}
