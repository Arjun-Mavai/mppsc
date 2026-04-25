import { jsonrepair } from 'jsonrepair';

const INVISIBLE_CHARS =
  /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g;

/** Strip BOM / zero-width / other invisible chars that break parsers */
function stripInvisible(s: string): string {
  return s.replace(INVISIBLE_CHARS, '');
}

/** Normalize smart quotes and strip common markdown fences */
export function minimalClean(jsonString: string): string {
  let cleaned = stripInvisible(jsonString.trim());
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
  cleaned = cleaned.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"');
  cleaned = cleaned.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  return cleaned.trim();
}

/**
 * Slice the first complete top-level JSON object or array using bracket depth,
 * respecting strings and escapes. Safer than first `{` to last `}` (which pulls
 * trailing prose or merges unrelated `}` characters outside the payload).
 */
export function extractBalancedJsonFragment(input: string): string | null {
  const s = input;
  const start = s.search(/[\[{]/);
  if (start === -1) return null;

  const stack: string[] = [];
  const closer: Record<string, string> = { '{': '}', '[': ']' };
  const openers = new Set(['{', '[']);
  const closers = new Set(['}', ']']);

  let inString = false;
  let escape = false;

  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (inString) {
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\') {
        escape = true;
        continue;
      }
      if (c === '"') inString = false;
      continue;
    }
    if (c === '"') {
      inString = true;
      continue;
    }
    if (openers.has(c)) {
      stack.push(closer[c]);
      continue;
    }
    if (closers.has(c)) {
      if (stack.length === 0 || stack[stack.length - 1] !== c) return null;
      stack.pop();
      if (stack.length === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/**
 * Light structural cleanup for LLM / paste JSON (no speculative inner-quote
 * rewriting — that often corrupts valid JSON and causes "Expected ',' or '}'").
 */
export function sanitizeJSONString(jsonString: string): string {
  let cleaned = minimalClean(jsonString);

  const extracted = extractBalancedJsonFragment(cleaned);
  if (extracted) cleaned = extracted;

  cleaned = cleaned.replace(/}\s*(\n\s*)*{/g, '},{');
  cleaned = cleaned.replace(/]\s*(\n\s*)*{/g, '],[{');
  cleaned = cleaned.replace(/}\s*(\n\s*)*\[/g, '},[');

  cleaned = cleaned.replace(/"(?:[^"\\]|\\.)*"/g, (match) =>
    match.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t'),
  );

  cleaned = cleaned.replace(/,\s*([\]}])/g, '$1');

  try {
    JSON.parse(cleaned);
  } catch {
    const openBraces = (cleaned.match(/{/g) || []).length;
    let closeBraces = (cleaned.match(/}/g) || []).length;
    const openBrackets = (cleaned.match(/\[/g) || []).length;
    let closeBrackets = (cleaned.match(/]/g) || []).length;

    while (openBraces > closeBraces) {
      cleaned += '}';
      closeBraces++;
    }
    while (openBrackets > closeBrackets) {
      cleaned += ']';
      closeBrackets++;
    }
  }

  return cleaned.trim();
}

/**
 * Parse pasted / LLM JSON with multiple strategies: strict parse, structural
 * cleanup, balanced extraction, then `jsonrepair` for trailing commas, comments,
 * unquoted keys, truncated output, etc.
 */
export function parseLenientJSON<T = unknown>(raw: string): T {
  if (raw == null || typeof raw !== 'string') {
    throw new SyntaxError('JSON input is empty.');
  }
  if (raw.trim().length === 0) {
    throw new SyntaxError('JSON input is empty.');
  }

  let lastError = 'Unknown parse error';
  const tried = new Set<string>();

  function tryParse(s: string): T | null {
    const t = s.trim();
    if (!t) return null;
    if (tried.has(t)) return null;
    tried.add(t);
    try {
      return JSON.parse(t) as T;
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
      return null;
    }
  }

  const minimal = minimalClean(raw);
  const balanced = extractBalancedJsonFragment(minimal);

  const preRepair: string[] = [
    raw.trim(),
    minimal,
    ...(balanced ? [balanced] : []),
    sanitizeJSONString(raw),
  ];

  for (const candidate of preRepair) {
    const v = tryParse(candidate);
    if (v !== null) return v;
  }

  const repairFns: Array<() => string> = [
    () => jsonrepair(raw.trim()),
    () => jsonrepair(minimal),
    () => jsonrepair(balanced ?? minimal),
    () => jsonrepair(sanitizeJSONString(raw)),
  ];

  for (const get of repairFns) {
    let repaired: string;
    try {
      repaired = get();
    } catch {
      continue;
    }
    const v = tryParse(repaired);
    if (v !== null) return v;
  }

  throw new SyntaxError(
    lastError === 'Unknown parse error'
      ? 'Could not parse JSON after repair attempts.'
      : lastError,
  );
}

/** Canonical JSON string for FormData / APIs after lenient parse */
export function repairJSONToParseableString(raw: string): string {
  return JSON.stringify(parseLenientJSON(raw));
}
