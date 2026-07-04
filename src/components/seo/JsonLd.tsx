import React from 'react';

type JsonLdProps = {
  schema: Record<string, any>;
};

/**
 * Reusable JSON-LD component to inject structured data safely into Next.js pages.
 * 
 * Usage example for an Article:
 * <JsonLd schema={{
 *   "@context": "https://schema.org",
 *   "@type": "Article",
 *   "headline": "MPPSC 2027 Complete Strategy",
 *   "author": [{ "@type": "Person", "name": "ZenScroll Expert" }]
 * }} />
 */
export function JsonLd({ schema }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Pre-defined schema generators for MPPSC pages

export const generateFAQSchema = (faqs: { question: string; answer: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
});

export const generateCourseSchema = (courseName: string, description: string, url: string) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name: courseName,
  description: description,
  provider: {
    '@type': 'Organization',
    name: 'ZenScroll MPPSC',
    sameAs: url,
  },
});
