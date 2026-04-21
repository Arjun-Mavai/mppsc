'use server';

// Blog Actions — Admin blog upload + cached blog fetching
// revalidateTag se on-demand cache bust hota h, unstable_cache se data cache hota h
import { db } from '@/db';
import { contentBlogs, mppscUsers } from '@/db/schema';
import { verifyAuth } from '@/lib/auth';
import { revalidatePath, revalidateTag } from 'next/cache';
import { logger } from '@/lib/logger';
import { CACHE } from '@/lib/cache';
import { eq } from 'drizzle-orm';
import * as blogService from '@/services/blog-service';

/**
 * uploadBlog — Admin-only server action, blog DB me daalti h
 * Auth check → Admin check → JSON parse → DB insert → Cache bust
 */
export async function uploadBlog(data: any) {
  const user = await verifyAuth();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Admin check — sirf admin hi blog upload kar sakta h
  const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
  if (!dbUser || dbUser.role !== 'admin') {
    return { success: false, error: 'Forbidden: Admin only' };
  }

  try {
    const { imageUrl, contentJson } = data;
    const parsed = JSON.parse(contentJson);

    if (!parsed.metadata || !parsed.content) {
      return { success: false, error: "Invalid JSON: Must contain 'metadata' and 'content' keys" };
    }

    const { metadata, content } = parsed;

    if (!metadata.title || !metadata.slug || !metadata.category) {
      return { success: false, error: 'Missing required metadata: title, slug, or category' };
    }

    // Content bilingual hona chahiye — hi aur en dono keys zaroori
    if (!content.hi || !content.en) {
      return { success: false, error: "Content must have both 'hi' and 'en' keys" };
    }

    // Helper to extract text from complex block structures
    const extractTextIteratively = (content: any): string => {
      if (!content) return '';
      if (typeof content === 'string') return content;
      if (Array.isArray(content)) {
        return content.map((item) => extractTextIteratively(item)).join(' ');
      }
      if (typeof content === 'object') {
        if (content.type === 'h2' || content.type === 'h3' || content.type === 'p')
          return content.text || '';
        if (content.type === 'ul' || content.type === 'ol')
          return Array.isArray(content.items) ? content.items.join(' ') : '';
        if (content.type === 'table')
          return Array.isArray(content.body)
            ? content.body.map((row: any[]) => row.join(' ')).join(' ')
            : '';
        if (content.type === 'fact_card') return content.facts ? content.facts.join(' ') : '';
        return content.text || content.title || content.description || '';
      }
      return '';
    };

    // Auto-generate excerpt from Hindi content (preferred) or English
    const blocksToProcess = content.hi && content.hi.length > 0 ? content.hi : content.en || [];
    let textContent = extractTextIteratively(blocksToProcess);
    textContent = textContent.replace(/\s+/g, ' ').trim();

    // Generate Description (Ideal: ~150-300 chars)
    let description = metadata.description;
    if (!description || description.trim().length < 10) {
      // Try to find first paragraph
      let introText = textContent;
      const firstPara = blocksToProcess.find((b: any) => b.type === 'p');
      if (firstPara && firstPara.text) introText = firstPara.text;
      description = introText.substring(0, 300) + (introText.length > 300 ? '...' : '');
    }

    // Generate Excerpt (~160 chars)
    const excerpt =
      (description || textContent).substring(0, 160) +
      ((description || textContent).length > 160 ? '...' : '');

    await db.insert(contentBlogs).values({
      id: crypto.randomUUID(),
      title: metadata.title,
      slug: metadata.slug,
      description: description || '',
      excerpt, // Robustly generated excerpt
      category: metadata.category,
      imageUrl: imageUrl || null,
      readingTime: parseInt(metadata.readingTime) || 5,
      content,
      contentType: metadata.type || 'blog',
      unitId: metadata.unit || null,
      topicId: metadata.topic || null, // Store the topic string directly as provided
      isPremium: metadata.isPremium !== undefined ? metadata.isPremium : true, // Legacy flag
      isFreeAccess: metadata.isPremium === false || metadata.isFreeAccess === true, // Free if not premium
      isLiteAccess: false, // Default: not for lite
      isProAccess: true, // Default: pro users can access
      examType: 'mppsc' as const, // 🔒 Strict isolation
      isPublished: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Cache bust — blog list aur specific slug dono ka cache hata do
    revalidatePath('/blogs');
    revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 }); // Bust list cache
    revalidateTag(CACHE.BLOGS.TAGS.DETAIL(metadata.slug), { expire: 0 }); // Bust detail cache

    return { success: true };
  } catch (error: any) {
    logger.error('Upload Blog Error:', error);
    if (error.code === 'SQLITE_CONSTRAINT') {
      return { success: false, error: 'Slug already exists' };
    }
    return { success: false, error: error.message || 'Failed to create blog post' };
  }
}

/**
 * toggleBlogPremium — Toggle premium status of a blog
 */
export async function toggleBlogPremium(blogId: string, isPremium: boolean) {
  const user = await verifyAuth();
  if (!user) return { success: false, error: 'Unauthorized' };

  // Admin check
  const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
  if (!dbUser || dbUser.role !== 'admin') {
    return { success: false, error: 'Forbidden: Admin only' };
  }

  try {
    await db
      .update(contentBlogs)
      .set({
        isPremium,
        isFreeAccess: !isPremium, // Keep in sync
        updatedAt: new Date(),
      })
      .where(eq(contentBlogs.id, blogId));

    revalidatePath('/blogs');
    revalidateTag(CACHE.BLOGS.TAGS.ALL, { expire: 0 });

    // Also fetch slug to revalidate detail page
    const blog = await db
      .select({ slug: contentBlogs.slug })
      .from(contentBlogs)
      .where(eq(contentBlogs.id, blogId))
      .get();
    if (blog) {
      revalidateTag(CACHE.BLOGS.TAGS.DETAIL(blog.slug), { expire: 0 });
    }

    return { success: true };
  } catch (error: any) {
    logger.error('Toggle Blog Premium Error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * getCachedBlogs — unstable_cache se wrapped, 1 hour cache
 * Used for generateStaticParams to fetch ALL blogs
 */
export const getCachedBlogs = blogService.getCachedBlogs;

/**
 * getBlogCounts — Fetch counts of blogs per unit with caching
 * Zero impact on performance due to server-side caching
 */
export const getBlogCounts = blogService.getBlogCounts;

/**
 * getBlogs — Paginated, filtered blog fetcher
 */
export async function getBlogs(params: any = {}) {
  // Security Check: isAdmin flag should only be allowed for admins
  if (params.isAdmin) {
    const user = await verifyAuth();
    if (!user) {
      params.isAdmin = false;
    } else {
      const dbUser = await db.select().from(mppscUsers).where(eq(mppscUsers.id, user.id)).get();
      if (!dbUser || dbUser.role !== 'admin') {
        params.isAdmin = false;
      }
    }
  }

  return blogService.getBlogs(params);
}

/**
 * getBlogBySlug — slug se specific blog fetch, 1 hour cached
 * revalidateTag('blog-{slug}') se on-demand bust hoga
 */
export const getBlogBySlug = blogService.getBlogBySlug;
