'use client'

import React from 'react'
import Link from 'next/link'
import { Compass, Sparkles, Plus, ArrowLeftRight, User } from 'lucide-react'
import { useLanguage } from '@/i18n'

interface MobileBottomNavProps {
  onOpenCreateItem: () => void
  onOpenSwaps: () => void
  onOpenPortfolio: () => void
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenCreateItem,
  onOpenSwaps,
  onOpenPortfolio,
}) => {
  const { t } = useLanguage()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-3 py-2 flex items-center justify-around md:hidden shadow-lg">
      {/* Keşfet */}
      <Link href="#kesfet" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-emerald-600">
        <Compass className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t.bottomNav.explore}</span>
      </Link>

      {/* JetMatch */}
      <Link href="/jetmatch" className="flex flex-col items-center gap-1 text-zinc-600 hover:text-emerald-600">
        <Sparkles className="w-5 h-5 text-amber-500" />
        <span className="text-[10px] font-bold">{t.bottomNav.jetMatch}</span>
      </Link>

      {/* Center (+) CTA Button */}
      <button
        onClick={onOpenCreateItem}
        className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title={t.bottomNav.addListing}
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Takaslarım */}
      <button
        onClick={onOpenSwaps}
        className="flex flex-col items-center gap-1 text-zinc-600 hover:text-emerald-600 cursor-pointer relative"
      >
        <ArrowLeftRight className="w-5 h-5 text-emerald-600" />
        <span className="text-[10px] font-bold">{t.bottomNav.swaps}</span>
        <span className="w-2 h-2 rounded-full bg-emerald-600 absolute top-0 right-2 ring-2 ring-white" />
      </button>

      {/* Profil / Portföy */}
      <button
        onClick={onOpenPortfolio}
        className="flex flex-col items-center gap-1 text-zinc-600 hover:text-emerald-600 cursor-pointer"
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-bold">{t.bottomNav.profile}</span>
      </button>
    </div>
  )
}
