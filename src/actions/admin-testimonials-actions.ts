'use server';

import { db } from '@/db';
import { testimonials } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/lib/auth';

export async function addOrUpdateTestimonial(formData: FormData) {
  try {
    await assertAdmin();

    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as string;
    const location = formData.get('location') as string;
    const comment = formData.get('comment') as string;
    const image = formData.get('image') as string;
    const stars = parseInt(formData.get('stars') as string) || 5;
    const displayOrder = parseInt(formData.get('displayOrder') as string) || 0;
    const isActive = formData.get('isActive') === 'on' || formData.get('isActive') === 'true';

    if (!name || !comment) {
      return { success: false, error: 'Name and comment are required.' };
    }

    if (id) {
      // Update
      await db.update(testimonials).set({
        name,
        role,
        location,
        comment,
        image: image || null,
        stars,
        displayOrder,
        isActive,
      }).where(eq(testimonials.id, id));
    } else {
      // Create
      await db.insert(testimonials).values({
        id: nanoid(),
        name,
        role,
        location,
        comment,
        image: image || null,
        stars,
        displayOrder,
        isActive,
        examType: 'mppsc'
      });
    }

    revalidatePath('/admin/testimonials');
    revalidatePath('/'); // Revalidate the homepage where testimonials are shown
    revalidatePath('/pricing'); // Revalidate the pricing page

    return { success: true };
  } catch (error) {
    console.error('Failed to save testimonial:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}

export async function deleteTestimonial(id: string) {
  try {
    await assertAdmin();
    await db.delete(testimonials).where(eq(testimonials.id, id));
    revalidatePath('/admin/testimonials');
    revalidatePath('/');
    revalidatePath('/pricing');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete testimonial:', error);
    return { success: false, error: 'Internal Server Error' };
  }
}
