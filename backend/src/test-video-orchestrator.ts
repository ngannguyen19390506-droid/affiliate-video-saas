import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { VideoOrchestratorService } from './modules/video/video-orchestrator.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const orchestrator = app.get(VideoOrchestratorService);

  await orchestrator.renderFromImage({
    imagePath: 'assets/1.jpg',
    text: 'Hello from orchestrator',
    outputPath: 'outputs/orchestrator-video.mp4',
  });

  console.log('🎉 ORCHESTRATOR VIDEO DONE');
  await app.close();
}

bootstrap();
