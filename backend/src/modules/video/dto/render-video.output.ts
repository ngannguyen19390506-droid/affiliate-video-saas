import { CaptionResult } from '../caption.schema';
import { ScriptResult } from '../script.schema';

export interface RenderVideoOutput {
  videoPath: string;
  caption: CaptionResult;
  script: ScriptResult;
}
