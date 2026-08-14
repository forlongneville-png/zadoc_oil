// FILE: app/robots.ts
// ROUTE: /robots.txt (Next.js generates this route from this file)
//
// Phase 10 (SEO fix): added /admin and /add_products to every disallow
// list — both are real gated routes (see app/admin/page.tsx and
// app/add_products/page.tsx) that were missing here.
import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zadoc.online';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/api', '/profile', '/admin', '/add_products'],
      },
      // Explicitly welcome AI answer-engine crawlers (GEO) onto the public
      // marketing pages — they respect these tokens even though Google's
      // generic rule above already covers them.
      { userAgent: 'GPTBot', allow: '/', disallow: ['/dashboard', '/api', '/profile', '/admin', '/add_products'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/dashboard', '/api', '/profile', '/admin', '/add_products'] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/dashboard', '/api', '/profile', '/admin', '/add_products'] },
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/dashboard', '/api', '/profile', '/admin', '/add_products'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}