import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq, asc } from 'drizzle-orm';
import { TestimonialsClient } from './TestimonialsClient';

export async function Testimonials() {
  // Server-side fetching during SSG/SSR
  const data = await db
    .select()
    .from(testimonials)
    .where(eq(testimonials.isActive, true))
    .orderBy(asc(testimonials.displayOrder));

  // Default fallback if no data
  if (!data || data.length === 0) {
    return null; // Or return a skeleton, but usually we just hide the section if empty
  }

  return <TestimonialsClient data={data} />;
}
