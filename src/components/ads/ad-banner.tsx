'use client'

import React, { useEffect } from 'react'

interface AdBannerProps {
  slotId?: string
  format?: 'leaderboard' | 'in-feed' | 'rectangle' | 'fluid'
  className?: string
  showPlaceholderInDev?: boolean
}

export const AdBanner: React.FC<AdBannerProps> = ({
  slotId = '1234567890',
  format = 'leaderboard',
  className = '',
  showPlaceholderInDev = true
}) => {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    // If Google AdSense script is present, trigger adsbygoogle push
    try {
      if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
        ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
      }
    } catch (err) {
      console.log('AdSense init notice:', err)
    }
  }, [])

  // If real AdSense is configured
  if (adClient) {
    return (
      <div className={`w-full overflow-hidden text-center my-4 ${className}`}>
        <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
          Sponsorlu Reklam
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adClient}
          data-ad-slot={slotId}
          data-ad-format={format === 'in-feed' ? 'fluid' : 'auto'}
          data-full-width-responsive="true"
        />
      </div>
    )
  }

  // Elegant non-intrusive preview placeholder for development & design review
  if (format === 'in-feed') {
    return (
      <div className={`bg-gradient-to-br from-zinc-50 to-zinc-100 rounded-3xl border border-dashed border-zinc-300 p-5 flex flex-col justify-between text-center relative overflow-hidden group hover:border-emerald-400 transition-all ${className}`}>
        <div className="absolute top-3 right-3 text-[9px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-200/80 px-2 py-0.5 rounded">
          Sponsorlu İçerik
        </div>
        <div className="my-auto py-8">
          <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-full">
            Google Ads Native In-Feed
          </span>
          <h4 className="text-sm font-bold text-zinc-800 mt-2">
            İlanlar Arası Doğal Reklam Alanı
          </h4>
          <p className="text-xs text-zinc-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Ziyaretçinin takas deneyimini bölmeyen, organik ilan kartı boyutlarında Google Ads alanı.
          </p>
        </div>
        <div className="text-[10px] text-zinc-400 border-t border-zinc-200/80 pt-2">
          AdSense Slot: in_feed_swap_grid • 336x280 / Responsive
        </div>
      </div>
    )
  }

  // Leaderboard (Top or Bottom Banner)
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6 ${className}`}>
      <div className="bg-gradient-to-r from-zinc-50 via-zinc-100/60 to-zinc-50 border border-dashed border-zinc-300/80 rounded-2xl p-4 sm:p-5 text-center relative overflow-hidden">
        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-wider mb-2">
          <span>Google AdSense • Leaderboard</span>
          <span>Reklam / Sponsor</span>
        </div>
        <div className="py-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
            ADS
          </div>
          <div className="text-left">
            <span className="text-xs font-bold text-zinc-800 block">
              Ziyaretçiyi Rahatsız Etmeyen Yatay Reklam Alanı (728x90 / Responsive)
            </span>
            <span className="text-[11px] text-zinc-500 block">
              Yüksek kaliteli hedef kitleye özel otomatik Google Display reklamları burada gösterilir.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
