import { Controller, Get, Query } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { RenderStatus } from '@prisma/client'

@Controller('video-projects')
export class VideoProjectController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(@Query('renderStatus') renderStatus?: RenderStatus) {
    return this.prisma.videoProject.findMany({
      where: renderStatus ? { renderStatus } : undefined,
      orderBy: { createdAt: 'desc' },
    })
  }
}
