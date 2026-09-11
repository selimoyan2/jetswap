'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Sparkles, ArrowLeftRight, CheckCircle2, MapPin, Zap, ShieldCheck, RefreshCw, Layers, ArrowRight, UserCheck } from 'lucide-react'
import { TradeItem } from '@/types'
import { mockMyPortfolio, mockItems, mockSwapChains } from '@/data/mockData'
import { useLanguage } from '@/i18n'

interface SmartMatchAlertProps {
  onSelectTrade?: (targetItem: TradeItem, myItem: TradeItem) => void
  onSelectChain?: () => void
}

export const SmartMatchAlert: React.FC<SmartMatchAlertProps> = ({ onSelectTrade, onSelectChain }) => {
  const { t, language } = useLanguage()
  const [matchMode, setMatchMode] = useState<'bilateral' | 'chain'>('bilateral')
  const [isChainConfirmed, setIsChainConfirmed] = useState(false)

  const myItem = mockMyPortfolio[0] // Sony WH-1000XM4
  const targetItem = mockItems[0]    // Fender Stratocaster
  const chain = mockSwapChains[0]

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
          /* MODE 2: 3-WAY SWAP CHAIN (A -> B -> C -> A) */
          <div>
            <div className="bg-zinc-900/90 border border-amber-500/30 rounded-3xl p-5 sm:p-7">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-black text-amber-400 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-400" />
                  {t.smartMatch.chainClosedLoop}
                </span>
                <span className="text-[11px] font-bold text-zinc-400">
                  {t.smartMatch.chainTagline}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Node 1: Sen (Selim) */}
                <div className="bg-zinc-800/80 border border-emerald-500/50 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-zinc-900 font-black text-xs flex items-center justify-center">1</span>
                        <span className="text-xs font-black text-white">{t.smartMatch.you}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">{t.smartMatch.initiator}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-zinc-900/80 p-2 rounded-xl">
                        <span className="text-[9px] font-bold text-rose-400 block uppercase">{t.smartMatch.itemGiven}</span>
                        <span className="font-bold text-white line-clamp-1">{chain.nodes[0].givesItem.title}</span>
                      </div>
                      <div className="flex justify-center text-emerald-400 py-0.5">
                        <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                      </div>
                      <div className="bg-zinc-900/80 p-2 rounded-xl border border-emerald-500/40">
                        <span className="text-[9px] font-bold text-emerald-400 block uppercase">{t.smartMatch.itemReceived}</span>
                        <span className="font-bold text-white line-clamp-1">{chain.nodes[0].receivesItem.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-700/60 text-[10px] text-zinc-400">
                    {t.smartMatch.chainDelivery1}
                  </div>
                </div>

                {/* Node 2: Elif Kaya */}
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-amber-500 text-zinc-900 font-black text-xs flex items-center justify-center">2</span>
                        <span className="text-xs font-black text-white">{chain.nodes[1].user.name}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">JT {chain.nodes[1].user.jetTrust}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-zinc-900/80 p-2 rounded-xl">
                        <span className="text-[9px] font-bold text-rose-400 block uppercase">{t.smartMatch.giverItem}</span>
                        <span className="font-bold text-white line-clamp-1">{chain.nodes[1].givesItem.title}</span>
                      </div>
                      <div className="flex justify-center text-amber-400 py-0.5">
                        <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                      </div>
                      <div className="bg-zinc-900/80 p-2 rounded-xl border border-amber-500/40">
                        <span className="text-[9px] font-bold text-amber-400 block uppercase">{t.smartMatch.receiverItem}</span>
                        <span className="font-bold text-white line-clamp-1">{chain.nodes[1].receivesItem.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-700/60 text-[10px] text-zinc-400">
                    {t.smartMatch.chainDelivery2}
                  </div>
                </div>

                {/* Node 3: Bora Aktaş */}
                <div className="bg-zinc-800/80 border border-zinc-700 rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-700">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-500 text-zinc-900 font-black text-xs flex items-center justify-center">3</span>
                        <span className="text-xs font-black text-white">{chain.nodes[2].user.name}</span>
                      </div>
                      <span className="text-[10px] font-bold bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded">JT {chain.nodes[2].user.jetTrust}</span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="bg-zinc-900/80 p-2 rounded-xl">
                        <span className="text-[9px] font-bold text-rose-400 block uppercase">{t.smartMatch.giverItem}</span>
                        <span className="font-bold text-white line-clamp-1">{chain.nodes[2].givesItem.title}</span>
                      </div>
                      <div className="flex justify-center text-teal-400 py-0.5">
                        <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0" />
                      </div>
                      <div className="bg-zinc-900/80 p-2 rounded-xl border border-teal-500/40">
                        <span className="text-[9px] font-bold text-teal-400 block uppercase">{t.smartMatch.receiverItem}</span>
                        <span className="font-bold text-white line-clamp-1">{chain.nodes[2].receivesItem.title}</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-zinc-700/60 text-[10px] text-zinc-400">
                    {t.smartMatch.chainDelivery3}
                  </div>
                </div>
              </div>

              {/* Chain Action Bar */}
              <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-zinc-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    {t.smartMatch.chainNotice}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsChainConfirmed(!isChainConfirmed)}
                  className={`px-6 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
                    isChainConfirmed
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30'
                  }`}
                >
                  {isChainConfirmed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t.smartMatch.chainConfirmed}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{t.smartMatch.chainConfirmBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

