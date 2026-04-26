export const PYQ_SCOPE_START_YEAR = 2020;
export const PYQ_SCOPE_END_YEAR = 2026;

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim();

export function getScopedStateServiceYear(title: string): number | null {
  const normalized = normalizeWhitespace(title);

  const enMatch = normalized.match(/MPPSC State Service Prelims.*? (20\d{2}).*?Paper 1/i);
  if (enMatch) return Number(enMatch[1]);

  const hiMatch = normalized.match(/MPPSC राज्य सेवा प्रारंभिक.*? (20\d{2}).*?पेपर 1/);
  if (hiMatch) return Number(hiMatch[1]);

  return null;
}

export function isWithinScopedStateServiceRange(
  title: string,
  fromYear: number,
  toYear: number
): boolean {
  const year = getScopedStateServiceYear(title);
  return year !== null && year >= fromYear && year <= toYear;
}
