'use client'

import React from 'react'
import Image from 'next/image'
import { X, Plus, Package, ArrowLeftRight, CheckCircle2, Shield, Star, MapPin, ShieldCheck, Check, Sparkles } from 'lucide-react'
import { mockCurrentUser, mockMyPortfolio } from '@/data/mockData'
import { User, TradeItem } from '@/types'

interface PortfolioModalProps {
  isOpen: boolean
  onClose: () => void
  onOpenCreateItem: () => void
  onOpenTrustVerification?: () => void
  currentUser?: User | null
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  onOpenCreateItem,
  onOpenTrustVerification,
  currentUser,
}) => {
  const activeUser = currentUser || mockCurrentUser
  if (!isOpen) return null

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
                    Verified Swapper
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 flex items-center gap-2 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-zinc-400" /> {activeUser.city}, {activeUser.country}</span>
                <span>•</span>
                <span className="font-bold text-amber-600 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {activeUser.rating}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">{activeUser.completedSwaps} Başarılı Takas</span>
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
              title="JetTrust Profil Doğrulama Merkezini Aç"
            >
              <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                JetTrust Skoru
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
                HAVE Portföyü (PRD Madde 6)
              </div>
              <h4 className="text-lg font-black">Takasa Açık {mockMyPortfolio.length} Eşyanız Listeleniyor</h4>
              <p className="text-xs text-emerald-100 mt-1 max-w-md">
                JetMatch motorumuz portföyünüzdeki eşyaları 7/24 tarayarak aradığınız ürünleri sunan kullanıcılarla sizi eşleştirir.
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
              <span>Yeni Eşya Ekle</span>
            </button>
          </div>

          {/* List of My Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-emerald-600" />
                <span>Portföyümdeki Eşyalar & Takas Kriterleri</span>
              </h4>
              <span className="text-xs text-zinc-400">Durum: Aktif (Yayında)</span>
            </div>

            <div className="space-y-4">
              {mockMyPortfolio.map((item: TradeItem) => (
                <div
                  key={item.id}
                  className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-400 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-zinc-200">
                      <Image src={item.images[0]} alt={item.title} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {item.brand && (
                          <span className="text-[10px] font-bold uppercase bg-zinc-200 text-zinc-700 px-2 py-0.5 rounded-md">
                            {item.brand}
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                          {item.condition}
                        </span>
                        {item.openToOffers && (
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                            Tekliflere Açık
                          </span>
                        )}
                      </div>
                      <h5 className="font-bold text-sm text-zinc-900 mt-1 truncate">{item.title}</h5>
                      <div className="flex items-center gap-1 text-xs text-emerald-800 font-medium mt-1">
                        <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate"><strong>Aradığın (WANT):</strong> {item.targetDescription}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
                    <span className="text-xs bg-emerald-600 text-white font-semibold px-3 py-1 rounded-lg shadow-xs">
                      Aktif İlanda
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy & Contact Reveal Gate Reminder (PRD Madde 19) */}
          <div className="bg-zinc-100 rounded-2xl p-4 border border-zinc-200 flex items-start gap-3 text-xs text-zinc-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-zinc-900 block font-bold mb-0.5">Gizli İletişim Bilgileriniz (PRD Madde 19)</strong>
              Kayıtlı telefonunuz (<strong>{mockCurrentUser.phone}</strong>) ve e-posta adresiniz (<strong>{mockCurrentUser.email}</strong>) takas teklifi iki tarafça kabul edilene kadar diğer kullanıcılardan tamamen gizlidir.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
