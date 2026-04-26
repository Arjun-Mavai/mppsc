// ============================================
// CANONICAL TEST IDS - Verified from PROD DB
// These papers (2020–2026) drive Intelligence: Overall Weightage + Paper-wise Analysis
// (and subject totals). Each year should be one primary Prelims Paper 1 test.
// ============================================
export const CANONICAL_TEST_IDS: Record<number, string> = {
  2020: '5KRVTgTIw07bWNxu20YNl',
  2021: 'ix0FnJV496Rgvw0YHOEFj',
  2022: 'o_rO3J1tSEACKENOLT9QI',
  2023: 'mQ1a9hZoTdfSRfkz40K5C',
  2024: '3XmZ0l700BJV3j2FLd0XZ',
  2025: 'D0gf6bklgl3RT-sTnue2n',
  2026: 'n9Zy8u3ytAf1ZPB9W_Rbk',
};

/** If a PYQ test title does not match `getScopedStateServiceYear`, map test id → year for scoped insights. */
export const PYQ_SCOPED_TEST_ID_YEAR: Record<string, number> = {
  n9Zy8u3ytAf1ZPB9W_Rbk: 2026,
};

// Helper to get canonical test IDs as array
export function getCanonicalTestIds(): string[] {
  return Object.values(CANONICAL_TEST_IDS);
}

// Helper to get year from test ID - O(1) lookup using pre-computed map
export function getYearFromTestId(testId: string): number {
  return TEST_ID_TO_YEAR[testId] ?? 2020; // fallback
}

// Create test ID to year mapping for quick lookups
export const TEST_ID_TO_YEAR: Record<string, number> = {};
for (const [year, testId] of Object.entries(CANONICAL_TEST_IDS)) {
  TEST_ID_TO_YEAR[testId] = Number(year);
}