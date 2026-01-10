import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../common/prisma/prisma.service'
import { FacebookPublisher } from '../publisher/facebook/facebook.publisher'

@Injectable()
export class PostScheduleService {
  private readonly logger = new Logger(PostScheduleService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookPublisher: FacebookPublisher,
  ) {}

  async executeSchedule(scheduleId: string): Promise<void> {
    // 1. Get schedule
    const schedule = await this.prisma.postSchedule.findUnique({
      where: { id: scheduleId },
    })

    if (!schedule) {
      throw new Error('SCHEDULE_NOT_FOUND')
    }

    // 2. Get video project
    const video = await this.prisma.videoProject.findUnique({
      where: { id: schedule.videoId },
    })

    if (!video) {
      throw new Error('VIDEO_PROJECT_NOT_FOUND')
    }

    if (video.renderStatus !== 'DONE') {
      throw new Error('VIDEO_NOT_READY')
    }

    // ✅ field CÓ THẬT trong schema
    if (!video.voicePath) {
      throw new Error('VIDEO_PATH_MISSING')
    }

    // 3. Facebook Page (tạm dùng ENV)
    const pageId = process.env.FACEBOOK_PAGE_ID
    const pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN
    const caption = video.caption ?? ''

    if (!pageId || !pageAccessToken) {
      throw new Error('FACEBOOK_PAGE_NOT_CONFIGURED')
    }

    this.logger.log(
      `[POST] schedule=${schedule.id} video=${video.id} path=${video.voicePath}`,
    )

    // 4. Publish
    await this.facebookPublisher.publish({
      pageId,
      pageAccessToken,
      videoPath: video.voicePath,
      caption,
    })

    // 5. Update schedule status (CHỈ field tồn tại)
    await this.prisma.postSchedule.update({
      where: { id: schedule.id },
      data: {
        status: 'POSTED',
      },
    })
  }
}
