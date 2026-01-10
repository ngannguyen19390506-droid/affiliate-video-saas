import { Controller, Get, Param, Patch } from '@nestjs/common';
import { DailyActionService } from './daily-action.service';

@Controller('workspaces/:workspaceId/daily-actions')
export class DailyActionController {
  constructor(
    private readonly dailyActionService: DailyActionService,
  ) {}

  /**
   * ⚠️ DEBUG / INTERNAL
   * KHÔNG dùng cho FE
   * GET /workspaces/:workspaceId/daily-actions/debug/generate
   */
  @Get('debug/generate')
  async debugGenerateDailyActions(
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.dailyActionService.generateDailyActionsFromDB(workspaceId);
  }

  /**
   * ✅ API CHO FE
   * GET /workspaces/:workspaceId/daily-actions/today
   */
  @Get('today')
async getTodayActions(
  @Param('workspaceId') workspaceId: string,
) {
  console.log('================ DAILY ACTION API ================')
  console.log('[Controller] workspaceId =', workspaceId)

  const result = await this.dailyActionService.getTodayActions(workspaceId)

  console.log('[Controller] result.length =', result.length)
  console.log('===================================================')

  return result
}



  /**
   * ✅ API CHO FE
   * PATCH /workspaces/:workspaceId/daily-actions/:id/done
   */
  @Patch(':id/done')
async markDone(
  @Param('workspaceId') workspaceId: string,
  @Param('id') id: string,
) {
  return this.dailyActionService.markActionAsDone(
    workspaceId,
    id,
  );
}
}

