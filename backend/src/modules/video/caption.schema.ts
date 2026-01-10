import { z } from 'zod';

export const CaptionResultSchema = z.object({
  text: z.string().min(1),
  hashtags: z.array(z.string()).default([]),
});

export type CaptionResult = z.infer<typeof CaptionResultSchema>;
