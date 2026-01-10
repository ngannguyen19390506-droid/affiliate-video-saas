import { Module } from '@nestjs/common';
import { VisionService } from './vision.service';
import { VideoProjectModule } from '../video-project/video-project.module';

@Module({
  imports: [VideoProjectModule], // 👈 QUAN TRỌNG
  providers: [VisionService],
  exports: [VisionService],
})
export class VisionModule {}
