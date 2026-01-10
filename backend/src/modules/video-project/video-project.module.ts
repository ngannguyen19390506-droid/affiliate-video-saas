import { Module } from '@nestjs/common'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { VideoProjectController } from './video-project.controller'
import { VideoProjectService } from './video-project.service'

@Module({
  imports: [
    PrismaModule, // 👈 để dùng PrismaService
  ],
  controllers: [
    VideoProjectController, // 👈 BẮT BUỘC để có route /video-projects
  ],
  providers: [
    VideoProjectService,
  ],
  exports: [
    VideoProjectService,
  ],
})
export class VideoProjectModule {}
