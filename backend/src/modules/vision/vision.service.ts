import { Injectable } from '@nestjs/common'
import { openai } from '../../common/openai/openai.client'
import { VISION_SYSTEM_PROMPT } from '../../common/openai/prompts/vision.system.prompt'
import { VISION_USER_PROMPT } from '../../common/openai/prompts/vision.user.prompt'
import { VisionResultSchema } from './vision.schema'

@Injectable()
export class VisionService {
  constructor() {}

  /**
   * ============================
   * Analyze image with Vision
   * ============================
   *
   * ❗ Trách nhiệm:
   * - Gọi OpenAI Vision
   * - Parse + validate JSON
   * - Return visionData
   *
   * ❌ KHÔNG update DB
   * ❌ KHÔNG biết VideoProject
   */
  async analyzeImage(imageUrl: string) {
    const res = await openai.chat.completions.create({
      model: 'gpt-4.1-mini',
      temperature: 0,
      messages: [
        { role: 'system', content: VISION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: VISION_USER_PROMPT },
            { type: 'image_url', image_url: { url: imageUrl } },
          ],
        },
      ],
    })

    const msg = res.choices?.[0]?.message?.content as unknown
    if (!msg) {
      throw new Error('Vision returned empty response')
    }

    let text: string
    if (typeof msg === 'string') {
      text = msg
    } else if (Array.isArray(msg)) {
      text = msg
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('')
    } else {
      throw new Error('Unsupported Vision response format')
    }

    try {
      const parsed = JSON.parse(text)
      const result = VisionResultSchema.safeParse(parsed)

      if (!result.success) {
        return {
          raw: parsed,
          error: 'Vision output does not match schema',
          issues: result.error.issues,
        }
      }

      return result.data
    } catch {
      return {
        raw: text,
        error: 'Vision output is not valid JSON',
      }
    }
  }
}
