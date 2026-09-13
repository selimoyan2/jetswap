'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeftRight, ArrowLeft, Plus, Package, ExternalLink, 
  Archive, RefreshCw, Loader2, ShieldCheck, Tag 
} from 'lucide-react'

type PortfolioTab = 'AVAILABLE' | 'PENDING_TRADE' | 'TRADED' | 'ARCHIVED'

const CONDITION_LABELS: Record<string, string> = {
  BRAND_NEW: 'Sıfır / Kutusunda',
  LIKE_NEW: 'Sıfıra Yakın',
  GOOD: 'İyi Durumda',
  FAIR: 'Kullanılmış',
}

export default function ProfileItemsPage() {
  const [activeTab, setActiveTab] = useState<PortfolioTab>('AVAILABLE')
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const fetchItems = () => {
    setLoading(true)
    fetch('/api/items/mine')
      .then(res => {
        if (res.status === 401) {
          setError('Bu sayfayı görüntülemek için lütfen giriş yapınız.')
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data && data.success && Array.isArray(data.data)) {
          setItems(data.data)
        }
      })
      .catch(() => {
        setError('İlanlar yüklenirken bir hata oluştu.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchItems()
  }, [])

  const handleArchive = async (itemId: string) => {
    setActionLoading(itemId)
    try {
      const res = await fetch(`/api/items/${itemId}/archive`, { method: 'PATCH' })
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

  const handleReactivate = async (itemId: string) => {
    setActionLoading(itemId)
    try {
      const res = await fetch(`/api/items/${itemId}/reactivate`, { method: 'PATCH' })
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
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-zinc-900">
              Jet<span className="text-emerald-600">Swap</span>
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-emerald-700 bg-zinc-100 hover:bg-emerald-50 px-3.5 py-2 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anasayfa</span>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">
              Takas Portföyüm & İlanlarım
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              JetSwap üzerindeki tüm eşyalarınızı, durumlarını ve takas süreçlerinizi buradan yönetin.
            </p>
          </div>

          <Link
            href="/?create=true"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İlan Ekle</span>
          </Link>
        </div>

        {error ? (
          <div className="p-6 bg-white rounded-3xl border border-zinc-200 text-center space-y-3">
            <p className="text-xs text-red-600 font-bold">{error}</p>
            <Link
              href="/login?callbackUrl=/profile/items"
              className="inline-block bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs"
            >
              Giriş Yap
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-6">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 overflow-x-auto text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('AVAILABLE')}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
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

            {/* List */}
            {loading ? (
              <div className="py-16 text-center text-zinc-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                <span className="text-xs font-semibold">İlanlarınız yükleniyor...</span>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="py-16 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 p-8 space-y-3">
                <Package className="w-12 h-12 text-zinc-300 mx-auto" />
                <h3 className="font-bold text-sm text-zinc-800">
                  {activeTab === 'AVAILABLE' ? 'Takasa açık eşyanız bulunmuyor.' :
                   activeTab === 'ARCHIVED' ? 'Arşivlenmiş ilanınız bulunmuyor.' :
                   activeTab === 'TRADED' ? 'Henüz tamamlanmış bir takasınız yok.' :
                   'Şu anda takas sürecinde bir eşyanız yok.'}
                </h3>
                {activeTab === 'AVAILABLE' && (
                  <Link
                    href="/?create=true"
                    className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs hover:bg-emerald-700"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Hemen İlan Ekle</span>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item: any) => (
                  <div
                    key={item.id}
                    className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-300 transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="relative w-18 h-18 rounded-xl overflow-hidden shrink-0 border border-zinc-200 bg-white">
                        <Image
                          src={item.images?.[0] || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80'}
                          alt={item.title}
                          fill
                          sizes="72px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {item.category && (
                            <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Tag className="w-3 h-3" />
                              {item.category.nameTr}
                            </span>
                          )}
                          <span className="text-[10px] font-bold uppercase bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md">
                            {CONDITION_LABELS[item.condition] || item.condition}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-zinc-900 truncate">{item.title}</h4>
                        <div className="flex items-center gap-1 text-xs text-emerald-800 font-medium mt-1">
                          <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate"><strong>Aranan:</strong> {item.targetDescription}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                      <Link
                        href={`/items/${item.id}`}
                        target="_blank"
                        className="text-xs bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-200 font-semibold px-3 py-2 rounded-xl shadow-2xs flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Görüntüle</span>
                      </Link>

                      {item.status === 'ARCHIVED' ? (
                        <button
                          type="button"
                          disabled={actionLoading === item.id}
                          onClick={() => handleReactivate(item.id)}
                          className="text-xs bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold px-3 py-2 rounded-xl shadow-xs flex items-center gap-1 cursor-pointer"
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
                          className="text-xs bg-zinc-200 hover:bg-zinc-300 disabled:opacity-50 text-zinc-700 font-semibold px-3 py-2 rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer"
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
        )}
      </main>
    </div>
  )
}
