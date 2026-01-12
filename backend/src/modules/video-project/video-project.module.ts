import { Module } from '@nestjs/common'

import { PrismaModule } from '../../common/prisma/prisma.module'
import { VideoModule } from '../video/video.module'

import { VideoProjectController } from './video-project.controller'
import { VideoProjectService } from './video-project.service'

@Module({
  imports: [
    PrismaModule, // dùng PrismaService
    VideoModule,  // ✅ inject VideoOrchestratorService
  ],
  controllers: [
    VideoProjectController,
  ],
  providers: [
    VideoProjectService,
  ],
  exports: [
    VideoProjectService,
  ],
})
export class VideoProjectModule {}
