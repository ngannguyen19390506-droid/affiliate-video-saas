import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  /* =========================
   * CREATE
   * ========================= */
  async createSchedule(data: {
    workspaceId: string;
    videoId: string;
    productId?: string;
    platform: 'TIKTOK' | 'FACEBOOK';
    scheduledAt: Date;
    timezone: string;
  }) {
    return this.prisma.postSchedule.create({
      data: {
        ...data,
        status: 'SCHEDULED',
        retryCount: 0,
        maxRetry: 3,
      },
    });
  }

  /* =========================
   * LIST
   * ========================= */
  async listSchedules(workspaceId: string) {
    return this.prisma.postSchedule.findMany({
      where: { workspaceId },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  /* =========================
   * CANCEL
   * ========================= */
  async cancelSchedule(id: string) {
    return this.prisma.postSchedule.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }

  /* =========================
   * QUERY DUE SCHEDULES
   * ========================= */
  async getDueSchedules(now: Date) {
    return this.prisma.postSchedule.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          lte: now,
        },
      },
    });
  }

  /* =========================
   * UPDATE STATUS
   * ========================= */
  async markProcessing(id: string) {
    return this.prisma.postSchedule.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });
  }

  async markPosted(id: string, message?: string) {
    return this.prisma.postSchedule.update({
      where: { id },
      data: {
        status: 'POSTED',
        resultMessage: message,
      },
    });
  }

  async markFailed(id: string, message: string) {
    const schedule = await this.prisma.postSchedule.findUnique({
      where: { id },
    });

    if (!schedule) return;

    const retryCount = schedule.retryCount + 1;

    if (retryCount >= schedule.maxRetry) {
      return this.prisma.postSchedule.update({
        where: { id },
        data: {
          status: 'FAILED',
          retryCount,
          resultMessage: message,
        },
      });
    }

    return this.prisma.postSchedule.update({
      where: { id },
      data: {
        status: 'SCHEDULED',
        retryCount,
        resultMessage: message,
      },
    });
  }
}
