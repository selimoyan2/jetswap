'use client'

import React from 'react'
import Link from 'next/link'
import { Package, ArrowLeftRight, Sparkles, AlertCircle, RefreshCw, Plus, Settings } from 'lucide-react'

export type EmptyStateType = 'NO_ITEMS' | 'NO_WANTS' | 'NO_MATCHES' | 'ITEM_NOT_AVAILABLE' | 'API_ERROR'

interface JetMatchEmptyStateProps {
  type: EmptyStateType
  onRetry?: () => void
  onSelectAvailable?: () => void
}

export const JetMatchEmptyState: React.FC<JetMatchEmptyStateProps> = ({
  type,
  onRetry,
  onSelectAvailable,
}) => {
  switch (type) {
    case 'NO_ITEMS':
      return (
        <div className="py-16 px-6 text-center bg-white border border-dashed border-zinc-300 rounded-3xl max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-zinc-900">
              Henüz JetMatch yapabileceğimiz bir eşyan yok.
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Takasa bir eşya eklediğinde sana uygun eşleşmeleri burada göstereceğiz.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/?create=true"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Eşya Ekle</span>
            </Link>
          </div>
        </div>
      )

    case 'NO_WANTS':
      return (
        <div className="py-16 px-6 text-center bg-white border border-dashed border-amber-300 rounded-3xl max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-zinc-900">
              Bu eşya için henüz ne istediğini belirtmedin.
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              JetMatch&apos;in eşleşme bulabilmesi için takas tercihlerini ekle.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/profile/items"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              <span>Takas Tercihlerini Düzenle</span>
            </Link>
          </div>
        </div>
      )

    case 'NO_MATCHES':
      return (
        <div className="py-16 px-6 text-center bg-white border border-zinc-200 rounded-3xl max-w-xl mx-auto space-y-5 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 mx-auto">
            <Sparkles className="w-8 h-8 text-amber-500" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-zinc-900">
              Şimdilik uygun eşleşme bulamadık.
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Yeni ilanlar eklendikçe JetMatch sonuçların değişebilir.
            </p>
          </div>

          <div className="bg-zinc-50 border border-zinc-200/80 rounded-2xl p-4 text-left max-w-md mx-auto space-y-2">
            <h4 className="text-xs font-black text-zinc-800 uppercase tracking-wider">
              Eşleşme ihtimalini artırmak için ipuçları:
            </h4>
            <ul className="text-xs text-zinc-600 space-y-1.5 list-disc list-inside">
              <li>Takas tercihlerini biraz esnet (örn. benzer ürünlere açık seçeneği)</li>
              <li>Farklı takas kategorileri ekle</li>
              <li>İlan bilgilerini ve fotoğraflarını güncel tut</li>
            </ul>
          </div>

          <div className="pt-1">
            <Link
              href="/profile/items"
              className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-4 py-2.5 rounded-xl transition-colors"
            >
              <span>İlan Tercihlerini Yönet</span>
            </Link>
          </div>
        </div>
      )

    case 'ITEM_NOT_AVAILABLE':
      return (
        <div className="py-14 px-6 text-center bg-white border border-amber-200 rounded-3xl max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-zinc-900">
              Bu ilan için JetMatch kullanılamıyor.
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Yalnızca takasa açık (AVAILABLE) ilanlarınız için JetMatch eşleşmesi hesaplanabilir.
            </p>
          </div>
          {onSelectAvailable && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onSelectAvailable}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <span>Takasa Açık İlanlarıma Dön</span>
              </button>
            </div>
          )}
        </div>
      )

    case 'API_ERROR':
    default:
      return (
        <div className="py-16 px-6 text-center bg-white border border-red-200 rounded-3xl max-w-xl mx-auto space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-zinc-900">
              JetMatch sonuçları şu anda yüklenemedi.
            </h3>
            <p className="text-xs text-zinc-600 max-w-md mx-auto leading-relaxed">
              Geçici bir bağlantı sorunu oluştu. Lütfen tekrar deneyin.
            </p>
          </div>
          {onRetry && (
            <div className="pt-2">
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Tekrar Dene</span>
              </button>
            </div>
          )}
        </div>
      )
  }
}
