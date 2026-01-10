export type TTSVoice = 'female' | 'male';

export interface TTSOptions {
  voice?: TTSVoice;
  speed?: number; // 1.0 = normal
}

export interface TTSResult {
  audioPath: string;
  durationMs?: number;
}
