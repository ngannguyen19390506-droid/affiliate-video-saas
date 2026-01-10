import { z } from 'zod';

export const VoiceSentenceSchema = z.object({
  text: z.string().min(1),
  pause_ms: z.number().min(0),
});

export const VoiceScriptSchema = z.object({
  sentences: z.array(VoiceSentenceSchema).min(1),
});

export type VoiceScript = z.infer<typeof VoiceScriptSchema>;
