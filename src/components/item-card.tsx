'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { MapPin, ArrowLeftRight, Shield, Star, Sparkles, Heart, Flag, CheckCircle2, ShieldCheck } from 'lucide-react'
import { TradeItem } from '@/types'
import { useLanguage, getConditionLabel, getTradeMethodLabel } from '@/i18n'

interface ItemCardProps {
  item: TradeItem
  onMakeOffer: (item: TradeItem) => void
  onReport: (item: TradeItem) => void
  initialIsFavorite?: boolean
  onToggleFavorite?: (itemId: string, isFav: boolean) => void
  onRequireAuth?: () => void
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onMakeOffer,
  onReport,
  initialIsFavorite = false,
  onToggleFavorite,
  onRequireAuth,
}) => {
  const { language, t } = useLanguage()
  const [isFav, setIsFav] = useState(initialIsFavorite)
  const [isLoading, setIsLoading] = useState(false)
  const [likes, setLikes] = useState(item.likesCount || 0)

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLoading) return
    const nextFavState = !isFav
    setIsFav(nextFavState)
    setLikes(prev => (nextFavState ? prev + 1 : Math.max(0, prev - 1)))
    setIsLoading(true)

    try {
      if (onToggleFavorite) {
        onToggleFavorite(item.id, nextFavState)
        setIsLoading(false)
        return
      }

      const method = nextFavState ? 'POST' : 'DELETE'
      const res = await fetch(`/api/favorites/${item.id}`, { method })

      if (res.status === 401) {
        // Rollback
        setIsFav(!nextFavState)
        setLikes(prev => (!nextFavState ? prev + 1 : Math.max(0, prev - 1)))
        if (onRequireAuth) {
          onRequireAuth()
        } else {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
        }
        return
      }

      if (!res.ok) {
        // Rollback on server error
        setIsFav(!nextFavState)
        setLikes(prev => (!nextFavState ? prev + 1 : Math.max(0, prev - 1)))
      }
    } catch {
      // Rollback on network error
      setIsFav(!nextFavState)
      setLikes(prev => (!nextFavState ? prev + 1 : Math.max(0, prev - 1)))
    } finally {
      setIsLoading(false)
    }
  }

  const conditionColors: Record<string, string> = {
    BRAND_NEW: 'bg-emerald-600 text-white',
    LIKE_NEW: 'bg-blue-600 text-white',
    VERY_GOOD: 'bg-teal-600 text-white',
    GOOD: 'bg-amber-600 text-white',
    FAIR: 'bg-zinc-600 text-white',
    REPAIR_NEEDED: 'bg-red-600 text-white',
  }

  const conditionText = getConditionLabel(item.condition, language)
  const deliveryText = getTradeMethodLabel(item.tradeMethod, language)
  const badgeColor = conditionColors[item.condition] || 'bg-zinc-600 text-white'

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col group relative">
      {/* Image & Overlay Badges */}
      <div className="relative w-full h-56 bg-zinc-100 overflow-hidden">
        <Image
          src={item.images[0]}
          alt={item.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-lg shadow-xs ${badgeColor}`}>
              {conditionText}
            </span>
            {item.matchScore && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-amber-500 text-white flex items-center gap-1 shadow-xs">
                <Sparkles className="w-2.5 h-2.5" />
                %{item.matchScore} JetMatch
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-black/75 text-zinc-100 backdrop-blur-xs w-fit">
            {deliveryText}
          </span>
        </div>

        {/* Top Right Action Buttons (Favorite & Report) */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            type="button"
            onClick={toggleFavorite}
            disabled={isLoading}
            aria-label={isFav ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            aria-pressed={isFav}
            className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all cursor-pointer ${
              isFav ? 'bg-red-500 text-white' : 'bg-black/40 text-white hover:bg-black/60'
            } ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
            title={isFav ? (t.itemCard?.liked || 'Favorilerden Çıkar') : (t.itemCard?.like || 'Favorilere Ekle')}
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
          </button>
          <button
            onClick={e => {
              e.stopPropagation()
              onReport(item)
            }}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur-md transition-all"
            title={t.itemCard.reportItem}
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 bg-black/70 text-white text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-xs">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span>{item.city}, {item.country}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* User Row: Avatar, Name, Verified Swapper Badge & JetTrust Score */}
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2.5 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <div className="relative w-7 h-7 rounded-full overflow-hidden border border-zinc-200 shrink-0">
                <Image src={item.user.avatar} alt={item.user.name} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-zinc-800 truncate">{item.user.name}</span>
                  {item.user.verifiedSwapper && (
                    <span title={t.trustCenter.verifiedBadge}>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-zinc-400 block">
                  {item.user.completedSwaps} {language === 'en' ? 'completed swaps' : 'başarılı takas'}
                </span>
              </div>
            </div>

            {/* JetTrust Score Badge */}
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg" title={t.trustCenter.title}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span className="text-[11px] font-black text-emerald-900">{item.user.jetTrust}/100</span>
            </div>
          </div>

          {/* Brand, Location (Semt/Şehir) & Time Tag */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            {item.brand && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                {item.brand} {item.modelName ? `• ${item.modelName}` : ''}
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-zinc-600 bg-emerald-50/70 border border-emerald-100 px-2 py-0.5 rounded">
              <MapPin className="w-2.5 h-2.5 text-rose-500" />
              <span>{item.district ? `${item.district}, ` : ''}{item.city}</span>
            </span>
            <span className="text-[10px] font-medium text-zinc-400 ml-auto">
              {item.createdAt}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-extrabold text-base text-zinc-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
            {item.title}
          </h3>

          <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* PRD Madde 8: "Ne İstiyorsun?" & "Tekliflere Açığım" */}
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200/80">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-900 uppercase tracking-wide">
                <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t.itemCard.wantedItem} (WANT)</span>
              </div>
              {item.openToOffers && (
                <span className="text-[9px] font-extrabold uppercase bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">
                  {language === 'en' ? 'Open to Offers' : 'Tekliflere Açık'}
                </span>
              )}
            </div>
            <p className="text-xs font-semibold text-emerald-950 line-clamp-2">
              {item.targetDescription}
            </p>
          </div>
        </div>

        {/* Card Footer */}
        <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'en' ? 'Protected Barter' : 'Korumalı Takas'}</span>
          </div>

          <button
            onClick={() => onMakeOffer(item)}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t.itemCard.makeOffer}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
