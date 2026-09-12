import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Clock, User, Tag, Share2, ArrowRight, Sparkles, BookOpen, HelpCircle } from 'lucide-react'
import { BLOG_POSTS, BlogPost } from '@/data/blogPosts'
import { ArticleJsonLd, FaqJsonLd } from '@/components/seo/json-ld'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    return {
      title: 'Yazı Bulunamadı | JetSwap Blog',
    }
  }

  const url = `https://jetswap.com.tr/blog/${post.slug}`

  return {
    title: `${post.titleTr} | JetSwap Takas Rehberi`,
    description: post.summaryTr,
    keywords: post.tags,
    alternates: {
      canonical: url,
      languages: {
        'tr-TR': `${url}?lang=tr`,
        'en-US': `${url}?lang=en`,
      },
    },
    openGraph: {
      title: `${post.titleTr} | JetSwap`,
      description: post.summaryTr,
      url: url,
      siteName: 'JetSwap',
      locale: 'tr_TR',
      alternateLocale: ['en_US'],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.titleTr,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.titleTr,
      description: post.summaryTr,
      images: [post.coverImage],
    },
  }
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = BLOG_POSTS.find((p) => p.slug === slug)

  if (!post) {
    notFound()
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)

  // Format schema FAQs
  const schemaFaqs = post.faqs.map((f) => ({
    question: f.questionTr,
    answer: f.answerTr,
  }))

  return (
    <article className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Dynamic JSON-LD Schemas */}
      <ArticleJsonLd
        title={post.titleTr}
        description={post.summaryTr}
        url={`https://jetswap.com.tr/blog/${post.slug}`}
        publishedAt={post.publishedAt}
        authorName={post.author}
        imageUrl={post.coverImage}
      />
      <FaqJsonLd faqs={schemaFaqs} />

      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/blog"
            className="text-xs font-bold text-zinc-600 hover:text-emerald-700 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Rehberlere Dön</span>
          </Link>

          <Link
            href="/"
            className="text-xs font-bold text-zinc-900 hover:text-emerald-700 font-mono tracking-tight"
          >
            Jet<span className="text-emerald-600 font-black">Swap</span>.com.tr
          </Link>
        </div>
      </header>

      {/* Main Article Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Breadcrumb Navigation (Google Breadcrumbs) */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-[11px] text-zinc-500 font-medium">
            <li>
              <Link href="/" className="hover:text-emerald-700">Ana Sayfa</Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/blog" className="hover:text-emerald-700">Rehber & Blog</Link>
            </li>
            <li>/</li>
            <li className="text-zinc-800 font-bold truncate max-w-[200px] sm:max-w-md">
              {post.titleTr}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <div className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wide border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            {post.categoryTr}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight leading-tight">
            {post.titleTr}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed font-normal">
            {post.summaryTr}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-2 border-t border-zinc-200">
            <span className="flex items-center gap-1 font-semibold text-zinc-800">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {post.author} ({post.authorRole})
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              {post.readTimeTr}
            </span>
            <span>•</span>
            <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR')}</span>
          </div>
        </div>

        {/* Cover Image */}
        <div className="relative aspect-[16/9] rounded-3xl overflow-hidden mb-10 shadow-lg border border-zinc-200">
          <img
            src={post.coverImage}
            alt={post.titleTr}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="prose prose-zinc max-w-none space-y-6 text-zinc-800 text-sm sm:text-base leading-relaxed bg-white p-6 sm:p-10 rounded-3xl border border-zinc-200 shadow-xs mb-10">
          <div className="whitespace-pre-line font-normal">
            {post.contentTr}
          </div>

          {/* Tags */}
          <div className="pt-6 border-t border-zinc-100 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-zinc-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Etiketler:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-700 text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* FAQ Section specific to this article */}
        {post.faqs.length > 0 && (
          <div className="mb-12 p-6 sm:p-8 bg-emerald-50/70 border border-emerald-200 rounded-3xl space-y-4">
            <div className="flex items-center gap-2 text-emerald-900">
              <HelpCircle className="w-5 h-5 text-emerald-700" />
              <h3 className="font-extrabold text-base sm:text-lg">
                Sıkça Sorulan Sorular
              </h3>
            </div>

            <div className="space-y-3">
              {post.faqs.map((faq, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs space-y-1">
                  <h4 className="font-bold text-xs sm:text-sm text-zinc-900">
                    {faq.questionTr}
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    {faq.answerTr}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <div className="space-y-4 mb-12">
            <h3 className="font-black text-lg text-zinc-900">
              İlginizi Çekebilecek Diğer Rehberler
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug}`}
                  className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-emerald-500/40 hover:shadow-md transition-all group flex flex-col justify-between space-y-2"
                >
                  <h4 className="font-bold text-xs text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {rel.titleTr}
                  </h4>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-auto">
                    Rehberi Oku <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Box */}
        <div className="rounded-3xl bg-zinc-900 p-8 text-white text-center space-y-4 shadow-xl">
          <Sparkles className="w-8 h-8 text-emerald-400 mx-auto animate-pulse" />
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Eşyalarını Nakit Harcamadan Takaslamaya Hazır mısın?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
            Hemen ücretsiz üye ol, elindeki eşyayı portföyüne ekle ve binlerce takas ilanı arasından JetMatch ile eşleş.
          </p>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm px-6 py-3 rounded-xl transition-all shadow-md hover:scale-105"
            >
              <span>Hemen İlanlara Göz At</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>
    </article>
  )
}
