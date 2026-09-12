'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, BookOpen, Clock, ArrowRight, User, Sparkles, Tag, ArrowLeftRight, Globe, Shield } from 'lucide-react'
import { BLOG_POSTS, BlogPost } from '@/data/blogPosts'
import { useLanguage } from '@/i18n'
import FaqSection from '@/components/faq-section'

export default function BlogIndexPage() {
  const { language, toggleLanguage, t } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const isTr = language === 'tr'

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    BLOG_POSTS.forEach(p => {
      set.add(isTr ? p.categoryTr : p.categoryEn)
    })
    return ['ALL', ...Array.from(set)]
  }, [isTr])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return BLOG_POSTS.filter(post => {
      const title = isTr ? post.titleTr : post.titleEn
      const summary = isTr ? post.summaryTr : post.summaryEn
      const category = isTr ? post.categoryTr : post.categoryEn
      const tags = post.tags.join(' ')

      const matchesSearch = !searchQuery.trim() || 
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tags.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCat = selectedCategory === 'ALL' || category === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [searchQuery, selectedCategory, isTr])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="font-black text-xl tracking-tight text-zinc-900">Jet<span className="text-emerald-600">Swap</span></span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold text-zinc-600 hover:text-emerald-600 transition-colors"
            >
              {t.blog.backToHome}
            </Link>

            {/* Language Switch */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 text-zinc-800 transition-colors cursor-pointer bg-white shadow-2xs"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isTr ? '🇹🇷 TR' : '🇬🇧 EN'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            {t.blog.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 tracking-tight">
            {t.blog.title}
          </h1>
          <p className="text-sm text-zinc-600 leading-relaxed">
            {t.blog.subtitle}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md mx-auto pt-2">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 mt-1" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.blog.searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-2xl text-xs text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-xs"
            />
          </div>

          {/* Categories Pill Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat
              const label = cat === 'ALL' ? t.blog.allCategories : cat
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300'
                  }`}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Posts Grid */}
        {filteredPosts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
            <BookOpen className="w-10 h-10 text-zinc-400 mx-auto mb-3" />
            <p className="text-sm text-zinc-600 font-medium">{t.blog.noPostsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredPosts.map((post) => {
              const title = isTr ? post.titleTr : post.titleEn
              const summary = isTr ? post.summaryTr : post.summaryEn
              const category = isTr ? post.categoryTr : post.categoryEn
              const readTime = isTr ? post.readTimeTr : post.readTimeEn

              return (
                <article
                  key={post.id}
                  className="bg-white rounded-3xl border border-zinc-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col group"
                >
                  {/* Cover Image */}
                  <Link href={`/blog/${post.slug}`} className="relative aspect-[16/10] overflow-hidden bg-zinc-100 block">
                    <img
                      src={post.coverImage}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide uppercase">
                        {category}
                      </span>
                    </div>
                  </Link>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {readTime}
                        </span>
                        <span>•</span>
                        <span>{new Date(post.publishedAt).toLocaleDateString(isTr ? 'tr-TR' : 'en-US')}</span>
                      </div>

                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-base font-bold text-zinc-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                          {title}
                        </h2>
                      </Link>

                      <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed">
                        {summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[11px] text-zinc-600">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-[10px]">
                          JS
                        </div>
                        <span className="font-semibold truncate max-w-[120px]">{post.author}</span>
                      </div>

                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 flex items-center gap-1"
                      >
                        <span>{isTr ? 'Devamını Oku' : 'Read Guide'}</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {/* Embedded FAQ Section */}
        <FaqSection className="pt-6 border-t border-zinc-200" />

        {/* Global CTA Section */}
        <div className="mt-12 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-950 p-8 text-white text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {t.blog.ctaTitle}
            </h3>
            <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
              {t.blog.ctaSubtitle}
            </p>
          </div>

          <Link
            href="/"
            className="px-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 cursor-pointer flex-shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{t.blog.startSwapping}</span>
          </Link>
        </div>
      </main>
    </div>
  )
}
