import { Module } from '@nestjs/common';
import { ScheduleModule as NestScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './common/prisma/prisma.module';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { DailyActionModule } from './modules/daily-action/daily-action.module';
import { VisionModule } from './modules/vision/vision.module';
import { VideoModule } from './modules/video/video.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { VideoProjectModule } from './modules/video-project/video-project.module'; // ✅ THÊM

@Module({
  imports: [
    NestScheduleModule.forRoot(),
    PrismaModule,
    RuleEngineModule,
    DailyActionModule,
    ScheduleModule,
    VisionModule,
    VideoModule,
    VideoProjectModule, // ✅ BẮT BUỘC
  ],
})
export class AppModule {}
