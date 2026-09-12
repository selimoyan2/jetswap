import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin/'],
      },
      {
        userAgent: [
          'GPTBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Applebot-Extended',
          'CCBot',
          'cohere-ai'
        ],
        allow: ['/', '/blog', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin', '/api/admin/'],
      },
    ],
    sitemap: 'https://jetswap.com.tr/sitemap.xml',
  }
}
