/** Split on Latin or Devanagari sentence enders. */
const SENTENCE_SPLIT = /(?<=[.!?।])\s+/;

/**
 * Turn plain prose into markdown bullets so UI can render scan-friendly chips
 * (legacy content / AI that forgot "- " lines).
 */
export function coerceMarkdownBullets(text: string): string {
  const t = text.trim();
  if (!t) return '';
  if (/^-\s/m.test(t) || /^#{1,3}\s/m.test(t)) return t;

  const lines = t.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines.map((l) => (/^-\s/.test(l) ? l : `- ${l}`)).join('\n');
  }

  const one = lines[0] ?? t;
  const sents = one.split(SENTENCE_SPLIT).map((s) => s.trim()).filter(Boolean);
  if (sents.length <= 1) return `- ${one}`;
  return sents.map((s) => `- ${s}`).join('\n');
}

export function ensureBulletMarkdown(text: string): string {
  return coerceMarkdownBullets(text);
}

/** Like coerceMarkdownBullets but keeps `##` / `###` blocks and bulletizes plain paragraphs between them. */
export function coerceMarkdownBulletsLoose(text: string): string {
  const t = text.trim();
  if (!t) return '';
  return t
    .split(/\n{2,}/)
    .map((para) => {
      const p = para.trim();
      if (!p) return '';
      if (/^#{1,3}\s/m.test(p)) return p;
      return coerceMarkdownBullets(p);
    })
    .filter(Boolean)
    .join('\n\n');
}
