'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowLeftRight, CheckCircle2, MapPin, Zap, ShieldCheck, RefreshCw, Layers, ArrowRight, UserCheck } from 'lucide-react'
import { TradeItem, User } from '@/types'
import { useLanguage } from '@/i18n'

interface SmartMatchAlertProps {
  currentUser?: User | null
  onSelectTrade?: (targetItem: TradeItem, myItem: TradeItem) => void
  onSelectChain?: () => void
}

export const SmartMatchAlert: React.FC<SmartMatchAlertProps> = ({ currentUser, onSelectTrade, onSelectChain }) => {
  const { t, language } = useLanguage()
  const [matchMode, setMatchMode] = useState<'bilateral' | 'chain'>('bilateral')
  const [matchData, setMatchData] = useState<{
    myItem: TradeItem
    targetItem: TradeItem
    score: number
  } | null>(null)

  useEffect(() => {
    if (!currentUser) {
      setMatchData(null)
      return
    }

    let isMounted = true
    fetch('/api/jetmatch?limit=1')
      .then(res => res.json())
      .then(res => {
        if (!isMounted) return
        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const match = res.data[0]
          if (match.sourceItem && match.candidateItem) {
            setMatchData({
              myItem: match.sourceItem,
              targetItem: match.candidateItem,
              score: match.score || 0
            })
          } else {
            setMatchData(null)
          }
        } else {
          setMatchData(null)
        }
      })
      .catch(() => {
        if (isMounted) setMatchData(null)
      })

    return () => { isMounted = false }
  }, [currentUser])

  // If no logged in user or no real active match found, clean-hide
  if (!currentUser || !matchData) {
    return null
  }

  const { myItem, targetItem, score } = matchData

  return (
    <section id="eslesmeler" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-teal-950 border-2 border-emerald-500/40 p-6 sm:p-8 shadow-2xl">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header & Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center animate-pulse shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-400/15 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  {matchMode === 'bilateral' ? t.smartMatch.bilateralBadge : t.smartMatch.chainBadge}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {matchMode === 'bilateral'
                  ? t.smartMatch.bilateralTitle
                  : t.smartMatch.chainTitle}
              </h3>
            </div>
          </div>

          {/* Engine Version & Match Mode Toggle */}
          <div className="flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-700/80">
            <button
              type="button"
              onClick={() => setMatchMode('bilateral')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                matchMode === 'bilateral'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>{t.smartMatch.bilateralTab}</span>
            </button>
            <button
              type="button"
              onClick={() => setMatchMode('chain')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                matchMode === 'chain'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" />
              <span>{t.smartMatch.chainTab}</span>
            </button>
          </div>
        </div>

        {/* MODE 1: BILATERAL 2-WAY MATCH */}
        {matchMode === 'bilateral' ? (
          <>
            {/* Swap Visualization Card: HAVE ↔ WANT */}
            <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center bg-zinc-900/95 border border-zinc-800 rounded-3xl p-5 sm:p-7">
              {/* Side A: Your Item (HAVE) */}
              <div className="md:col-span-5 flex items-center gap-4 bg-zinc-800/70 p-4 rounded-2xl border border-zinc-700/60">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-zinc-700">
                  <Image
                    src={myItem.images[0]}
                    alt={myItem.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-emerald-700 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    {t.smartMatch.haveYou}
                  </span>
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                    {t.smartMatch.fromPortfolio}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-white truncate mt-1">{myItem.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                    <strong>{t.smartMatch.wantYou}:</strong> {myItem.targetDescription}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-2">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{myItem.city}, {myItem.country}</span>
                  </div>
                </div>
              </div>

              {/* Swap Arrow Center */}
              <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <span className="text-[9px] font-black text-emerald-400 mt-1 uppercase">{t.smartMatch.swap}</span>
              </div>

              {/* Side B: Target Item (MATCH) */}
              <div className="md:col-span-5 flex items-center gap-4 bg-zinc-800/70 p-4 rounded-2xl border border-zinc-700/60">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-zinc-700">
                  <Image
                    src={targetItem.images[0]}
                    alt={targetItem.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                  <span className="absolute top-1 left-1 bg-amber-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                    {t.smartMatch.matchPercent}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400">{targetItem.user.name}</span>
                    <span className="text-[10px] bg-zinc-700 text-zinc-200 px-1.5 py-0.2 rounded font-bold">
                      JetTrust {targetItem.user.jetTrust}/100
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white truncate mt-1">{targetItem.title}</h4>
                  <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                    <strong>{t.smartMatch.wantTarget}:</strong> {targetItem.targetDescription}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-2">
                    <MapPin className="w-3 h-3 text-zinc-500" />
                    <span>{targetItem.city}, {targetItem.country}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Match reason and Action */}
            <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {t.smartMatch.jetMatchAnalysis}
                </span>
              </div>

              <button
                onClick={() => onSelectTrade?.(targetItem, myItem)}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-extrabold px-6 py-3 rounded-2xl shadow-xl shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>{t.smartMatch.startOffer}</span>
              </button>
            </div>
          </>
        ) : (
          /* MODE 2: 3-WAY SWAP CHAIN (Clean placeholder when no closed loop exists) */
          <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-8 text-center">
            <RefreshCw className="w-8 h-8 text-amber-400 mx-auto mb-3 animate-spin-slow" />
            <h4 className="text-base font-bold text-white">
              {language === 'en' ? 'No 3-Way Swap Loop Found' : "Aktif 3'lü Takas Döngüsü Bulunmuyor"}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-md mx-auto">
              {language === 'en'
                ? 'When a multi-party circular trade is discovered matching your portfolio wants, it will appear here.'
                : 'Portföyünüzdeki eşyalar ve isteklerinizle uyumlu döngüsel bir takas zinciri oluştuğunda burada listelenecektir.'}
            </p>
          </div>
        )}
      </div>
    </section>
  )
}


