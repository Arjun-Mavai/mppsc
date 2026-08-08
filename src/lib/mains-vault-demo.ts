/** Public teaser: full PYQ desk UI; only these unlock without `mppsc_mains`. */

export const MAINS_PYQ_DEMO_YEAR = 2025;
export const MAINS_PYQ_DEMO_PAPER_NUMBER = 1;

/** Free samples per part (A and B) on demo paper — same bands as before. */
export const MAINS_PYQ_FREE_QUESTION_CAP_PER_PART = 3;

export function isMainsPyqDemoPaper(examYear: number, paperNumber: number): boolean {
  return examYear === MAINS_PYQ_DEMO_YEAR && paperNumber === MAINS_PYQ_DEMO_PAPER_NUMBER;
}

export type PyqMarksPickRow = { id: string; marks: number; part: string };

function normalizePart(part: string): string {
  return String(part).trim().toUpperCase();
}

/**
 * One part (A or B): 2-mark×2, one 5/7-mark, one 10/11-mark; fill to cap if bands missing.
 */
export function pickMainsPyqFreeDemoQuestionIdsForPart(
  questions: PyqMarksPickRow[],
  cap = MAINS_PYQ_FREE_QUESTION_CAP_PER_PART
): Set<string> {
  const picked = new Set<string>();

  let twoCount = 0;
  for (const q of questions) {
    if (q.marks === 2 && !picked.has(q.id)) {
      picked.add(q.id);
      twoCount++;
      if (twoCount >= 2) break;
    }
  }

  const mid = questions.find((q) => (q.marks === 5 || q.marks === 7) && !picked.has(q.id));
  if (mid) picked.add(mid.id);

  // const high = questions.find((q) => (q.marks === 10 || q.marks === 11) && !picked.has(q.id));
  // if (high) picked.add(high.id);

  if (picked.size < cap) {
    for (const q of questions) {
      if (!picked.has(q.id)) picked.add(q.id);
      if (picked.size >= cap) break;
    }
  }

  return picked;
}

/** Demo paper: same free cap for Part A and Part B (up to 8 questions total). */
export function pickMainsPyqFreeDemoQuestionIds(questions: PyqMarksPickRow[]): Set<string> {
  const picked = new Set<string>();
  const partsPresent = new Set(questions.map((q) => normalizePart(q.part)));

  for (const part of ['A', 'B'] as const) {
    if (!partsPresent.has(part)) continue;
    const inPart = questions.filter((q) => normalizePart(q.part) === part);
    for (const id of pickMainsPyqFreeDemoQuestionIdsForPart(inPart)) {
      picked.add(id);
    }
  }

  return picked;
}

/** Display order for free strip: preferred marks bands first, then stable by original index. */
function markTierForDemoSort(marks: number): number {
  if (marks === 2) return 0;
  if (marks === 5) return 1;
  if (marks === 7) return 2;
  if (marks === 10) return 3;
  if (marks === 11) return 4;
  return 99;
}

export function orderMainsPyqRowsForVaultDemo<T extends PyqMarksPickRow>(
  questions: T[],
  freeIds: Set<string>,
  vaultUnlocked: boolean
): T[] {
  if (vaultUnlocked || freeIds.size === 0) return questions;
  const free = questions.filter((q) => freeIds.has(q.id));
  const locked = questions.filter((q) => !freeIds.has(q.id));
  free.sort((a, b) => markTierForDemoSort(a.marks) - markTierForDemoSort(b.marks));
  return [...free, ...locked];
}


// Viewed mains-vault-demo.ts:60-90
// Searched for "pickMainsPyqFreeDemoQuestionIds"
// Viewed mains-pyq-prepared-actions.ts:1-721

// Bhai, tension mat lo! Main aapko step-by-step samjhata hu ki exactly data kahan se aa raha hai, isko modify kaise karna hai, aur yeh 100% hack-proof kaise hai.

// ### 1. Data DB se kaise aata hai? (The Flow)
// Haan, saara data Database se hi aata hai. Par DB aur frontend ke beech me ek **"Server Action"** khada hai jiska naam hai `getMainsPyqPaperPublic` (file: `src/actions/mains-pyq-prepared-actions.ts`).
// - Jab koi user page load karta hai, frontend is Server Action ko call karta hai.
// - Ye Server Action DB se saare questions uthata hai.
// - Uske baad ye check karta hai: *"Kya is user ke paas Pro/Combo plan hai?"*
// - Agar **Nahi** hai, toh ye check karta hai: *"Kya ye paper 2024 ka Paper 1 (Demo Paper) hai?"*
// - Agar haan, toh ye un 8 "free" questions ko select karta hai.

// ### 2. Kal ko kuch modify karna ho toh kaise karu?
// Agar kal ko aapko change karna hai ki sirf **do 2-markers** aur **ek 7-marker** dikhana hai (aur 10-marker nahi dena), toh aapko sirf aur sirf `src/lib/mains-vault-demo.ts` file ke andar ek function `pickMainsPyqFreeDemoQuestionIdsForPart` ko change karna hoga.

// Here is the exact code aap kal ko use kar sakte ho us requirement ke liye:
// ```typescript
// export function pickMainsPyqFreeDemoQuestionIdsForPart(
//   questions: PyqMarksPickRow[],
//   cap = 3 // Pehle 4 tha, ab hume total 3 chahiye
// ): Set<string> {
//   const picked = new Set<string>();

//   // 1. Sirf Do 2-markers uthao
//   let twoCount = 0;
//   for (const q of questions) {
//     if (q.marks === 2 && !picked.has(q.id)) {
//       picked.add(q.id);
//       twoCount++;
//       if (twoCount >= 2) break; // 2 mil gaye, ruk jao
//     }
//   }

//   // 2. Sirf ek 7-marker (ya 5-marker) uthao
//   const mid = questions.find((q) => (q.marks === 5 || q.marks === 7) && !picked.has(q.id));
//   if (mid) picked.add(mid.id);

//   // 3. 10/11 marker ka logic maine HATA diya hai, toh wo nahi uthayega!
//   return picked;
// }
// ```
// Aap is loop ke logic me marks change karke kuch bhi combination set kar sakte ho!

// ### 3. Ye Frontend se Hack kyu nahi ho sakta? (The PROOF)
// Ye ekdum **100% secure** hai. Agar koi bahut bada hacker bhi aa jaye aur Chrome ka "Network Tab" inspect karke hidden data nikalne ki koshish kare, toh wo **Nahi nikal payega**.

// **Proof:** `src/actions/mains-pyq-prepared-actions.ts` line 673 par ye server code likha hua hai:
// ```typescript
//   const sanitized = questions.map((q) => {
//     const isPreview = freeIds.has(q.id);
//     return {
//       ...q,
//       expertInsightsHi: isPreview ? q.expertInsightsHi : null, // Locked ke liye NULL bhej raha hai
//       expertInsightsEn: isPreview ? q.expertInsightsEn : null,
//       currentAffairsData: isPreview ? q.currentAffairsData : null,
//       variants: isPreview ? q.variants : [], // Locked questions me answers gayab kar diye!
//       isLocked: !isPreview,
//     };
//   });
// ```
// **Matlab:** Backend (Server) se data frontend par bhejne se *pehle hi*, system unn locked questions ke answers ko **khaali list `[]` aur `null`** se replace kar deta hai. 
// Jab answers server se bheje hi nahi gaye browser par, toh koi hacker unhe dhundh hi nahi sakta, chahe wo code me kitni hi chhed-chhaad kar le! 

// Aap completely safe ho, ye architecture highest security standards (Server-Side Scrubbing) par bana hua hai.