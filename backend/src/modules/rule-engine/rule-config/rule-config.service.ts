import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { RuleConfig } from '../rule.interface';

@Injectable()
export class RuleConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfig(workspaceId: string): Promise<RuleConfig> {
    const rows = await this.prisma.ruleConfig.findMany({
      where: { workspaceId },
    });

    const config: RuleConfig = {
      MIN_VIDEO_TEST: 5,
      MAX_TEST_DAYS: 7,
      STOP_LOSS_VIDEO: 10,
      VIEW_THRESHOLD: 500,
    };

    for (const row of rows) {
      if (row.key in config) {
        config[row.key] = row.value;
      }
    }

    return config;
  }
}
