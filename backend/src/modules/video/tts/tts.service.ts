import { Injectable } from '@nestjs/common';
import * as path from 'path';

@Injectable()
export class TtsService {

  /**
   * Method gốc của bạn – GIỮ NGUYÊN
   */
  async generateVoice(text: string, outputPath: string): Promise<void> {
    // logic TTS hiện tại của bạn (đã chạy OK)
  }

  /**
   * ✅ Wrapper cho Orchestrator
   * Nhận TEXT THUẦN – không biết VoiceScript
   */
  async generateMp3(text: string): Promise<string> {
    const outputPath = path.join('outputs', 'backend-video.mp3');

    await this.generateVoice(text, outputPath);

    return outputPath;
  }
}
