import { z } from 'zod';

export const ScriptResultSchema = z.object({
  hook: z.string().min(1).nullable(),
  body: z.array(z.string()).min(1).default([]),
  cta: z.string().min(1).nullable(),
});

export type ScriptResult = z.infer<typeof ScriptResultSchema>;
