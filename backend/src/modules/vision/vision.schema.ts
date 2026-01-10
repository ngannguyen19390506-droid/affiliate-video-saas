import { z } from 'zod';

export const VisionResultSchema = z.object({
  scene: z.string().nullable(),
  main_subject: z.string().nullable(),
  product_type: z.string().nullable(),
  use_case: z.string().nullable(),
  target_audience: z.string().nullable(),

  key_visual_details: z.array(z.string()).default([]),

  emotion_or_vibe: z.string().nullable(),

  selling_points: z.array(z.string()).default([]),

  limitations_or_uncertainty: z.array(z.string()).default([]),
});

export type VisionResult = z.infer<typeof VisionResultSchema>;

export {};