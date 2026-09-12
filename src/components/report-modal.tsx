'use client'

import React, { useState } from 'react'
import { 
  X, ShieldAlert, CheckCircle2, Flag, ArrowRight, ArrowLeft, 
  DollarSign, AlertTriangle, Clock, MessageSquareWarning, PackageX, 
  ExternalLink, UserX, Ban, HelpCircle, Shield
} from 'lucide-react'
import { TradeItem, ReportCategory, UserReport } from '@/types'
import { useLanguage } from '@/i18n'
import { createReport } from '@/data/mockReports'
import { mockCurrentUser } from '@/data/mockData'

interface ReportModalProps {
  item?: TradeItem | null
  user?: { id: string; name: string; avatar?: string; jetTrust?: number } | null
  isOpen: boolean
  onClose: () => void
  onReportSubmitted?: (report: UserReport) => void
}

interface CategoryOption {
  id: ReportCategory
  icon: React.ElementType
  color: string
}

const CATEGORY_ICONS: CategoryOption[] = [
  { id: 'CASH_DEMAND', icon: DollarSign, color: 'text-red-600 bg-red-50 border-red-200' },
  { id: 'FAKE_PRODUCT', icon: PackageX, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'NO_SHOW_SAFE_ZONE', icon: Clock, color: 'text-orange-600 bg-orange-50 border-orange-200' },
  { id: 'ABUSIVE_BEHAVIOR', icon: MessageSquareWarning, color: 'text-rose-600 bg-rose-50 border-rose-200' },
  { id: 'DEFECTIVE_ITEM', icon: AlertTriangle, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
  { id: 'EXTERNAL_COMMUNICATION', icon: ExternalLink, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'FRAUD_ATTEMPT', icon: UserX, color: 'text-purple-600 bg-purple-50 border-purple-200' },
  { id: 'FORBIDDEN_ITEM', icon: Ban, color: 'text-zinc-700 bg-zinc-100 border-zinc-200' },
  { id: 'OTHER', icon: HelpCircle, color: 'text-zinc-600 bg-zinc-50 border-zinc-200' },
]

export const ReportModal: React.FC<ReportModalProps> = ({ 
  item, 
  user, 
  isOpen, 
  onClose,
  onReportSubmitted 
}) => {
  const { t } = useLanguage()
  const [step, setStep] = useState<1 | 2>(1)
  const [category, setCategory] = useState<ReportCategory>('CASH_DEMAND')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!isOpen) return null

  // Resolve target user & item
  const targetUser = user || (item ? {
    id: item.user.id,
    name: item.user.name,
    avatar: item.user.avatar,
    jetTrust: item.user.jetTrust
  } : {
    id: 'unknown_usr',
    name: 'Kullanıcı',
    jetTrust: 50
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (details.trim().length < 15) {
      setErrorMsg(t.reportModal.detailsMinLengthWarning)
      return
    }

    const newRep = createReport({
      reporterId: mockCurrentUser.id,
      reporterName: mockCurrentUser.name,
      reporterTrust: mockCurrentUser.jetTrust,
      reportedUserId: targetUser.id,
      reportedUserName: targetUser.name,
      reportedUserTrust: targetUser.jetTrust,
      itemId: item?.id,
      itemTitle: item?.title,
      category,
      details: details.trim()
    })

    if (onReportSubmitted) {
      onReportSubmitted(newRep)
    }

    setSubmitted(true)
  }

  const handleResetAndClose = () => {
    setSubmitted(false)
    setStep(1)
    setCategory('CASH_DEMAND')
    setDetails('')
    setErrorMsg('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight">
                {item ? t.reportModal.title : t.reportModal.reportUserTitle}
              </h3>
              <p className="text-[11px] text-red-100 font-medium">{t.reportModal.subtitle}</p>
            </div>
          </div>
          <button 
            onClick={handleResetAndClose} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Entity Card */}
        <div className="px-6 py-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-zinc-500 font-semibold">{t.reportModal.reportedUserLabel}</span>
            <span className="font-bold text-zinc-900 bg-white px-2 py-0.5 rounded-md border border-zinc-200 shadow-xs">
              {targetUser.name}
            </span>
            {targetUser.jetTrust !== undefined && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                JT: {targetUser.jetTrust}
              </span>
            )}
          </div>
          {item && (
            <div className="text-right text-zinc-500 truncate max-w-[200px]">
              <span className="font-semibold text-zinc-400">{t.reportModal.reportedItemLabel}</span> {item.title}
            </div>
          )}
        </div>

        {/* Modal Body */}
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-lg font-black text-zinc-900">{t.common.success}</h4>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto mt-1 leading-relaxed">
                {t.reportModal.success}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-left max-w-sm mx-auto text-xs space-y-1">
              <div className="text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Şikayet Özeti</div>
              <div className="font-semibold text-zinc-800">
                Kategori: <span className="text-red-600 font-bold">{t.reportModal.reasons[category]}</span>
              </div>
              <div className="text-zinc-500 line-clamp-2 italic">"{details}"</div>
            </div>
            <button
              onClick={handleResetAndClose}
              className="mt-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer shadow-md transition-colors"
            >
              {t.common.close}
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Step Navigation Tabs */}
            <div className="flex items-center gap-2 mb-5">
              <div className={`flex-1 flex items-center gap-2 pb-2 border-b-2 font-bold text-xs transition-colors ${
                step === 1 ? 'border-red-600 text-red-600' : 'border-zinc-200 text-zinc-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 1 ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-600'
                }`}>1</span>
                <span>{t.reportModal.step1Title}</span>
              </div>
              <div className={`flex-1 flex items-center gap-2 pb-2 border-b-2 font-bold text-xs transition-colors ${
                step === 2 ? 'border-red-600 text-red-600' : 'border-zinc-200 text-zinc-400'
              }`}>
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step === 2 ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-600'
                }`}>2</span>
                <span>{t.reportModal.step2Title}</span>
              </div>
            </div>

            {/* STEP 1: Select Category */}
            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-600 font-semibold">{t.reportModal.selectCategory}</p>

                <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2">
                  {CATEGORY_ICONS.map(cat => {
                    const IconComponent = cat.icon
                    const isSelected = category === cat.id
                    const title = t.reportModal.reasons[cat.id]
                    const descKey = `${cat.id}_DESC` as keyof typeof t.reportModal.reasons
                    const desc = t.reportModal.reasons[descKey] || ''

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-red-600 bg-red-50/50 shadow-xs ring-1 ring-red-500' 
                            : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${cat.color}`}>
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className={`text-xs font-bold ${isSelected ? 'text-red-900' : 'text-zinc-900'}`}>
                              {title}
                            </h4>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-red-600 bg-red-600' : 'border-zinc-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          {desc && (
                            <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                              {desc}
                            </p>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>{t.reportModal.nextStep}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Detailed Explanation */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center gap-2.5">
                  <span className="text-xs font-bold text-zinc-500">Seçilen Neden:</span>
                  <span className="text-xs font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                    {t.reportModal.reasons[category]}
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-600">
                      {t.reportModal.detailsLabel}
                    </label>
                    <span className={`text-[11px] font-mono ${details.length < 15 ? 'text-amber-600' : 'text-emerald-600 font-bold'}`}>
                      {details.length} / 500 karakter
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={500}
                    value={details}
                    onChange={e => {
                      setDetails(e.target.value)
                      if (errorMsg) setErrorMsg('')
                    }}
                    placeholder={t.reportModal.detailsPlaceholder}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-3.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                  />
                  {errorMsg && (
                    <p className="text-[11px] text-red-600 font-bold mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{errorMsg}</span>
                    </p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-800 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    <strong>Güvenlik Notu:</strong> Asılsız veya kötü niyetli şikayetlerde bulunan hesapların JetTrust puanı cezalandırılır. Bildiriminiz süperadmin tarafından incelenecek ve gerekiyorsa karşı taraftan savunma istenecektir.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{t.reportModal.prevStep}</span>
                  </button>
                  <div className="flex items-center gap-2">
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
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

