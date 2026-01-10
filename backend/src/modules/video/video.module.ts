import { Module } from '@nestjs/common';
import { TtsModule } from '../tts/tts.module';

import { VisionModule } from '../vision/vision.module';
import { VideoProjectModule } from '../video-project/video-project.module';

import { ScriptService } from './script.service';
import { CaptionService } from './caption.service';
import { VoiceService } from './voice.service';
import { VideoRenderService } from './video-render.service';
import { VideoOrchestratorService } from './video-orchestrator.service';
import { VideosController } from './videos.controller';

@Module({
  imports: [
    TtsModule,
    VisionModule,
    VideoProjectModule,
  ],
  controllers: [
    VideosController,   // ✅ CHỈ THÊM DÒNG NÀY
  ],

  providers: [
    ScriptService,
    CaptionService,
    VoiceService,
    VideoRenderService,      // ✅ THÊM DÒNG NÀY
    VideoOrchestratorService,
  ],
  exports: [
    VideoOrchestratorService,
  ],
})
export class VideoModule {}
