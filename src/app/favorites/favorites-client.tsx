'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ArrowLeftRight, Trash2, MapPin, Tag, ExternalLink } from 'lucide-react'
import { PublicFavoriteItem } from '@/lib/favorites'
import { useLanguage } from '@/i18n'
import { getItemConditionLabel } from '@/i18n/helpers'

interface FavoritesClientProps {
  initialFavorites: PublicFavoriteItem[]
  userName: string
}

export function FavoritesClient({ initialFavorites, userName }: FavoritesClientProps) {
  const { t, language } = useLanguage()
  const [favorites, setFavorites] = useState<PublicFavoriteItem[]>(initialFavorites)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleRemoveFavorite = async (itemId: string) => {
    if (deletingId) return
    setDeletingId(itemId)

    try {
      const res = await fetch(`/api/favorites/${itemId}`, { method: 'DELETE' })
      if (res.ok) {
        setFavorites(prev => prev.filter(f => f.itemId !== itemId))
      }
    } catch (err) {
      console.error('Failed to remove favorite:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">{t.favorites.title}</h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            {t.favorites.subtitle} ({favorites.length})
          </p>
        </div>

        <Link
          href="/#kesfet"
          className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
        >
          <span>{t.favorites.browseListingsButton}</span>
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 border border-zinc-200 dark:border-zinc-800 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 stroke-1" />
          </div>
          <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 mb-1">
            {t.favorites.emptyTitle}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
            {t.favorites.emptySubtitle}
          </p>
          <Link
            href="/#kesfet"
            className="inline-flex items-center justify-center gap-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>{t.favorites.browseListingsButton}</span>
          </Link>
        </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(fav => {
              const item = fav.item
              const isDeleting = deletingId === item.id
              const imageUrl = item.images && item.images.length > 0 ? item.images[0] : '/placeholder.png'

              return (
                <div
                  key={fav.id}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative"
                >
                  {/* Image & Badges */}
                  <div className="relative w-full h-48 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Condition badge */}
                    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg bg-black/75 text-white shadow-xs">
                        {getItemConditionLabel(item.condition, language)}
                      </span>
                      {item.status !== 'AVAILABLE' && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500 text-white shadow-xs">
                          {item.status === 'TRADED' ? t.statuses.COMPLETED : t.statuses.PENDING}
                        </span>
                      )}
                    </div>

                    {/* Quick remove button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(item.id)}
                      disabled={isDeleting}
                      aria-label={t.favorites.removeTooltip}
                      title={t.favorites.removeTooltip}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Location badge */}
                    <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-black/70 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-xs">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      <span>{item.city}, {item.country}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-bold mb-1">
                        <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>{language === 'en' && item.category?.nameEn ? item.category.nameEn : (item.category?.nameTr || 'Genel')}</span>
                      </div>
                      <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1">
                        {item.description}
                      </p>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium truncate">
                        {language === 'tr' ? 'Sahibi:' : 'Owner:'} <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.user?.name}</span>
                      </div>

                      <Link
                        href={`/items/${item.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:underline shrink-0"
                      >
                        <span>{t.favorites.viewListing}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
    </div>
  )
}
