import 'dotenv/config';
import { VideoRenderService } from './modules/video/video-render.service';
import { TtsService } from './modules/tts/tts.service';

async function run() {
  const tts = new TtsService();
  const video = new VideoRenderService();


  const output = 'outputs/backend-video.mp4';

  await video.renderFromImage({
  imagePath: 'assets/demo.jpg',
  audioPath: 'outputs/test.mp3',
  outputPath: 'outputs/test.mp4',
});


  console.log('🎉 VIDEO DONE:', output);
}

run().catch(console.error);
