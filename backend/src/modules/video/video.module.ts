import { Module } from '@nestjs/common'

import { TtsModule } from '../tts/tts.module'
import { VisionModule } from '../vision/vision.module'

import { ScriptService } from './script.service'
import { CaptionService } from './caption.service'
import { VoiceService } from './voice.service'
import { VideoRenderService } from './video-render.service'
import { VideoOrchestratorService } from './video-orchestrator.service'
import { VideosController } from './videos.controller'

@Module({
  imports: [
    TtsModule,
    VisionModule,
  ],
  controllers: [
    VideosController,
  ],
  providers: [
    ScriptService,
    CaptionService,
    VoiceService,
    VideoRenderService,
    VideoOrchestratorService,
  ],
  exports: [
    VideoOrchestratorService, // ✅ RẤT QUAN TRỌNG
  ],
})
export class VideoModule {}
