import { Controller, Post, Body } from '@nestjs/common';
import { VisionService } from './vision.service';

@Controller('vision')
export class VisionController {
  constructor(private readonly visionService: VisionService) {}

  @Post('analyze')
  async analyzeImage(@Body('imageUrl') imageUrl: string) {
    if (!imageUrl) {
      return {
        ok: false,
        error: 'imageUrl is required',
      };
    }

    const imageFacts = await this.visionService.analyzeImage(imageUrl);

    return {
      ok: true,
      data: imageFacts,
    };
  }
}
