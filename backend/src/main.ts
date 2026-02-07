import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

async function bootstrap() {
  const app =
    await NestFactory.create<NestExpressApplication>(AppModule)

  app.enableCors({
    origin: ['http://localhost:3000'], // FE
    credentials: true,
  })

  // 🔥 SERVE STATIC VIDEO FILES
  app.useStaticAssets(join(process.cwd(), 'outputs'), {
    prefix: '/outputs',
  })

  const PORT = 3002
  await app.listen(PORT, '0.0.0.0')

  console.log(`🚀 Backend running at http://localhost:${PORT}`)
}

bootstrap()
