import {
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common'

import { ScheduleService } from './schedule.service'

@Controller('post-schedules') // 🔴 QUAN TRỌNG: phải khớp FE
export class ScheduleController {
  constructor(
    private readonly scheduleService: ScheduleService,
  ) {}

  /**
   * Create post schedule
   * POST /post-schedules
   */
  @Post()
  async create(@Body() body: any) {
    return this.scheduleService.createSchedule({
      workspaceId: body.workspaceId,
      videoId: body.videoId,
      productId: body.productId,
      platform: body.platform,
      scheduledAt: new Date(body.scheduledAt),
      timezone: body.timezone,
    })
  }

  /**
   * List schedules by workspace
   * GET /post-schedules/:workspaceId
   */
  @Get(':workspaceId')
  async list(@Param('workspaceId') workspaceId: string) {
    return this.scheduleService.listSchedules(workspaceId)
  }

  /**
   * Cancel schedule
   * POST /post-schedules/:id/cancel
   */
  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.scheduleService.cancelSchedule(id)
  }
}
