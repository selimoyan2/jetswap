'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { 
  X, Plus, Package, ArrowLeftRight, CheckCircle2, Star, MapPin, 
  ShieldCheck, Sparkles, Archive, RefreshCw, ExternalLink, Loader2 
} from 'lucide-react'
import { mockCurrentUser, mockMyPortfolio } from '@/data/mockData'
import { User, ItemCondition } from '@/types'
import { useLanguage } from '@/i18n'
import { getConditionLabel } from '@/i18n/helpers'

interface PortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenCreateItem: () => void
  onOpenTrustVerification?: () => void
  currentUser?: User | null
}

type PortfolioTab = 'AVAILABLE' | 'PENDING_TRADE' | 'TRADED' | 'ARCHIVED'

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateItem,
  onOpenTrustVerification,
  currentUser,
}) => {
  const { t, language } = useLanguage()
  const activeUser = currentUser || mockCurrentUser
  const [activeTab, setActiveTab] = useState<PortfolioTab>('AVAILABLE')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch real user items from /api/items/mine
  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)

    fetch('/api/items/mine')
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return
        if (data.success && Array.isArray(data.data)) {
          setItems(data.data)
        } else {
          // Fallback to mock portfolio if not authenticated or empty
          setItems(mockMyPortfolio)
        }
      })
      .catch(() => {
        if (isMounted) setItems(mockMyPortfolio)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen])

  if (!isOpen) return null

  // Handle Archive Item
  const handleArchive = async (itemId: string) => {
    setActionLoading(itemId)
    try {
      const res = await fetch(`/api/items/${itemId}/archive`, {
        method: 'PATCH'
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'ARCHIVED' } : i))
      }
    } catch (err) {
      console.error('Archive error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Handle Reactivate Item
  const handleReactivate = async (itemId: string) => {
    setActionLoading(itemId)
    try {
      const res = await fetch(`/api/items/${itemId}/reactivate`, {
        method: 'PATCH'
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setItems(prev => prev.map(i => i.id === itemId ? { ...i, status: 'AVAILABLE' } : i))
      }
    } catch (err) {
      console.error('Reactivate error:', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Filter items by tab
  const filteredItems = items.filter(item => {
    const status = item.status === 'ACTIVE' ? 'AVAILABLE' : item.status
    return status === activeTab
  })

  const tabCounts = {
    AVAILABLE: items.filter(i => (i.status === 'AVAILABLE' || i.status === 'ACTIVE')).length,
    PENDING_TRADE: items.filter(i => i.status === 'PENDING_TRADE').length,
    TRADED: items.filter(i => i.status === 'TRADED').length,
    ARCHIVED: items.filter(i => i.status === 'ARCHIVED').length,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-zinc-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-600 shrink-0">
              <Image src={activeUser.avatar} alt={activeUser.name} fill className="object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-zinc-900">{activeUser.name}</h3>
                {activeUser.verifiedSwapper && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    {t.portfolioModal.verifiedSwapper}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-400" /> {activeUser.city}, {activeUser.country}</span>
                <span>•</span>
                <span className="font-bold text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {activeUser.rating}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">{activeUser.completedSwaps} {t.portfolioModal.successfulSwaps}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* JetTrust Score & Verification Modal Trigger */}
            <button
              type="button"
              onClick={() => {
                onClose()
                if (onOpenTrustVerification) onOpenTrustVerification()
              }}
              className="hidden sm:flex flex-col items-end bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl text-right transition-colors cursor-pointer"
              title="JetTrust"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {t.portfolioModal.jetTrustScore}
              </span>
              <span className="text-base font-black text-emerald-950 leading-none">{activeUser.jetTrust} / 100</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-zinc-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Banner: Swap Portfolio */}
          <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-white/10 text-emerald-200 text-[10px] font-bold uppercase mb-1">
                <Sparkles className="w-3 h-3" />
                {t.portfolioModal.bannerBadge}
              </div>
              <h4 className="text-lg font-black">{t.portfolioModal.bannerTitle.replace('{count}', String(items.length))}</h4>
              <p className="text-xs text-emerald-100 mt-1 max-w-md">
                {t.portfolioModal.bannerDesc}
              </p>
            </div>
            <button
              onClick={() => {
                onClose()
                onOpenCreateItem()
              }}
              className="shrink-0 flex items-center gap-1.5 bg-white text-emerald-900 font-bold text-xs px-4 py-2.5 rounded-xl shadow-md hover:bg-emerald-50 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.portfolioModal.addNewItem}</span>
            </button>
          </div>

          {/* Status Tabs (Step 17: AVAILABLE, PENDING_TRADE, TRADED, ARCHIVED) */}
          <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('AVAILABLE')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'AVAILABLE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>Takasa Açık</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'AVAILABLE' ? 'bg-emerald-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                {tabCounts.AVAILABLE}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PENDING_TRADE')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'PENDING_TRADE'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>Takas Sürecinde</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'PENDING_TRADE' ? 'bg-amber-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                {tabCounts.PENDING_TRADE}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('TRADED')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'TRADED'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>Takaslandı</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'TRADED' ? 'bg-blue-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                {tabCounts.TRADED}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ARCHIVED')}
              className={`px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'ARCHIVED'
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              <span>Arşiv</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === 'ARCHIVED' ? 'bg-zinc-700 text-white' : 'bg-zinc-200 text-zinc-700'}`}>
                {tabCounts.ARCHIVED}
              </span>
            </button>
          </div>

          {/* List of Items */}
          <div>
            {loading ? (
              <div className="py-12 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs">Portföyünüz yükleniyor...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-12 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 p-6 space-y-3">
                <Package className="w-10 h-10 text-zinc-300 mx-auto" />
                <h5 className="font-bold text-sm text-zinc-800">
                  {activeTab === 'AVAILABLE' ? 'Takasa açık eşyanız bulunmuyor.' :
                   activeTab === 'ARCHIVED' ? 'Arşivlenmiş ilanınız bulunmuyor.' :
                   activeTab === 'TRADED' ? 'Henüz tamamlanmış bir takasınız yok.' :
                   'Şu anda takas sürecinde bir eşyanız yok.'}
                </h5>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  {activeTab === 'AVAILABLE' && 'Elinizdeki kullanmadığınız eşyaları ekleyerek takas topluluğuna katılın.'}
                </p>
                {activeTab === 'AVAILABLE' && (
                  <button
                    onClick={() => {
                      onClose()
                      onOpenCreateItem()
                    }}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Hemen İlan Ekle</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-400 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                        <Image
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.brand && (
                            <span className="text-[10px] font-bold uppercase bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md">
                              {item.brand}
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            {getConditionLabel(item.condition as ItemCondition, language)}
                          </span>
                        </div>
                        <h5 className="font-bold text-sm text-zinc-900 mt-1 truncate">{item.title}</h5>
                        <div className="flex items-center gap-1 text-xs text-emerald-800 font-medium mt-1">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate"><strong>Aranan:</strong> {item.targetDescription}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions: View Detail, Archive, Reactivate */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <Link
                        href={`/items/${item.id}`}
                        target="_blank"
                        className="text-xs bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1"
                        title="İlanı Görüntüle"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Görüntüle</span>
                      </Link>

                      {item.status === 'ARCHIVED' ? (
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => handleReactivate(item.id)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
                          title="Yeniden Yayına Al"
                        >
                          {actionLoading === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          <span>Yayınla</span>
                        </button>
                      ) : (item.status === 'AVAILABLE' || item.status === 'ACTIVE') ? (
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => handleArchive(item.id)}
                          className="text-xs bg-zinc-200 hover:bg-zinc-300 disabled:opacity-50 text-zinc-700 font-semibold px-3 py-1.5 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
                          title="İlanı Arşivle"
                        >
                          {actionLoading === item.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Archive className="w-3.5 h-3.5" />
                          )}
                          <span>Arşivle</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-zinc-100 rounded-2xl p-4 border border-zinc-200 flex items-start gap-3 text-xs text-zinc-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-900 block font-bold mb-0.5">{t.portfolioModal.privacyNoticeTitle}</strong>
              {t.portfolioModal.privacyNoticeDesc.replace('{phone}', activeUser.phone || '').replace('{email}', activeUser.email || '')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
