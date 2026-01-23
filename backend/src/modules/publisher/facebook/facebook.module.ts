import { Module } from '@nestjs/common'
import { FacebookPublisher } from './facebook.publisher'

@Module({
  providers: [FacebookPublisher],
  exports: [FacebookPublisher],
})
export class FacebookPublisherModule {}
