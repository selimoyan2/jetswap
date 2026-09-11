'use client'

import React, { useState, useEffect } from 'react'
import { TradeItem } from '@/types'
import { useLanguage } from '@/i18n'
import { Zap, Clock, ArrowRight, MapPin, Sparkles } from 'lucide-react'

interface FlashTradeShowcaseProps {
  items: TradeItem[]
  onSelectItem: (item: TradeItem) => void
  onViewAllFlash?: () => void
  className?: string
}

export default function FlashTradeShowcase({
  items,
  onSelectItem,
  onViewAllFlash,
  className = ''
}: FlashTradeShowcaseProps) {
  const { t } = useLanguage()
  const [timeLefts, setTimeLefts] = useState<Record<string, { hours: number; mins: number; secs: number }>>({})

  const flashItems = items.filter(i => i.isFlashTrade)

  // Countdown timer hook
  useEffect(() => {
    const updateCountdown = () => {
      const newTimeLefts: Record<string, { hours: number; mins: number; secs: number }> = {}
      const now = new Date().getTime()

      flashItems.forEach(item => {
        const expiresAt = item.flashExpiresAt ? new Date(item.flashExpiresAt).getTime() : now + 18 * 3600 * 1000
        const diff = Math.max(0, expiresAt - now)

        const hours = Math.floor(diff / (1000 * 60 * 60))
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const secs = Math.floor((diff % (1000 * 60)) / 1000)

        newTimeLefts[item.id] = { hours, mins, secs }
      })

      setTimeLefts(newTimeLefts)
    }

    updateCountdown()
    const timer = setInterval(updateCountdown, 1000)
    return () => clearInterval(timer)
  }, [flashItems.length])

  if (flashItems.length === 0) return null

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-orange-950/30 border border-amber-500/30 p-5 sm:p-7 shadow-2xl shadow-amber-500/5 ${className}`}>
      {/* Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold tracking-wider uppercase">
            <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-bounce" />
            {t.flashTrade.badge}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            {t.flashTrade.title}
          </h3>
          <p className="text-xs text-neutral-400 max-w-xl">{t.flashTrade.subtitle}</p>
        </div>

        {onViewAllFlash && (
          <button
            onClick={onViewAllFlash}
            className="self-start sm:self-auto text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer"
          >
            {t.flashTrade.viewUrgentItems}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Items Cards */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashItems.slice(0, 3).map((item) => {
          const tRem = timeLefts[item.id] || { hours: 23, mins: 59, secs: 59 }

          return (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group cursor-pointer rounded-2xl bg-neutral-900/90 border border-white/10 hover:border-amber-500/50 transition-all duration-300 p-3.5 flex flex-col justify-between hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden"
            >
              {/* Card Badge */}
              <div className="absolute top-5 left-5 z-10">
                <span className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md text-amber-400 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1 shadow-lg">
                  <Clock className="w-3 h-3 animate-spin" style={{ animationDuration: '4s' }} />
                  {pad(tRem.hours)}:{pad(tRem.mins)}:{pad(tRem.secs)}
                </span>
              </div>

              {/* Image */}
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-3 bg-neutral-950">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white font-medium">
                  <span className="flex items-center gap-1 text-neutral-300">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {item.city}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-semibold">
                    {item.user.name}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                  {item.title}
                </h4>

                <div className="p-2 rounded-xl bg-black/40 border border-white/5 space-y-1">
                  <span className="text-[10px] text-neutral-400 block font-medium">
                    Takas İsteği:
                  </span>
                  <p className="text-[11px] text-neutral-200 line-clamp-1 font-medium">
                    {item.targetDescription || item.targetCategories.join(' • ')}
                  </p>
                </div>
              </div>

              {/* Footer Button */}
              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Hemen Elden Takasla
                </span>
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
