'use client'

import React from 'react'
import { X, Ban, ShieldAlert, Clock, AlertTriangle, Scale } from 'lucide-react'
import { UserSanction } from '@/types'
import { useLanguage } from '@/i18n'

interface SanctionRestrictionModalProps {
  isOpen: boolean
  onClose: () => void
  sanction?: UserSanction | null
  actionType: 'TRADE_OFFER' | 'CREATE_LISTING'
}

export const SanctionRestrictionModal: React.FC<SanctionRestrictionModalProps> = ({
  isOpen,
  onClose,
  sanction,
  actionType,
}) => {
  const { t } = useLanguage()

  if (!isOpen) return null

  const isTradeOffer = actionType === 'TRADE_OFFER'
  const sanctionTypeLabel = sanction 
    ? (t.moderation.sanctionTypes[sanction.type] || sanction.type)
    : 'Hesap Askıya Alma'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-red-200 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Ban className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base tracking-tight">
                İşlem Engellendi: Hesap Kısıtlı
              </h3>
              <p className="text-[11px] text-red-100">Disiplin yaptırımı nedeniyle erişim kısıtlandı</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-red-900 uppercase tracking-wider">
                {sanctionTypeLabel}
              </span>
              <span className="text-[10px] font-bold bg-red-200 text-red-900 px-2 py-0.5 rounded-full">
                Kısıtlama Aktif
              </span>
            </div>

            {sanction?.reason && (
              <p className="text-xs text-red-800 font-medium">
                <strong>Yaptırım Gerekçesi:</strong> {sanction.reason}
              </p>
            )}

            {sanction?.expiresAt && (
              <p className="text-[11px] text-red-700 flex items-center gap-1.5 font-semibold pt-1 border-t border-red-200/60">
                <Clock className="w-3.5 h-3.5 text-red-600" />
                <span>Kısıtlama Bitiş: {new Date(sanction.expiresAt).toLocaleString('tr-TR')}</span>
              </p>
            )}
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 space-y-1 leading-relaxed">
            <p className="font-bold text-zinc-800">
              {isTradeOffer 
                ? '⛔ Yaptırım süresi boyunca yeni takas teklifi gönderemezsiniz.'
                : '⛔ Yaptırım süresi boyunca vitrine yeni takas ilanı ekleyemezsiniz.'
              }
            </p>
            <p className="text-[11px] text-zinc-500">
              Topluluk güvenliği ve adil takas kuralları gereği, hesabınızdaki yaptırım sona erene kadar bu özellik geçici olarak kilitlenmiştir.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-black py-3 rounded-xl shadow-md cursor-pointer transition-colors"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  )
}
export default SanctionRestrictionModal
