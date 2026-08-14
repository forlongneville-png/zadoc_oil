// FILE: app/sitemap.ts
// ROUTE: /sitemap.xml (Next.js generates this route from this file)
//
// Phase 10 (SEO fix): reviewed, no change needed. Only one public,
// unauthenticated route exists (/) — /dashboard, /profile, /admin, and
// /add_products are all gated and correctly excluded (see app/robots.ts).
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zadoc.online';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}