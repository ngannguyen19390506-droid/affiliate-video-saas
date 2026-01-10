import { Module } from '@nestjs/common'
import { PostScheduleService } from './post-schedule.service'
import { PrismaModule } from '../../common/prisma/prisma.module'
import { FacebookPublisher } from '../publisher/facebook/facebook.publisher'

@Module({
  imports: [PrismaModule],
  providers: [
    PostScheduleService,
    FacebookPublisher, // ✅ đăng ký trực tiếp provider
  ],
  exports: [PostScheduleService],
})
export class PostScheduleModule {}
