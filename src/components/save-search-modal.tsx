'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Bookmark, X, Check, Loader2 } from 'lucide-react'

interface SaveSearchModalProps {
  isOpen: boolean
  onClose: () => void
  query?: string
  category?: string
  city?: string
  condition?: string
  tradeMethod?: string
  isLoggedIn: boolean
  onRequireAuth?: () => void
}

export function SaveSearchModal({
  isOpen,
  onClose,
  query = '',
  category = 'all',
  city = 'all',
  condition,
  tradeMethod,
  isLoggedIn,
  onRequireAuth,
}: SaveSearchModalProps) {
  // Generate a smart default name based on current filters
  const defaultName = [
    city && city !== 'all' ? city : null,
    category && category !== 'all' ? category : null,
    query ? `"${query}"` : null,
  ]
    .filter(Boolean)
    .join(' ') || 'Tüm İlanlar Araması'

  const [name, setName] = useState(defaultName)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn) {
      onClose()
      if (onRequireAuth) {
        onRequireAuth()
      } else {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`
      }
      return
    }

    const trimmedName = name.trim()
    if (!trimmedName || trimmedName.length > 80) {
      setErrorMessage('Arama adı 1 ile 80 karakter arasında olmalıdır.')
      return
    }

    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await fetch('/api/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          query: query.trim() || undefined,
          categoryId: category !== 'all' ? category : undefined,
          city: city !== 'all' ? city : undefined,
          condition: condition || undefined,
          tradeMethod: tradeMethod || undefined,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(true)
        setTimeout(() => {
          setSuccess(false)
          onClose()
        }, 1500)
      } else {
        setErrorMessage(data.error?.message || 'Arama kaydedilirken bir hata oluştu.')
      }
    } catch {
      setErrorMessage('Bağlantı hatası oluştu.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-zinc-200 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-zinc-900">Aramayı Kaydet</h3>
            <p className="text-xs text-zinc-500">Mevcut filtreleri daha sonra tekrar kullanmak için kaydedin</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-extrabold text-sm text-zinc-900">Arama Başarıyla Kaydedildi!</h4>
            <p className="text-xs text-zinc-500">
              <Link href="/saved-searches" className="text-emerald-600 font-bold hover:underline">
                Kayıtlı Aramalarım
              </Link>{' '}
              sayfasından görüntüleyebilirsiniz.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">Arama Adı</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={80}
                required
                placeholder="Örn: İstanbul Kamp Malzemeleri"
                className="w-full text-xs font-medium px-3 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
                autoFocus
              />
              <span className="text-[10px] text-zinc-400 mt-1 block text-right">{name.length}/80</span>
            </div>

            {/* Current Criteria Summary */}
            <div className="p-3 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block tracking-wider">
                Kaydedilecek Filtreler:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {query && (
                  <span className="bg-white border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                    Kelime: &quot;{query}&quot;
                  </span>
                )}
                {category && category !== 'all' && (
                  <span className="bg-white border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                    Kategori: {category}
                  </span>
                )}
                {city && city !== 'all' && (
                  <span className="bg-white border border-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md font-medium">
                    Şehir: {city}
                  </span>
                )}
                {!query && category === 'all' && city === 'all' && (
                  <span className="text-zinc-400 italic text-[11px]">Tüm vitrin ilanları</span>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMessage}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>Kaydet</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
