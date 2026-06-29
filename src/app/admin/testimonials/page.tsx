import { assertAdmin } from '@/lib/auth';
import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { desc } from 'drizzle-orm';
import TestimonialsAdminClient from './TestimonialsAdminClient';

export const metadata = { title: 'Testimonials Admin' };
export const dynamic = 'force-dynamic';

export default async function TestimonialsAdminPage() {
  await assertAdmin();

  const data = await db
    .select()
    .from(testimonials)
    .orderBy(desc(testimonials.createdAt));

  const formattedData = data.map(d => ({
    id: d.id,
    name: d.name,
    role: d.role ?? undefined,
    location: d.location ?? undefined,
    comment: d.comment,
    image: d.image ?? undefined,
    stars: d.stars ?? 5,
    displayOrder: d.displayOrder ?? 0,
    isActive: d.isActive ?? true,
  }));

  return <TestimonialsAdminClient initialData={formattedData} />;
}
