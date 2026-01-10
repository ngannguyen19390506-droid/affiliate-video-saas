import { ScriptResult } from './script.schema';

export function isValidScriptResult(
  data: any,
): data is ScriptResult {
  return (
    data &&
    typeof data === 'object' &&
    'body' in data &&
    Array.isArray(data.body)
  );
}
