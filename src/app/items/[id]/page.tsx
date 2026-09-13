import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { 
  ArrowLeftRight, ArrowLeft, Shield, Star, MapPin, Eye, 
  Calendar, Tag, ShieldCheck, AlertCircle 
} from 'lucide-react'
import { Metadata } from 'next'

interface ItemDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: ItemDetailPageProps): Promise<Metadata> {
  const { id } = await props.params
  const item = await prisma.item.findUnique({
    where: { id },
    select: { title: true, description: true, images: true }
  })

  if (!item) {
    return {
      title: 'İlan Bulunamadı | JetSwap',
      description: 'Aradığınız takas ilanı bulunamadı.'
    }
  }

  return {
    title: `${item.title} | JetSwap Sıfır Nakit Takas`,
    description: item.description.slice(0, 160),
    openGraph: {
      title: `${item.title} | JetSwap`,
      description: item.description.slice(0, 160),
      images: item.images.length > 0 ? [item.images[0]] : undefined
    }
  }
}

const CONDITION_LABELS: Record<string, string> = {
  BRAND_NEW: 'Sıfır / Kutusunda',
  LIKE_NEW: 'Sıfıra Yakın / Tertemiz',
  GOOD: 'İyi Durumda',
  FAIR: 'Kullanılmış / Çalışır Durumda',
}

const TRADE_METHOD_LABELS: Record<string, string> = {
  HAND_TO_HAND: 'Yalnızca Elden Teslim',
  CARGO_ONLY: 'Yalnızca Kargo İle',
  BOTH: 'Elden veya Kargo İle',
}

