'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeftRight, Inbox, Send, RefreshCw, AlertCircle, Package } from 'lucide-react'
import { SerializedTradeOffer, OfferListType } from '@/lib/offers/types'
import { OfferCard } from '@/components/offers/offer-card'
import { useLanguage } from '@/i18n'

export function OffersListClient() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()

  const typeFromQuery = (searchParams.get('type') as OfferListType) || 'received'
  const [activeTab, setActiveTab] = useState<OfferListType>(
    ['received', 'sent'].includes(typeFromQuery) ? typeFromQuery : 'received'
  )

  const [offers, setOffers] = useState<SerializedTradeOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOffers = useCallback(async (type: OfferListType) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/offers?type=${type}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error?.message || t.common.error)
        setOffers([])
      } else {
        setOffers(data.data || [])
      }
    } catch (err: unknown) {
      console.error('Fetch offers error:', err)
      setError(t.common.error)
      setOffers([])
    } finally {
      setLoading(false)
    }
  }, [t.common.error])

  useEffect(() => {
    let active = true

    fetch(`/api/offers?type=${activeTab}`)
      .then((res) => res.json())
      .then((data) => {
        if (!active) return
        if (!data.success) {
          setError(data.error?.message || t.common.error)
          setOffers([])
        } else {
          setOffers(data.data || [])
        }
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (!active) return
        console.error('Fetch offers error:', err)
        setError(t.common.error)
        setOffers([])
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeTab, t.common.error])

  const handleTabChange = (tab: OfferListType) => {
    setActiveTab(tab)
    router.replace(`/offers?type=${tab}`)
  }

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            {t.offers.list.title}
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {t.offers.list.description}
          </p>
        </div>

        <button
          onClick={() => fetchOffers(activeTab)}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          {t.offers.list.refresh}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-800 pb-px">
        <button
          onClick={() => handleTabChange('received')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'received'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          {t.offers.list.tabReceived}
        </button>

        <button
          onClick={() => handleTabChange('sent')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'sent'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Send className="w-4 h-4" />
          {t.offers.list.tabSent}
        </button>
      </div>

      {/* Content State */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : offers.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-zinc-950/40 border border-zinc-900 px-4">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-zinc-200">
            {activeTab === 'received' ? t.offers.list.emptyReceived : t.offers.list.emptySent}
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1">
            {activeTab === 'received'
              ? t.offers.list.emptyReceived
              : t.offers.list.emptySent}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>
      )}
    </div>
  )
}
