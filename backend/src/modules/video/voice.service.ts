import { Injectable } from '@nestjs/common';
import { ScriptResult } from './script.schema';
import { VoiceScript, VoiceScriptSchema } from './voice.schema';

@Injectable()
export class VoiceService {

  /**
   * ✅ Method gốc – GIỮ NGUYÊN
   */
  generateVoiceScript(script: ScriptResult): VoiceScript {
    const sentences: { text: string; pause_ms: number }[] = [];

    // 🔹 Hook – nói nhanh, pause nhẹ
    if (script.hook) {
      sentences.push({
        text: this.clean(script.hook),
        pause_ms: 400,
      });
    }

    // 🔹 Body – đều nhịp, mạch kể
    for (const line of script.body ?? []) {
      sentences.push({
        text: this.clean(line),
        pause_ms: 300,
      });
    }

    // 🔹 CTA – nhấn nhẹ trước kết
    if (script.cta) {
      sentences.push({
        text: this.clean(script.cta),
        pause_ms: 0,
      });
    }

    const result = VoiceScriptSchema.safeParse({ sentences });

    if (!result.success) {
      // fallback cực an toàn
      return {
        sentences: [],
      };
    }

    return result.data;
  }

  /**
   * ✅ WRAPPER CHO VideoOrchestrator
   * Chuẩn hoá interface, không phá logic cũ
   */
  prepareForTts(script: ScriptResult): VoiceScript {
    return this.generateVoiceScript(script);
  }

  /**
   * 🧹 Làm sạch câu cho TTS
   */
  private clean(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[“”"]/g, '')
      .trim();
  }
}
