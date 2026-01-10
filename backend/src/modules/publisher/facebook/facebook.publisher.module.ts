import { Module } from '@nestjs/common'
import { FacebookPublisher } from './facebook.publisher'
import { FacebookPageRepository } from './facebook-page/facebook-page.repository'
import { PrismaModule } from '../../../common/prisma/prisma.module'

@Module({
  imports: [
    PrismaModule, // 👈 repo cần Prisma
  ],
  providers: [
    FacebookPublisher,
    FacebookPageRepository,
  ],
  exports: [
    FacebookPublisher,
    FacebookPageRepository, // 🔥 BẮT BUỘC EXPORT
  ],
})
export class FacebookPublisherModule {}
