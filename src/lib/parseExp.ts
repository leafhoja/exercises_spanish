export function extractVerbHints(exp: string): string[] {
  return [...exp.matchAll(/🔤\s*<b>([^<]+)<\/b>/g)].map(m => m[1]);
}
