'use client'

import React from 'react'
import Image from 'next/image'
import { Sparkles, ArrowLeftRight, MessageSquare, ShieldCheck, Plus, Package, Settings, MapPin, Ban, Lock } from 'lucide-react'
import { User, UserSanction } from '@/types'
import { useLanguage } from '@/i18n'
import { isUserTradeRestricted } from '@/data/mockReports'
import { JetTrustDetailModal } from '@/components/jettrust'

interface UserDashboardBarProps {
  currentUser: User
  onOpenSwaps: () => void
  onOpenPortfolio: () => void
  onOpenCreateItem: () => void
  onOpenTrustVerification?: () => void
  onOpenEditProfile?: () => void
}

export const UserDashboardBar: React.FC<UserDashboardBarProps> = ({
  currentUser,
  onOpenSwaps,
  onOpenPortfolio,
  onOpenCreateItem,
  onOpenTrustVerification,
  onOpenEditProfile,
}) => {
  const { t } = useLanguage()
  const [restriction, setRestriction] = React.useState(() => isUserTradeRestricted(currentUser.id))
  const [trustModalOpen, setTrustModalOpen] = React.useState(false)

  const handleTrustClick = () => {
    if (onOpenTrustVerification) {
      onOpenTrustVerification()
    } else {
      setTrustModalOpen(true)
    }
  }

  React.useEffect(() => {
    const handleUpdate = () => {
      setRestriction(isUserTradeRestricted(currentUser.id))
    }
    window.addEventListener('jetswap_sanctions_updated', handleUpdate)
    window.addEventListener('jetswap_reports_updated', handleUpdate)
    return () => {
      window.removeEventListener('jetswap_sanctions_updated', handleUpdate)
      window.removeEventListener('jetswap_reports_updated', handleUpdate)
    }
  }, [currentUser.id])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      <div className="bg-white rounded-3xl border border-zinc-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* User Info */}
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onOpenEditProfile}
            className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-600 shrink-0 hover:opacity-90 transition-opacity cursor-pointer group"
            title={t.nav.editProfile}
          >
            <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Settings className="w-4 h-4" />
            </div>
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-black text-zinc-900">{t.dashboardBar.greeting}, {currentUser.name} 👋</h2>
              
              <button
                type="button"
                onClick={handleTrustClick}
                className="text-[10px] bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                title={t.trustCenter.title}
              >
                <ShieldCheck className="w-3 h-3 text-emerald-700" />
                <span>{currentUser.jetTrust} JetTrust {currentUser.verifiedSwapper ? `(${t.trustCenter.verifiedBadge})` : ''}</span>
              </button>

              <button
                type="button"
                onClick={onOpenEditProfile}
                className="text-[11px] text-zinc-500 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Settings className="w-3 h-3" />
                <span>{t.nav.editProfile}</span>
              </button>
            </div>

            <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-emerald-600" />
              <span>{currentUser.district ? `${currentUser.district}, ` : ''}{currentUser.city}</span>
              <span>•</span>
              <span>{currentUser.completedSwaps} {t.mySwaps.tabCompleted}</span>
              <span>•</span>
              {restriction.restricted ? (
                <span className="text-red-700 bg-red-100 font-bold px-2 py-0.5 rounded-full border border-red-200 flex items-center gap-1 text-[11px]">
                  <Ban className="w-3 h-3 text-red-600" />
                  <span>
                    {restriction.sanction ? (t.moderation.sanctionTypes[restriction.sanction.type] || restriction.sanction.type) : 'Hesap Kısıtlı'}
                  </span>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold">{t.dashboardBar.activeStatus}</span>
              )}
            </p>
          </div>
        </div>

        {/* Action Widgets */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          {/* JetTrust Verification modal trigger */}
          <button
            type="button"
            onClick={handleTrustClick}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-all cursor-pointer border border-amber-200/60"
          >
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>JetTrust</span>
          </button>

          {/* Swaps button */}
          <button
            onClick={onOpenSwaps}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
            <span>{t.dashboardBar.mySwaps}</span>
            <span className="bg-emerald-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full">1</span>
          </button>

          {/* Portfolio button */}
          <button
            onClick={onOpenPortfolio}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Package className="w-4 h-4 text-teal-600" />
            <span>{t.dashboardBar.myPortfolio}</span>
          </button>

          {/* New Listing button */}
          <button
            onClick={onOpenCreateItem}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs font-black transition-all shadow-xs cursor-pointer ${
              restriction.restricted
                ? 'bg-zinc-700 hover:bg-zinc-800 opacity-90'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {restriction.restricted ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Plus className="w-4 h-4" />}
            <span>{t.dashboardBar.newListing}</span>
          </button>
        </div>
      </div>

      <JetTrustDetailModal
        isOpen={trustModalOpen}
        onClose={() => setTrustModalOpen(false)}
        userId={currentUser.id}
        userName={currentUser.name}
      />
    </div>
  )
}
