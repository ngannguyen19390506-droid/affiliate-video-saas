import { DailyActionService } from './daily-action.service';
import { Controller, Get, Param, Patch, Post } from '@nestjs/common';

@Controller('workspaces/:workspaceId/daily-actions')
export class DailyActionController {
  constructor(
    private readonly dailyActionService: DailyActionService,
  ) {}

  /**s
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
   * ======================
   * DEV ONLY – Manual Generate
   * POST /workspaces/:workspaceId/daily-actions/generate
   * ======================
   */
  @Post('generate')
  async generateDailyActions(
    @Param('workspaceId') workspaceId: string,
  ) {
    console.log('================ DAILY ACTION GENERATE ================')
    console.log('[Controller] workspaceId =', workspaceId)

    const result =
      await this.dailyActionService.generateDailyActionsFromDB(workspaceId)

    console.log('[Controller] generated =', result.length)
    console.log('=======================================================')

    return {
      generated: result.length,
      actions: result,
    }
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