export default async function ItemDetailPage(props: ItemDetailPageProps) {
  const { id } = await props.params

  const item = await prisma.item.findUnique({
    where: { id },
    include: {
      category: true,
      wants: {
        include: {
          category: true,
        },
        orderBy: {
          priority: 'asc',
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          rating: true,
          reviewCount: true,
          city: true,
          country: true,
          createdAt: true,
        }
      }
    }
  })

  if (!item) {
    notFound()
  }

  // Safely increment viewCount asynchronously
  prisma.item.update({
    where: { id },
    data: { viewCount: { increment: 1 } }
  }).catch(() => {})

  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80']

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs py-1.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Shield className="w-3.5 h-3.5 text-emerald-200" />
        <span>Para Yok. Takas Var. Sıfır Nakit Güvenli Takas Platformu</span>
      </div>

      {/* Header / Navbar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900">
              Jet<span className="text-emerald-600">Swap</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-emerald-700 bg-zinc-100 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm İlanlara Dön</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {item.status !== 'AVAILABLE' && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
            <div>
              <strong className="font-bold">Bu ilan şu anda genel takasa açık değildir.</strong>
              <p className="mt-0.5 text-amber-800">
                Durum: {item.status === 'ARCHIVED' ? 'Arşivlendi / Pasif' : item.status === 'TRADED' ? 'Takas Başarıyla Tamamlandı' : 'Takas Aşamasında'}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Images & What I Want */}
          <div className="lg:col-span-7 space-y-6">
            {/* Main Image Gallery */}
            <div className="bg-white rounded-3xl p-4 border border-zinc-200 shadow-sm">
              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-100">
                <Image
                  src={images[0]}
                  alt={item.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2.5 mt-3">
                  {images.slice(1).map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200">
                      <Image src={img} alt={`${item.title} - ${idx + 2}`} fill className="object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* WHAT OWNER WANTS (Ne Arıyor?) - PRD Madde 10 & Sprint 3 Structured Wants */}
            <div className="bg-emerald-50/80 border-2 border-emerald-300/80 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-950">
                    İlan Sahibi Bu Eşyaya Karşılık Ne İstiyor?
                  </h3>
                  <p className="text-xs text-emerald-800 font-medium">
                    Sıfır Nakit Kuralı: Para teklif edilmez, karşılık olarak eşya takaslanır.
                  </p>
                </div>
              </div>

              {/* Structured Wants List */}
              {item.wants && item.wants.length > 0 ? (
                <div className="space-y-2.5">
                  {item.wants.map((want, idx) => (
                    <div
                      key={want.id}
                      className="bg-white/95 rounded-2xl p-4 border border-emerald-200 shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-extrabold">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-black text-emerald-950">
                            {idx === 0 ? '1. Tercih (Öncelikli): ' : `${idx + 1}. Tercih: `}
                            <span className="text-emerald-700">{want.category?.nameTr || want.categoryId || 'Genel Kategori'}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {want.minimumCondition && (
                            <span className="text-[10px] font-bold bg-zinc-100 text-zinc-700 px-2.5 py-0.5 rounded-md">
                              En az: {CONDITION_LABELS[want.minimumCondition] || want.minimumCondition}
                            </span>
                          )}
                          {want.isFlexible && (
                            <span className="text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 px-2.5 py-0.5 rounded-md">
                              Benzer ürünlere açık
                            </span>
                          )}
                        </div>
                      </div>

                      {(want.brand || want.model) && (
                        <div className="text-xs font-bold text-zinc-800 flex items-center gap-1.5 pl-7">
                          <span>🎯</span>
                          <span>{[want.brand, want.model].filter(Boolean).join(' ')}</span>
                        </div>
                      )}

                      {want.note && (
                        <div className="text-[11px] text-zinc-600 bg-zinc-50 rounded-xl px-3 py-1.5 border border-zinc-100 pl-7 leading-relaxed">
                          {want.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {item.targetCategories && item.targetCategories.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.targetCategories.map((catSlug, idx) => (
                        <span
                          key={idx}
                          className="text-xs font-bold bg-white text-emerald-900 border border-emerald-300 px-3 py-1 rounded-xl shadow-xs"
                        >
                          🎯 {catSlug}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-white/90 rounded-2xl p-4 border border-emerald-200 text-xs text-emerald-950 leading-relaxed font-medium">
                    {item.targetDescription || 'Her türlü mantıklı takas teklifine açığım.'}
                  </div>
                </>
              )}

              {item.wants && item.wants.length > 0 && item.targetDescription && (
                <div className="text-xs text-emerald-900/80 bg-emerald-100/40 rounded-xl p-2.5 font-medium">
                  <strong>Genel Not:</strong> {item.targetDescription}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-3">
              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                İlan Açıklaması
              </h3>
              <p className="text-xs text-zinc-700 leading-relaxed whitespace-pre-line">
                {item.description}
              </p>
            </div>
          </div>

          {/* Right Column: Title, Details & Owner Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-5">
              {/* Category & Condition Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-extrabold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-xl flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  {item.category.nameTr}
                </span>

                <span className="text-xs font-extrabold bg-zinc-100 text-zinc-800 px-3 py-1 rounded-xl">
                  {CONDITION_LABELS[item.condition] || item.condition}
                </span>
              </div>

              <h1 className="text-xl font-black text-zinc-900 tracking-tight leading-snug">
                {item.title}
              </h1>

              {/* Meta: Location, Views, Date */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-zinc-100 text-xs text-zinc-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{item.city}, {item.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{TRADE_METHOD_LABELS[item.tradeMethod] || item.tradeMethod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{item.viewCount} görüntülenme</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-400 shrink-0" />
                  <span>{new Date(item.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-zinc-100">
                <Link
                  href={`/?tradeWith=${item.id}`}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-xs py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Takas Teklifi Gönder</span>
                </Link>
                <p className="text-[11px] text-zinc-500 text-center mt-2">
                  Para teklifi kabul edilmez. Kendi portföyünüzden eşya seçerek teklif yapabilirsiniz.
                </p>
              </div>
            </div>

            {/* Owner Trust Card (PRD Madde 22 & 27) */}
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-600">
                İlan Sahibi Profili
              </h4>

              <div className="flex items-center gap-4">
                <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-emerald-600 shrink-0">
                  <Image
                    src={item.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt={item.user.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm text-zinc-900">{item.user.name}</h5>
                  <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-zinc-400" />
                    {item.user.city}, {item.user.country}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.user.rating.toFixed(1)}</span>
                    <span className="text-zinc-400 font-normal">({item.user.reviewCount} değerlendirme)</span>
                  </div>
                </div>
              </div>

              {/* Contact Privacy Gate Notice */}
              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200/80 text-[11px] text-zinc-600 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Gizlilik İlkesi:</strong> Telefon ve iletişim bilgileri yalnızca iki taraf da takas teklifini onayladığında açılır.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
