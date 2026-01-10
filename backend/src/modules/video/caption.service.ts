import { Injectable } from '@nestjs/common';
import { ScriptResult } from './script.schema';
import { CaptionResult, CaptionResultSchema } from './caption.schema';

@Injectable()
export class CaptionService {

  /**
   * ✅ Method gốc – GIỮ NGUYÊN
   */
  generateCaption(script: ScriptResult): CaptionResult {
    const lines: string[] = [];

    // 🔹 Dòng mở – thường dùng hook
    if (script.hook) {
      lines.push(this.clean(script.hook));
    }

    // 🔹 Body – chọn 1–2 câu ngắn
    if (script.body?.length) {
      lines.push(this.clean(script.body[0]));

      if (script.body.length > 1) {
        lines.push(this.clean(script.body[1]));
      }
    }

    // 🔹 CTA – xuống dòng riêng
    if (script.cta) {
      lines.push('');
      lines.push(this.clean(script.cta));
    }

    const text = lines.join('\n');
    const hashtags = this.generateHashtags(script);

    const result = CaptionResultSchema.safeParse({
      text,
      hashtags,
    });

    if (!result.success) {
      return {
        text,
        hashtags: [],
      };
    }

    return result.data;
  }

  /**
   * ✅ WRAPPER CHO VideoOrchestrator
   * KHÔNG đổi logic cũ
   */
  generate(script: ScriptResult): CaptionResult {
    return this.generateCaption(script);
  }

  /**
   * 🔖 Hashtag nhẹ – không spam
   */
  private generateHashtags(script: ScriptResult): string[] {
    const tags = new Set<string>();

    tags.add('#reviewthat');
    tags.add('#doitienloi');

    if (script.body?.length) {
      tags.add('#meovat');
      tags.add('#doisong');
    }

    if (script.cta) {
      tags.add('#xemthem');
    }

    return Array.from(tags).slice(0, 5);
  }

  /**
   * 🧹 Làm sạch caption
   */
  private clean(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/[“”"]/g, '')
      .trim();
  }
}
