'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Sparkles, HelpCircle, ChevronDown, ChevronUp, 
  RefreshCw, ArrowLeft 
} from 'lucide-react'
import { JetMatchResult } from '@/lib/jetmatch'
import { SourceItemSelector, SelectableSourceItem } from './source-item-selector'
import { MatchSummary, MatchFilterType } from './match-summary'
import { MatchCard } from './match-card'
import { JetMatchEmptyState } from './jetmatch-empty-state'
import { JetMatchLoading } from './jetmatch-loading'

interface CachedMatchData {
  matches: JetMatchResult[]
  totalMatches: number
  code?: string
  sourceItem?: {
    id: string
    title: string
    categoryId?: string
    city?: string
    country?: string
  }
}

export function JetMatchDashboard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlItemId = searchParams.get('itemId')

  const [availableItems, setAvailableItems] = useState<SelectableSourceItem[]>([])
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState(false)

  // Matches state
  const [matchesLoading, setMatchesLoading] = useState(false)
  const [matchesError, setMatchesError] = useState(false)
  const [matchCache, setMatchCache] = useState<Record<string, CachedMatchData>>({})
  const [activeFilter, setActiveFilter] = useState<MatchFilterType>('ALL')
  const [invalidUrlNotice, setInvalidUrlNotice] = useState<string | null>(null)
  const [showHowItWorks, setShowHowItWorks] = useState(false)

  // 1. Fetch user's AVAILABLE items from /api/items/mine
  const loadUserItems = useCallback(async () => {
    setItemsLoading(true)
    setItemsError(false)
    try {
      const res = await fetch('/api/items/mine')
      if (!res.ok) throw new Error('Failed to fetch user items')
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const available: SelectableSourceItem[] = data.data.filter(
          (item: SelectableSourceItem) => item.status === 'AVAILABLE' || item.status === 'ACTIVE'
        )
        setAvailableItems(available)

        if (available.length > 0) {
          if (urlItemId && available.some((i: SelectableSourceItem) => i.id === urlItemId)) {
            setSelectedItemId(urlItemId)
          } else {
            if (urlItemId) {
              setInvalidUrlNotice('Belirtilen ilan takasa uygun değil veya bulunamadı. İlk takasa açık ilanınız gösteriliyor.')
            }
            setSelectedItemId(available[0].id)
            router.replace(`/jetmatch?itemId=${available[0].id}`, { scroll: false })
          }
        }
      } else {
        setAvailableItems([])
      }
    } catch {
      setItemsError(true)
    } finally {
      setItemsLoading(false)
    }
  }, [urlItemId, router])

  useEffect(() => {
    let active = true
    fetch('/api/items/mine')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch user items')
        return res.json()
      })
      .then(data => {
        if (!active) return
        if (data.success && Array.isArray(data.data)) {
          const available: SelectableSourceItem[] = data.data.filter(
            (item: SelectableSourceItem) => item.status === 'AVAILABLE' || item.status === 'ACTIVE'
          )
          setAvailableItems(available)

          if (available.length > 0) {
            if (urlItemId && available.some((i: SelectableSourceItem) => i.id === urlItemId)) {
              setSelectedItemId(urlItemId)
            } else {
              if (urlItemId) {
                setInvalidUrlNotice('Belirtilen ilan takasa uygun değil veya bulunamadı. İlk takasa açık ilanınız gösteriliyor.')
              }
              setSelectedItemId(available[0].id)
              router.replace(`/jetmatch?itemId=${available[0].id}`, { scroll: false })
            }
          }
        }
        setItemsLoading(false)
      })
      .catch(() => {
        if (!active) return
        setItemsError(true)
        setItemsLoading(false)
      })

    return () => {
      active = false
    }
  }, [urlItemId, router])

  // 2. Fetch matches for selected item (manual reload)
  const reloadMatches = useCallback(async (itemId: string) => {
    setMatchesLoading(true)
    setMatchesError(false)

    try {
      const res = await fetch(`/api/jetmatch?itemId=${itemId}&limit=30`)
      if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
          setMatchCache(prev => ({
            ...prev,
            [itemId]: { matches: [], totalMatches: 0, code: 'ITEM_NOT_AVAILABLE' }
          }))
          return
        }
        throw new Error('Failed to fetch jetmatch results')
      }

      const json = await res.json()
      if (json.success && json.data) {
        setMatchCache(prev => ({
          ...prev,
          [itemId]: {
            matches: json.data.matches || [],
            totalMatches: json.data.totalMatches || 0,
            code: json.data.code,
            sourceItem: json.data.sourceItem,
          }
        }))
      } else {
        setMatchesError(true)
      }
    } catch {
      setMatchesError(true)
    } finally {
      setMatchesLoading(false)
    }
  }, [])

  // Trigger matches fetch when selectedItemId changes
  useEffect(() => {
    if (!selectedItemId) return
    if (matchCache[selectedItemId]) return

    let active = true
    Promise.resolve().then(() => {
      if (active) {
        setMatchesLoading(true)
        setMatchesError(false)
      }
    })

    fetch(`/api/jetmatch?itemId=${selectedItemId}&limit=30`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 403 || res.status === 404) {
            return {
              success: true,
              data: { matches: [], totalMatches: 0, code: 'ITEM_NOT_AVAILABLE' }
            }
          }
          throw new Error('Failed to fetch jetmatch results')
        }
        return res.json()
      })
      .then(json => {
        if (!active) return
        if (json.success && json.data) {
          setMatchCache(prev => ({
            ...prev,
            [selectedItemId]: {
              matches: json.data.matches || [],
              totalMatches: json.data.totalMatches || 0,
              code: json.data.code,
              sourceItem: json.data.sourceItem,
            }
          }))
        } else {
          setMatchesError(true)
        }
        setMatchesLoading(false)
      })
      .catch(() => {
        if (!active) return
        setMatchesError(true)
        setMatchesLoading(false)
      })

    return () => {
      active = false
    }
  }, [selectedItemId, matchCache])

  // Handler for user clicking a different item in the selector
  const handleSelectItem = (id: string) => {
    setInvalidUrlNotice(null)
    setSelectedItemId(id)
    setActiveFilter('ALL')
    router.replace(`/jetmatch?itemId=${id}`, { scroll: false })
  }

  // Current active item data & match result
  const activeSourceItem = useMemo(() => {
    return availableItems.find(i => i.id === selectedItemId)
  }, [availableItems, selectedItemId])

  const currentMatchData = selectedItemId ? matchCache[selectedItemId] : null

  // Calculate counts
  const { filteredMatches, mutualCount, oneWayCount, totalCount } = useMemo(() => {
    if (!currentMatchData || !currentMatchData.matches) {
      return { filteredMatches: [], mutualCount: 0, oneWayCount: 0, totalCount: 0 }
    }
    const matches = currentMatchData.matches
    const mutual = matches.filter(m => m.matchType === 'MUTUAL').length
    const oneWay = matches.filter(m => m.matchType === 'ONE_WAY').length

    let list = matches
    if (activeFilter === 'MUTUAL') {
      list = matches.filter(m => m.matchType === 'MUTUAL')
    } else if (activeFilter === 'ONE_WAY') {
      list = matches.filter(m => m.matchType === 'ONE_WAY')
    }

    return {
      filteredMatches: list,
      mutualCount: mutual,
      oneWayCount: oneWay,
      totalCount: currentMatchData.totalMatches,
    }
  }, [currentMatchData, activeFilter])

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white text-xs py-1.5 px-4 text-center font-bold tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
        <span>JetMatch — Akıllı ve Sıfır Nakit Takas Eşleştirme Motoru</span>
      </div>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1 w-full space-y-6 sm:space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Ana Sayfa</span>
              </Link>
              <span className="text-zinc-300">/</span>
              <span className="text-xs font-bold text-emerald-700">JetMatch</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mt-1">
              Jet<span className="text-emerald-600">Match</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 font-medium mt-1">
              Eşyaların için en uygun takas fırsatlarını keşfet.
            </p>
          </div>

          {/* Educational Box Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHowItWorks(!showHowItWorks)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 px-3.5 py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              <span>JetMatch Nasıl Çalışır?</span>
              {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {selectedItemId && (
              <button
                type="button"
                onClick={() => reloadMatches(selectedItemId)}
                disabled={matchesLoading}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-200 px-3 py-2 rounded-xl transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                title="Sonuçları Yenile"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${matchesLoading ? 'animate-spin text-emerald-600' : ''}`} />
                <span className="hidden sm:inline">Yenile</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Educational Box */}
        {showHowItWorks && (
          <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200 shadow-2xs space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-black text-xs sm:text-sm text-emerald-950 uppercase tracking-wide">
                JetMatch Nasıl Çalışır?
              </h3>
            </div>
            <p className="text-xs text-emerald-900 leading-relaxed">
              JetMatch, senin aradığın ürün kategorileri ve kondisyon kriterleri ile karşı tarafın takas tercihlerini deterministik olarak karşılaştırır.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="bg-white/80 border border-emerald-200/60 p-2.5 rounded-xl text-xs text-zinc-800">
                <strong className="block text-emerald-800 font-extrabold mb-0.5">1. Tercihlerini Belirt</strong>
                İlanına ne aradığını (kategori, durum, marka/model) ekle.
              </div>
              <div className="bg-white/80 border border-emerald-200/60 p-2.5 rounded-xl text-xs text-zinc-800">
                <strong className="block text-emerald-800 font-extrabold mb-0.5">2. Akıllı Tarama</strong>
                JetSwap binlerce aktif ilanı ve takas kriterini anlık inceler.
              </div>
              <div className="bg-white/80 border border-emerald-200/60 p-2.5 rounded-xl text-xs text-zinc-800">
                <strong className="block text-emerald-800 font-extrabold mb-0.5">3. Karşılıklı Fırsatlar</strong>
                İki tarafın da istediği ürünlerin buluştuğu ilanlar öne çıkar.
              </div>
            </div>
          </div>
        )}

        {/* Notice for invalid itemId in URL */}
        {invalidUrlNotice && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
            <span>{invalidUrlNotice}</span>
            <button
              type="button"
              onClick={() => setInvalidUrlNotice(null)}
              className="text-amber-700 hover:text-amber-950 font-bold ml-2 cursor-pointer"
            >
              Kapat
            </button>
          </div>
        )}

        {/* Loading state for available items */}
        {itemsLoading && <JetMatchLoading />}

        {/* Error state for fetching items */}
        {!itemsLoading && itemsError && (
          <JetMatchEmptyState type="API_ERROR" onRetry={loadUserItems} />
        )}

        {/* No items empty state */}
        {!itemsLoading && !itemsError && availableItems.length === 0 && (
          <JetMatchEmptyState type="NO_ITEMS" />
        )}

        {/* Content when user has available items */}
        {!itemsLoading && !itemsError && availableItems.length > 0 && (
          <div className="space-y-6 sm:space-y-8">
            {/* Source Item Selector */}
            <SourceItemSelector
              items={availableItems}
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
            />

            {/* Match Results Section */}
            <section aria-label="Eşleşme Sonuçları" className="space-y-6">
              {/* Matches Loading */}
              {matchesLoading && !currentMatchData && <JetMatchLoading />}

              {/* Matches Error */}
              {!matchesLoading && matchesError && (
                <JetMatchEmptyState
                  type="API_ERROR"
                  onRetry={() => selectedItemId && reloadMatches(selectedItemId)}
                />
              )}

              {/* Match States */}
              {!matchesLoading && currentMatchData && (
                <>
                  {currentMatchData.code === 'ITEM_NOT_AVAILABLE' ? (
                    <JetMatchEmptyState
                      type="ITEM_NOT_AVAILABLE"
                      onSelectAvailable={() => handleSelectItem(availableItems[0].id)}
                    />
                  ) : currentMatchData.code === 'NO_WANTS' ? (
                    <JetMatchEmptyState type="NO_WANTS" />
                  ) : currentMatchData.totalMatches === 0 ? (
                    <JetMatchEmptyState type="NO_MATCHES" />
                  ) : (
                    <>
                      {/* Match Summary & Filters */}
                      <MatchSummary
                        totalMatches={totalCount}
                        mutualCount={mutualCount}
                        oneWayCount={oneWayCount}
                        activeFilter={activeFilter}
                        onFilterChange={setActiveFilter}
                      />

                      {/* Filter Results Empty State */}
                      {filteredMatches.length === 0 && (
                        <div className="py-12 text-center text-zinc-500 text-xs bg-white rounded-2xl border border-dashed border-zinc-200 p-6">
                          Bu filtreye uygun takas eşleşmesi bulunamadı.
                        </div>
                      )}

                      {/* Match Cards Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredMatches.map(match => (
                          <MatchCard
                            key={match.candidateItem.id}
                            match={match}
                            sourceItemTitle={activeSourceItem?.title}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </section>
          </div>
        )}
      </main>
    </div>
  )
}
