import { Module } from '@nestjs/common';
import { TtsService } from './tts.service';

@Module({
  providers: [TtsService],
  exports: [TtsService], // ✅ BẮT BUỘC
})
export class TtsModule {}
