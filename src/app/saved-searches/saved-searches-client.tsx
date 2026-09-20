'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import {
  Bookmark,
  ArrowLeft,
  ArrowLeftRight,
  Trash2,
  Edit2,
  ExternalLink,
  Search,
  Tag,
  MapPin,
  Check,
  X,
} from 'lucide-react'
import { PublicSavedSearch } from '@/lib/saved-searches'

interface SavedSearchesClientProps {
  initialSearches: PublicSavedSearch[]
  userName: string
}

export function SavedSearchesClient({ initialSearches, userName }: SavedSearchesClientProps) {
  const [searches, setSearches] = useState<PublicSavedSearch[]>(initialSearches)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (actionLoading) return
    setActionLoading(id)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/saved-searches/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setSearches(prev => prev.filter(s => s.id !== id))
      } else {
        const data = await res.json()
        setErrorMessage(data.error?.message || 'Arama silinirken bir hata oluştu.')
      }
    } catch {
      setErrorMessage('Bağlantı hatası oluştu.')
    } finally {
      setActionLoading(null)
    }
  }

  const startEdit = (s: PublicSavedSearch) => {
    setEditingId(s.id)
    setEditName(s.name)
    setErrorMessage(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleSaveRename = async (id: string) => {
    const trimmed = editName.trim()
    if (!trimmed || trimmed.length > 80) {
      setErrorMessage('Arama adı 1 ile 80 karakter arasında olmalıdır.')
      return
    }

    setActionLoading(id)
    setErrorMessage(null)

    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSearches(prev => prev.map(s => (s.id === id ? data.data : s)))
        setEditingId(null)
        setEditName('')
      } else {
        setErrorMessage(data.error?.message || 'Güncelleme başarısız oldu.')
      }
    } catch {
      setErrorMessage('Bağlantı hatası oluştu.')
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-2xs">
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
            <span>Ana Sayfa</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-6 h-6 text-emerald-600 fill-emerald-600" />
              <h1 className="text-2xl font-black text-zinc-900 tracking-tight">Kayıtlı Aramalarım</h1>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Sık kullandığınız takas arama ve filtre kriterleri ({searches.length})
            </p>
          </div>

          <Link
            href="/#kesfet"
            className="inline-flex items-center justify-center gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Yeni Arama Yap</span>
          </Link>
        </div>

        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {searches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-zinc-200 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Bookmark className="w-8 h-8 stroke-1" />
            </div>
            <h3 className="text-base font-extrabold text-zinc-900 mb-1">
              Henüz kayıtlı bir aramanız yok
            </h3>
            <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
              Takas vitrininde ilgilendiğiniz kategori, şehir veya kelime filtrelerini uyguladıktan sonra &quot;Aramayı Kaydet&quot; butonuna basarak arama kriterlerinizi kaydedebilirsiniz.
            </p>
            <Link
              href="/#kesfet"
              className="inline-flex items-center justify-center gap-2 text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              <Search className="w-4 h-4" />
              <span>İlanları Filtrele</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {searches.map(s => {
              const isEditing = editingId === s.id
              const isLoading = actionLoading === s.id

              return (
                <div
                  key={s.id}
                  className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div>
                    {/* Title / Rename Row */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            maxLength={80}
                            className="text-xs font-bold px-2.5 py-1.5 border border-emerald-500 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(s.id)}
                            disabled={isLoading}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                            title="Kaydet"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="p-1.5 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 cursor-pointer"
                            title="İptal"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <Bookmark className="w-4 h-4 text-emerald-600 shrink-0" />
                          <h3 className="font-extrabold text-sm text-zinc-900 line-clamp-1">
                            {s.name}
                          </h3>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(s)}
                            disabled={isLoading}
                            className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors cursor-pointer"
                            title="Yeniden Adlandır"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id)}
                            disabled={isLoading}
                            className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Criteria Badges */}
                    <div className="flex flex-wrap gap-1.5">
                      {s.query && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg">
                          <Search className="w-3 h-3 text-zinc-500" />
                          <span>&quot;{s.query}&quot;</span>
                        </span>
                      )}

                      {s.category && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-lg">
                          <Tag className="w-3 h-3 text-emerald-600" />
                          <span>{s.category.nameTr}</span>
                        </span>
                      )}

                      {s.city && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/60 px-2.5 py-1 rounded-lg">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span>{s.city}</span>
                        </span>
                      )}

                      {s.condition && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-800 border border-purple-200/60 px-2.5 py-1 rounded-lg">
                          <span>{s.condition}</span>
                        </span>
                      )}

                      {s.tradeMethod && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                          <span>{s.tradeMethod}</span>
                        </span>
                      )}

                      {!s.query && !s.category && !s.city && !s.condition && !s.tradeMethod && (
                        <span className="text-[11px] text-zinc-400 font-medium italic">
                          Tüm İlanlar (Filtresiz)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Open Search Action */}
                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400">
                      Kayıt: {new Date(s.createdAt).toLocaleDateString('tr-TR')}
                    </span>

                    <Link
                      href={s.searchUrl}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition-colors shadow-2xs"
                    >
                      <span>Aramayı Aç</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
