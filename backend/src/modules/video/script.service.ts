import { SCRIPT_SYSTEM_PROMPT } from '../../common/openai/prompts/script.system.prompt';
import { Injectable } from '@nestjs/common';
import { openai } from '../../common/openai/openai.client';
import { SCRIPT_USER_PROMPT } from '../../common/openai/prompts/script.user.prompt';
import { ScriptResultSchema } from './script.schema';
import { VideoProjectService } from '../video-project/video-project.service';

@Injectable()
export class ScriptService {
  constructor(
    private readonly videoProjectService: VideoProjectService,
  ) {}

  async generateScript(
    visionResult: unknown,
    videoProjectId?: string,
  ) {
    const visionJsonText = JSON.stringify(visionResult, null, 2);
    const userPrompt = SCRIPT_USER_PROMPT.replace(
      '{{VISION_JSON}}',
      visionJsonText,
    );

    const res = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0.4,
      messages: [
        { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
    });

    const msg = res.choices?.[0]?.message?.content as unknown;
    if (!msg) {
      return { error: 'Script generation returned empty response' };
    }

    let text: string;
    if (typeof msg === 'string') text = msg;
    else if (Array.isArray(msg)) {
      text = msg.filter((c) => c.type === 'text').map((c) => c.text).join('');
    } else {
      return { error: 'Unsupported script response format' };
    }

    try {
      const parsed = JSON.parse(text);
      const result = ScriptResultSchema.safeParse(parsed);

      const scriptData = result.success
        ? result.data
        : {
            raw: parsed,
            error: 'Script output does not match schema',
            issues: result.error.issues,
          };

      if (videoProjectId && result.success) {
        await this.videoProjectService.updateScript(
          videoProjectId,
          scriptData,
          null,
        );
      }

      return scriptData;
    } catch {
      return {
        raw: text,
        error: 'Script output is not valid JSON',
      };
    }
  }

  /**
   * Generate script from plain text (for VideoOrchestrator)
   * Wrapper để giữ orchestrator đơn giản
   */
  async generate(text: string) {
    const visionResult = {
      source: 'text',
      content: text,
    };

    return this.generateScript(visionResult);
  }
}
