import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VideoOrchestratorService } from './modules/video';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const orchestrator = app.get(VideoOrchestratorService);

  const result = await orchestrator.renderFromImage({
    text: 'Test render video qua Nest context',
    imagePath: 'assets/demo.jpg',
    outputPath: 'outputs/test-video.mp4',
  });

  console.log('DONE:', result);

  await app.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
