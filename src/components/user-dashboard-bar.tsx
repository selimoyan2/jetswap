'use client'

import React from 'react'
import Image from 'next/image'
import { Sparkles, ArrowLeftRight, MessageSquare, ShieldCheck, Plus, Package } from 'lucide-react'
import { mockCurrentUser } from '@/data/mockData'

interface UserDashboardBarProps {
  onOpenSwaps: () => void
  onOpenPortfolio: () => void
  onOpenCreateItem: () => void
  onOpenTrustVerification?: () => void
}

export const UserDashboardBar: React.FC<UserDashboardBarProps> = ({
  onOpenSwaps,
  onOpenPortfolio,
  onOpenCreateItem,
  onOpenTrustVerification,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-600 shrink-0">
            <Image src={mockCurrentUser.avatar} alt={mockCurrentUser.name} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-zinc-900">Günaydın, {mockCurrentUser.name} 👋</h2>
              <button
                type="button"
                onClick={onOpenTrustVerification}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                title="Doğrulama Durumunu Görüntüle"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>{mockCurrentUser.jetTrust} JetTrust (Doğrulanmış)</span>
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Portföyünüzde 2 aktif eşya yayında • 3'lü akıllı takas döngüleri aktif
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          {/* JetTrust Verification modal trigger */}
          <button
            type="button"
            onClick={onOpenTrustVerification}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer border border-amber-200/60"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Doğrulama</span>
          </button>

          {/* Swaps button */}
          <button
            onClick={onOpenSwaps}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            <span>Takaslarım</span>
            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">1 Yeni</span>
          </button>

          {/* Portfolio button */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-teal-600" />
            <span>Portföyüm (2)</span>
          </button>

          {/* New Item button */}
          <button
            onClick={onOpenCreateItem}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni İlan</span>
          </button>
        </div>
      </div>
    </div>
  )
}
