'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightLeft, Package, MapPin, Tag } from 'lucide-react'
import { OfferItemSummary } from '@/lib/offers/types'

interface OfferExchangeViewProps {
  offeredItems: OfferItemSummary[]
  requestedItems: OfferItemSummary[]
  viewerRole: 'SENDER' | 'RECEIVER' | 'OBSERVER'
}

const conditionLabels: Record<string, string> = {
  NEW: 'Sıfır',
  LIKE_NEW: 'Yeni Gibi',
  GOOD: 'İyi',
  FAIR: 'Makul',
  POOR: 'Yıpranmış',
}

function ItemCardSummary({ item }: { item: OfferItemSummary }) {
  const imageSrc = item.images && item.images.length > 0 ? item.images[0] : null

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors shadow-2xs">
      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex-shrink-0 border border-zinc-200 dark:border-zinc-700/50">
        {imageSrc ? (
          <Image src={imageSrc} alt={item.title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
            <Package className="w-6 h-6" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <Link
          href={`/items/${item.id}`}
          className="font-semibold text-zinc-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors line-clamp-1 text-sm"
        >
          {item.title}
        </Link>

        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {item.category && (
            <span className="inline-flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-500" />
              {item.category.nameTr}
            </span>
          )}

          <span className="text-zinc-300 dark:text-zinc-600">•</span>
          <span>{conditionLabels[item.condition] || item.condition}</span>

          {item.city && (
            <>
              <span className="text-zinc-300 dark:text-zinc-600">•</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-500" />
                {item.city}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export const OfferExchangeView: React.FC<OfferExchangeViewProps> = ({
  offeredItems,
  requestedItems,
  viewerRole,
}) => {
  // Label perspective:
  // Sender gives: offeredItems, receives: requestedItems
  // Receiver gives: requestedItems, receives: offeredItems
  const leftTitle = viewerRole === 'RECEIVER' ? 'Senin Vereceğin Ürün(ler)' : 'Senin Teklif Ettiğin Ürün(ler)'
  const leftSubtitle =
    viewerRole === 'RECEIVER'
      ? 'Kabul ederseniz karşı tarafa geçecek eşyalarınız'
      : 'Bu takas için teklif ettiğiniz eşyalarınız'
  const leftItems = viewerRole === 'RECEIVER' ? requestedItems : offeredItems

  const rightTitle = viewerRole === 'RECEIVER' ? 'Karşı Tarafın Teklif Ettiği' : 'Karşı Taraftan İstediğin'
  const rightSubtitle =
    viewerRole === 'RECEIVER'
      ? 'Takas karşılığında alacağınız eşyalar'
      : 'Karşı taraftan talep ettiğiniz eşyalar'
  const rightItems = viewerRole === 'RECEIVER' ? offeredItems : requestedItems

  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 rounded-2xl bg-zinc-50/80 dark:bg-zinc-950/70 border border-zinc-200 dark:border-zinc-800">
      {/* Visual Exchange Badge in the Center for desktop */}
      <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-emerald-500/30 items-center justify-center text-emerald-600 dark:text-emerald-400 z-10 shadow-md">
        <ArrowRightLeft className="w-5 h-5" />
      </div>

      {/* Left Column */}
      <div className="space-y-3">
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {leftTitle}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{leftSubtitle}</p>
        </div>

        <div className="space-y-2">
          {leftItems.map((item) => (
            <ItemCardSummary key={item.id} item={item} />
          ))}
          {leftItems.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic py-2">Eşya bilgisi bulunamadı.</p>
          )}
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-3">
        <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-2">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            {rightTitle}
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{rightSubtitle}</p>
        </div>

        <div className="space-y-2">
          {rightItems.map((item) => (
            <ItemCardSummary key={item.id} item={item} />
          ))}
          {rightItems.length === 0 && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 italic py-2">Eşya bilgisi bulunamadı.</p>
          )}
        </div>
      </div>
    </div>
  )
}
