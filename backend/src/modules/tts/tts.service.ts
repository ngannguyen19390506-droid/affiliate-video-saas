import { Injectable } from '@nestjs/common';
import { writeFile } from 'fs/promises';
import { openai } from '../../common/openai/openai.client';

@Injectable()
export class TtsService {
  async generateVoice(text: string, outputPath: string): Promise<string> {
    if (!text || !text.trim()) {
      throw new Error('TTS text is empty');
    }

    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: 'alloy',
      input: text,
    });

    const buffer = Buffer.from(await response.arrayBuffer());
    await writeFile(outputPath, buffer);

    return outputPath;
  }
}
