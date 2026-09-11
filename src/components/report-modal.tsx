'use client'

import React, { useState } from 'react'
import { X, AlertTriangle, ShieldAlert, CheckCircle2, Flag } from 'lucide-react'
import { TradeItem, ReportReason } from '@/types'
import { useLanguage } from '@/i18n'

interface ReportModalProps {
  item: TradeItem | null
  isOpen: boolean
  onClose: () => void
}

export const ReportModal: React.FC<ReportModalProps> = ({ item, isOpen, onClose }) => {
  const { t } = useLanguage()
  const [reason, setReason] = useState<ReportReason>('CASH_DEMAND')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen || !item) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setDetails('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-zinc-200">
        <div className="px-6 py-4 bg-red-50 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-700">
            <ShieldAlert className="w-5 h-5" />
            <h3 className="font-bold text-sm">{t.reportModal.title}</h3>
          </div>
          <button onClick={handleResetAndClose} className="text-zinc-400 hover:text-zinc-700 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-900">{t.common.success}</h4>
            <p className="text-xs text-zinc-600 max-w-xs mx-auto">
              {t.reportModal.success}
            </p>
            <button
              onClick={handleResetAndClose}
              className="mt-3 bg-zinc-900 text-white text-xs font-bold px-5 py-2 rounded-xl cursor-pointer"
            >
              {t.common.close}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              {item.title} ({item.user.name})
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                {t.reportModal.reasonLabel}
              </label>
              <select
                value={reason}
                onChange={e => setReason(e.target.value as ReportReason)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 cursor-pointer"
              >
                <option value="CASH_DEMAND">{t.reportModal.reasons.CASH_DEMAND}</option>
                <option value="FAKE_PRODUCT">{t.reportModal.reasons.FAKE_PRODUCT}</option>
                <option value="FORBIDDEN_ITEM">{t.reportModal.reasons.FORBIDDEN_ITEM}</option>
                <option value="WRONG_CATEGORY">{t.reportModal.reasons.WRONG_CATEGORY}</option>
                <option value="SPAM">{t.reportModal.reasons.SPAM}</option>
                <option value="OTHER">{t.reportModal.reasons.OTHER}</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 block mb-1.5">
                {t.reportModal.detailsLabel}
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder={t.reportModal.detailsPlaceholder}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{t.reportModal.submit}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
