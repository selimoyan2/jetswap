'use client'

import React from 'react'
import Image from 'next/image'
import { Tag, CheckCircle2 } from 'lucide-react'

export interface SelectableSourceItem {
  id: string
  title: string
  images?: string[]
  category?: {
    nameTr?: string
    nameEn?: string
  } | null
  status?: string
  city?: string
  country?: string
}

interface SourceItemSelectorProps {
  items: SelectableSourceItem[]
  selectedItemId: string | null
  onSelectItem: (id: string) => void
}

export const SourceItemSelector: React.FC<SourceItemSelectorProps> = ({
  items,
  selectedItemId,
  onSelectItem,
}) => {
  if (items.length === 0) return null

  return (
    <section className="space-y-3" aria-labelledby="source-selector-title">
      <div className="flex items-center justify-between">
        <h2 id="source-selector-title" className="text-xs font-black uppercase tracking-wider text-zinc-500">
          Takasa Açık Eşyaların ({items.length})
        </h2>
        <span className="text-[11px] text-zinc-400 font-medium">
          Eşleşmelerini görmek istediğin eşyanı seç
        </span>
      </div>

      {/* Horizontal scroll container on mobile, flex-wrap/grid on larger screens */}
      <div
        role="radiogroup"
        aria-label="Takas eşyası seçimi"
        className="flex gap-3 overflow-x-auto pb-2 pt-1 px-1 -mx-1 scrollbar-thin scrollbar-thumb-zinc-300 sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:overflow-visible"
      >
        {items.map(item => {
          const isSelected = item.id === selectedItemId
          const imageSrc =
            item.images && item.images.length > 0 && item.images[0]
              ? item.images[0]
              : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'

          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectItem(item.id)}
              className={`min-w-[260px] sm:min-w-0 text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center gap-3 relative shrink-0 ${
                isSelected
                  ? 'bg-emerald-50/80 border-emerald-500 shadow-sm ring-2 ring-emerald-500/30'
                  : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/60 shadow-2xs'
              }`}
            >
              {/* Image thumbnail */}
              <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200">
                <Image
                  src={imageSrc}
                  alt={item.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>

              {/* Title & Metadata */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1">
                  {item.category?.nameTr && (
                    <span className="text-[10px] font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md flex items-center gap-1 truncate max-w-[120px]">
                      <Tag className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{item.category.nameTr}</span>
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.5 rounded-md shrink-0">
                    Takasa Açık
                  </span>
                </div>
                <h3 className="font-black text-xs text-zinc-900 truncate leading-snug">
                  {item.title}
                </h3>
              </div>

              {/* Selection Checkmark Indicator */}
              {isSelected && (
                <div className="shrink-0 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5 fill-emerald-100 text-emerald-600" />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}
