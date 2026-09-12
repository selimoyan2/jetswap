import type { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/data/blogPosts'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://jetswap.com.tr'
  const currentDate = new Date().toISOString()

  // Base core pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          tr: `${baseUrl}?lang=tr`,
          en: `${baseUrl}?lang=en`,
        },
      },
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          tr: `${baseUrl}/blog?lang=tr`,
          en: `${baseUrl}/blog?lang=en`,
        },
      },
    },
  ]

  // Dynamic Blog Post routes
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.publishedAt || currentDate,
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: {
      languages: {
        tr: `${baseUrl}/blog/${post.slug}?lang=tr`,
        en: `${baseUrl}/blog/${post.slug}?lang=en`,
      },
    },
  }))

  return [...staticRoutes, ...blogRoutes]
}
