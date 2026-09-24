import { NextResponse } from 'next/server';
import { db } from '@/db';
import { pricingConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { fetchPricingConfigRow } from '@/lib/pricing-db';
import { cookies } from 'next/headers';
import { revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { PRICING_DEFAULTS } from '@/config/pricing';
import { mergePricingRow } from '@/lib/pricing-merge';
import { pickPricingPutPayload } from '@/lib/pricing-api-allowlist';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 PRICING API — GET (public) + PUT (admin-only)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// GET: Anyone can fetch current pricing (cached with tag 'pricing')
// PUT: Admin updates pricing → cache busted → frontend reflects immediately
//
// Single-row table pattern: id='default' always
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// ── GET — Public, cached ────────────────────────────────────
export async function GET(request: Request) {
  let examType: 'upsc' | 'mppsc' | 'mppolice' = 'mppsc';
  try {
    const { searchParams } = new URL(request.url);
    const rawExamType = searchParams.get('examType');
    if (['upsc', 'mppsc', 'mppolice'].includes(rawExamType as string)) {
      examType = rawExamType as 'upsc' | 'mppsc' | 'mppolice';
    }

    const row = await fetchPricingConfigRow(examType);
    const pricing = { ...mergePricingRow(row), examType };

    return NextResponse.json(
      examType === 'mppsc'
        ? {
            pricing,
            mppscProductCopyJson:
              ((row ?? {}) as Record<string, unknown>)?.mppscProductCopyJson ?? null,
          }
        : { pricing },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (error) {
    logger.error('Pricing GET error:', error);
    return NextResponse.json({
      pricing: { ...mergePricingRow(null), examType },
      ...(examType === 'mppsc' ? { mppscProductCopyJson: null } : {}),
    });
  }
}

// ── PUT — Admin-only, updates pricing + busts cache ─────────
export async function PUT(request: Request) {
  try {
    // Admin auth check
    const cookieStore = await cookies();
    const { extractAuthToken } = await import('@/lib/auth-constants');
    const token = extractAuthToken(cookieStore);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { verifyToken } = await import('@/lib/jwt');
    const decoded: any = verifyToken(token);
    if (!decoded?.userId) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const adminUser = await db.query.mppscUsers.findFirst({
      where: (users, { eq }) => eq(users.id, decoded.userId),
    });
    if (!adminUser || adminUser.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { examType, ...data } = body;

    if (!examType) {
      return NextResponse.json({ error: 'examType is required' }, { status: 400 });
    }

    const safeUpdates = pickPricingPutPayload(data as Record<string, unknown>);

    // Upsert — insert if not exists, update if exists
    const existing = await db
      .select()
      .from(pricingConfig)
      .where(eq(pricingConfig.id, examType))
      .limit(1);

    if (existing.length === 0) {
      await db.insert(pricingConfig).values({
        id: examType as string,
        ...(safeUpdates as Record<string, never>),
        updatedAt: new Date(),
      });
    } else {
      await db
        .update(pricingConfig)
        .set({ ...(safeUpdates as Record<string, never>), updatedAt: new Date() })
        .where(eq(pricingConfig.id, examType as string));
    }

    // Bust pricing cache
    // @ts-ignore - Some versions of Next.js expect 1 or 2 arguments
    revalidateTag('pricing', { expire: 0 });

    logger.info(`Pricing updated by admin for ${examType}`);

    return NextResponse.json({
      success: true,
      message: `Pricing updated for ${examType}!`,
    });
  } catch (error) {
    logger.error('Pricing PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
