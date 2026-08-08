import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zadoc.online';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api', '/profile'],
      },
      // Explicitly welcome AI answer-engine crawlers (GEO) onto the public
      // marketing pages — they respect these tokens even though Google's
      // generic rule above already covers them.
      { userAgent: 'GPTBot', allow: '/', disallow: ['/dashboard', '/admin', '/api', '/profile'] },
      { userAgent: 'PerplexityBot', allow: '/', disallow: ['/dashboard', '/admin', '/api', '/profile'] },
      { userAgent: 'ClaudeBot', allow: '/', disallow: ['/dashboard', '/admin', '/api', '/profile'] },
      { userAgent: 'Google-Extended', allow: '/', disallow: ['/dashboard', '/admin', '/api', '/profile'] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}