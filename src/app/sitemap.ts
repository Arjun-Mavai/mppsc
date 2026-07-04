import { MetadataRoute } from 'next';
import { db } from '@/db';
import { contentBlogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

/**
 * 🗺️ SITEMAP - Search engines ko batao ki kya crawl karna h
 *
 * Bhai sitemap me sirf WAHI pages daalo jo:
 * 1. Public h (login ke bina accessible)
 * 2. SEO value h (Google se traffic la sake)
 * 3. Unique content h (duplicate/user-specific nahi)
 *
 * MPPSC keywords se related pages jyada priority do
 * jis se "MPPSC preparation", "MPPSC syllabus" etc search kare to mile
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mppsc.zenscroll.app';

  // Static pages jo hamesha rahenge - ye h tumhara SEO ka backbone
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0, // Home page = sabse important
    },
    {
      url: `${baseUrl}/syllabus`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.95, // "MPPSC syllabus" search ke liye gold mine
    },
    {
      url: `${baseUrl}/syllabus/quiz`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85, // "MPPSC test series" search ke liye
    },
    {
      url: `${baseUrl}/blogs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8, // Blog listing = organic traffic driver
    },
    {
      url: `${baseUrl}/upgrade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/tests`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85, // "MPPSC test series free" — high search volume
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/paper-solution`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // High priority for "MPPSC 2026 prelims paper solved"
    },
    {
      url: `${baseUrl}/mains`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9, // "MPPSC Mains"
    },
    {
      url: `${baseUrl}/mains/syllabus`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85, // "MPPSC Mains Syllabus"
    },
    {
      url: `${baseUrl}/mains/syllabus/pyq-library`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85, // "MPPSC Mains PYQ Library"
    },
  ];

  try {
    // Mains Syllabus Paper pages - "MPPSC Mains Paper 1/2/3/4/5/6"
    const mainsPaperPages: MetadataRoute.Sitemap = Array.from({ length: 6 }, (_, i) => ({
      url: `${baseUrl}/mains/syllabus/${i + 1}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    // Syllabus unit pages - "MPPSC unit 1/2/3..." search ke liye
    // Ye public pages h - koi bhi dekh sakta h (login ke bina bhi)
    const syllabusPages: MetadataRoute.Sitemap = Array.from({ length: 17 }, (_, i) => ({
      url: `${baseUrl}/syllabus/unit_${i + 1}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }));

    // Blog pages - ye h tumhara organic traffic ka engine
    // "MPPSC preparation tips", "MPPSC 2026 strategy" etc search me aayega
    const allBlogs = await db
      .select({
        slug: contentBlogs.slug,
        updatedAt: contentBlogs.updatedAt,
      })
      .from(contentBlogs)
      .where(eq(contentBlogs.isPublished, true));

    const blogPages: MetadataRoute.Sitemap = allBlogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug}`,
      lastModified: blog.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));

    // Quiz category pages - public landing pages for test types
    const quizPages: MetadataRoute.Sitemap = [
      {
        url: `${baseUrl}/syllabus/quiz/full-length`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      },
      {
        url: `${baseUrl}/syllabus/quiz/pyq`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8, // "MPPSC previous year questions" = high value
      },
      {
        url: `${baseUrl}/syllabus/quiz/csat`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      },
      {
        url: `${baseUrl}/syllabus/quiz/units`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.75,
      },
    ];

    const allPages = [...staticPages, ...mainsPaperPages, ...syllabusPages, ...blogPages, ...quizPages];

    return allPages;
  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
    return staticPages;
  }
}
