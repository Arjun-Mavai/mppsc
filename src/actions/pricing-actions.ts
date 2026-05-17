'use server';

import { fetchPricingConfigRow } from '@/lib/pricing-db';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { mergePricingRow } from '@/lib/pricing-merge';
import { mergeMppscProductCopy, type MppscProductCopyV1 } from '@/config/mppsc-product-copy';

export type PricingPayload = {
  pricing: ReturnType<typeof mergePricingRow>;
  /** MPPSC-only merged copy (defaults + `pricing_config.mppsc_product_copy_json`). Null for other exams. */
  mppscProductCopy: MppscProductCopyV1 | null;
};

/**
 * 💰 Get Pricing Data (Server Action)
 *
 * Fetches current pricing configuration from database.
 * Falls back to defaults if not found.
 * DB columns can be null, so we coerce to PricingData with defaults.
 *
 * Benefits over API route:
 * - No API endpoint visible
 * - Type-safe
 * - Automatic caching
 */
export async function getPricingData(examType: 'upsc' | 'mppsc' | 'mppolice' = 'mppsc'): Promise<PricingPayload> {
  const emptyCopy = (): PricingPayload => ({
    pricing: PRICING_DEFAULTS,
    mppscProductCopy: examType === 'mppsc' ? mergeMppscProductCopy(null) : null,
  });

  try {
    const row = await fetchPricingConfigRow(examType);

    if (row) {
      const r = row as Record<string, unknown>;
      return {
        pricing: mergePricingRow(row),
        mppscProductCopy:
          examType === 'mppsc'
            ? mergeMppscProductCopy((r.mppscProductCopyJson as string | null | undefined) ?? null)
            : null,
      };
    }
    return emptyCopy();
  } catch {
    return emptyCopy();
  }
}
