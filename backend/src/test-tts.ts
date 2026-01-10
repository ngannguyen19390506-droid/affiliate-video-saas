import 'dotenv/config';
import { TtsService } from './modules/tts/tts.service';

async function run() {
  const tts = new TtsService();

  const output = 'tmp/test-voice.mp3';
  await tts.generateVoice(
    'Xin chào, đây là test giọng đọc',
    output
  );

  console.log('Voice generated:', output);
}

run();
